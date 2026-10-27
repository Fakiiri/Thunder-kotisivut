import mysql, { type RowDataPacket } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import { VaultCrypto, type VaultRow } from "./vault";
import type {
  ApprovedPrintQuote,
  PrintCheckoutAttempt,
  PrintCheckoutSession,
} from "./checkout";
import type { OrderCustomer } from "../../shared/manuscript";

export type CoverCheckoutRecord = {
  id: string;
  owner: string;
  quote: ApprovedPrintQuote;
  customer: OrderCustomer;
  state: "quoted" | "creating" | "open" | "paid" | "review";
  attempt: PrintCheckoutAttempt | null;
  session: PrintCheckoutSession | null;
  paidEvent?: { eventId: string; sessionId: string };
};
export interface CoverCheckoutStore {
  get(id: string): Promise<CoverCheckoutRecord | null>;
  create(record: CoverCheckoutRecord): Promise<CoverCheckoutRecord>;
  update<T>(id: string, action: (record: CoverCheckoutRecord) => T): Promise<T>;
}
export class MysqlCoverCheckoutStore implements CoverCheckoutStore {
  private pool;
  constructor(
    url: string,
    private crypt: VaultCrypto
  ) {
    this.pool = mysql.createPool({ uri: url, connectionLimit: 2 });
  }
  async init() {
    // Existing fulfillment tables must already be usable; do not silently accept money without them.
    await this.pool.query("SELECT session_id FROM payment_orders LIMIT 0");
    await this.pool.query("SELECT id FROM payment_outbox LIMIT 0");
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_checkouts (id CHAR(36) PRIMARY KEY, owner CHAR(64) NOT NULL, state VARCHAR(16) NOT NULL, payload LONGBLOB NOT NULL, updated_ms BIGINT NOT NULL, KEY own(owner))"
    );
  }
  private decode(row: RowDataPacket): CoverCheckoutRecord {
    return this.crypt.open<CoverCheckoutRecord>({
      id: "cover-checkout:" + row.id,
      kind: "project",
      owner: row.owner,
      expires: 0,
      revision: 1,
      payload: row.payload,
    } satisfies VaultRow);
  }
  async get(id: string) {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      "SELECT * FROM cover_checkouts WHERE id=?",
      [id]
    );
    return rows[0] ? this.decode(rows[0]) : null;
  }
  async create(record: CoverCheckoutRecord) {
    await this.pool.execute(
      "INSERT IGNORE INTO cover_checkouts (id,owner,state,payload,updated_ms) VALUES (?,?,?,?,?)",
      [
        record.id,
        record.owner,
        record.state,
        this.crypt.seal("cover-checkout:" + record.id, record),
        Date.now(),
      ]
    );
    const saved = await this.get(record.id);
    if (
      !saved ||
      saved.owner !== record.owner ||
      saved.quote.sourceDigest !== record.quote.sourceDigest
    )
      throw Error("checkout-conflict");
    return saved;
  }
  async update<T>(
    id: string,
    action: (record: CoverCheckoutRecord) => T
  ): Promise<T> {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM cover_checkouts WHERE id=? FOR UPDATE",
        [id]
      );
      if (!rows[0]) throw Error("not-found");
      const record = this.decode(rows[0]),
        before = record.state;
      const result = action(record);
      if (record.id !== id || record.owner !== rows[0].owner)
        throw Error("checkout-conflict");
      if (before !== "paid" && record.state === "paid") {
        if (!record.paidEvent || !record.session)
          throw Error("payment-evidence-required");
        const order = {
          sessionId: record.session.id,
          eventId: record.paidEvent.eventId,
          packageId: "painatus",
          email: record.quote.email,
          name: record.customer.name,
          amountTotal: record.quote.totalCents,
          currency: "eur",
          coverRequestId: record.id,
        };
        await db.execute(
          "INSERT IGNORE INTO payment_orders (session_id,payload) VALUES (?,?)",
          [order.sessionId, JSON.stringify(order)]
        );
        for (const kind of ["buyer-list", "owner", "customer"]) {
          await db.execute(
            "INSERT IGNORE INTO payment_outbox (id,session_id,kind,provider_key) VALUES (?,?,?,?)",
            [order.sessionId + ":" + kind, order.sessionId, kind, randomUUID()]
          );
        }
      }
      await db.execute(
        "UPDATE cover_checkouts SET state=?,payload=?,updated_ms=? WHERE id=?",
        [
          record.state,
          this.crypt.seal("cover-checkout:" + id, record),
          Date.now(),
          id,
        ]
      );
      await db.commit();
      return result;
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async close() {
    await this.pool.end();
  }
}
