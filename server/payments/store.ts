import mysql, { type RowDataPacket } from "mysql2/promise";
import { randomUUID } from "node:crypto";
import type { PaidOrder } from "./core";

export type OrderJob = { id: string; kind: "customer" | "owner" | "buyer-list";
  order: PaidOrder; providerKey: string; attempts: number };
export interface OrderStore {
  recordPaidOrder(order: PaidOrder): Promise<void>;
  claim(): Promise<OrderJob | null>;
  finish(job: OrderJob): Promise<void>;
  fail(job: OrderJob, reason: string, retry: boolean): Promise<void>;
}

export function mysqlOrderStore(databaseUrl: string): OrderStore {
  const pool = mysql.createPool(databaseUrl);
  return {
    async recordPaidOrder(order) {
      const db = await pool.getConnection();
      try {
        await db.beginTransaction();
        await db.execute("INSERT IGNORE INTO payment_orders (session_id, payload) VALUES (?, ?)",
          [order.sessionId, JSON.stringify(order)]);
        for (const kind of ["buyer-list", "owner", "customer"]) {
          await db.execute("INSERT IGNORE INTO payment_outbox (id, session_id, kind, provider_key) VALUES (?, ?, ?, ?)",
            [`${order.sessionId}:${kind}`, order.sessionId, kind, randomUUID()]);
        }
        await db.commit();
      } catch (error) { await db.rollback(); throw error; }
      finally { db.release(); }
    },
    async claim() {
      const db = await pool.getConnection();
      try {
        await db.beginTransaction();
        // Do not automatically resend an ambiguous email after Brevo's idempotency window.
        await db.execute("UPDATE payment_outbox SET status='review' WHERE status IN ('pending','processing') AND first_attempt_at IS NOT NULL AND (first_attempt_at < DATE_SUB(NOW(), INTERVAL 14 MINUTE) OR attempts >= 5) AND (lease_until IS NULL OR lease_until < NOW())");
        const [rows] = await db.query<RowDataPacket[]>("SELECT j.*, o.payload FROM payment_outbox j JOIN payment_orders o ON o.session_id=j.session_id WHERE (j.status='pending' AND j.next_attempt_at <= NOW()) OR (j.status='processing' AND j.lease_until < NOW()) ORDER BY j.created_at, FIELD(j.kind,'buyer-list','owner','customer') LIMIT 1 FOR UPDATE");
        if (!rows.length) { await db.commit(); return null; }
        const row = rows[0];
        await db.execute("UPDATE payment_outbox SET status='processing', attempts=attempts+1, first_attempt_at=COALESCE(first_attempt_at,NOW()), lease_until=DATE_ADD(NOW(), INTERVAL 2 MINUTE) WHERE id=?", [row.id]);
        await db.commit();
        return { id: row.id, kind: row.kind, providerKey: row.provider_key,
          attempts: row.attempts + 1, order: typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload };
      } catch (error) { await db.rollback(); throw error; }
      finally { db.release(); }
    },
    async finish(job) {
      await pool.execute("UPDATE payment_outbox SET status='done', lease_until=NULL, completed_at=NOW(), last_error=NULL WHERE id=? AND provider_key=?", [job.id, job.providerKey]);
    },
    async fail(job, reason, retry) {
      await pool.execute("UPDATE payment_outbox SET status=?, lease_until=NULL, next_attempt_at=DATE_ADD(NOW(), INTERVAL ? SECOND), last_error=? WHERE id=?",
        [retry && job.attempts < 5 ? "pending" : "review", Math.min(120, 10 * 2 ** (job.attempts - 1)), reason.slice(0, 100), job.id]);
    },
  };
}
