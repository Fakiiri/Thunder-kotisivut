import { createHash, randomUUID } from "node:crypto";
import mysql, { type RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import {
  inspectManuscript,
  MAX_MANUSCRIPT,
  orderCustomerSchema,
} from "../../shared/manuscript";
import { printQuote, coverGeometry } from "../../shared/print-production";
import { CoverVault, VaultCrypto, type VaultRow } from "./vault";
import type { CoverProject } from "../../client/src/lib/cover/model";

export const SUBMISSION_RETENTION_MS = 30 * 86400000;
export const submissionSchema = z
  .object({
    requestId: z.string().uuid(),
    revision: z.number().int().positive(),
    customer: orderCustomerSchema,
    filename: z
      .string()
      .min(1)
      .max(180)
      .refine(s => !/[\x00-\x1f\x7f/\\]/.test(s)),
    manuscript: z
      .string()
      .min(4)
      .max(Math.ceil(MAX_MANUSCRIPT / 3) * 4),
    confirmedPages: z.boolean(),
    permission: z.literal(true),
  })
  .strict();
export type SubmissionInput = z.infer<typeof submissionSchema>;
export type SubmissionReceipt = {
  id: string;
  status: "awaiting_review";
  totalCents: number;
  provisional: boolean;
  expires: number;
};
export type Submission = {
  receipt: SubmissionReceipt;
  customer: SubmissionInput["customer"];
  project: CoverProject;
  projectId: string;
  revision: number;
  manuscript: string;
  filename: "sisus.pdf" | "kasikirjoitus.docx";
  digest: string;
  geometry: ReturnType<typeof coverGeometry>;
  quote: NonNullable<ReturnType<typeof printQuote>>;
  receivedAt: number;
  // Files are quarantined attachments, NOT certified malware-free or print-ready.
  review: "required";
};
export type SubmissionNotice = {
  row: VaultRow;
  lease: string;
  key: string;
  attempts: number;
};
export interface SubmissionRepository {
  get(id: string): Promise<VaultRow | null>;
  insert(row: VaultRow): Promise<void>;
  prune(now: number): Promise<void>;
}
// The insert quota and idempotency decision must be serialized across replicas.
export class MysqlSubmissionRepository implements SubmissionRepository {
  private pool;
  constructor(url: string) {
    this.pool = mysql.createPool({ uri: url, connectionLimit: 2 });
  }
  async init() {
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_submissions (id VARCHAR(110) PRIMARY KEY, owner CHAR(64) NOT NULL, expires BIGINT NOT NULL, payload LONGBLOB NOT NULL, notify_state VARCHAR(16) NOT NULL DEFAULT 'pending', mail_key CHAR(36) NOT NULL, attempts INT NOT NULL DEFAULT 0, first_attempt BIGINT NULL, next_attempt BIGINT NOT NULL DEFAULT 0, lease_key CHAR(36) NULL, lease_until BIGINT NOT NULL DEFAULT 0, KEY retention (expires), KEY own (owner))"
    );
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_submission_lock (id INT PRIMARY KEY)"
    );
    await this.pool.query(
      "INSERT IGNORE INTO cover_submission_lock (id) VALUES (1)"
    );
  }
  async get(id: string) {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      "SELECT * FROM cover_submissions WHERE id=?",
      [id]
    );
    const r = rows[0];
    return r
      ? {
          id: r.id,
          owner: r.owner,
          kind: "project" as const,
          expires: Number(r.expires),
          revision: 1,
          payload: r.payload as Buffer,
        }
      : null;
  }
  async insert(row: VaultRow) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.query(
        "SELECT id FROM cover_submission_lock WHERE id=1 FOR UPDATE"
      );
      const [old] = await db.execute<RowDataPacket[]>(
        "SELECT id FROM cover_submissions WHERE id=?",
        [row.id]
      );
      if (old.length) throw Error("duplicate");
      const [quota] = await db.execute<RowDataPacket[]>(
        "SELECT COALESCE(SUM(OCTET_LENGTH(payload)),0) AS total, COALESCE(SUM(owner=?),0) AS own FROM cover_submissions",
        [row.owner]
      );
      if (
        Number(quota[0].own) >= 2 ||
        Number(quota[0].total) + row.payload.length > 128 * 1024 * 1024
      )
        throw Error("quota");
      await db.execute(
        "INSERT INTO cover_submissions (id,owner,expires,payload,mail_key) VALUES (?,?,?,?,?)",
        [row.id, row.owner, row.expires, row.payload, randomUUID()]
      );
      await db.commit();
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async prune(now: number) {
    await this.pool.execute("DELETE FROM cover_submissions WHERE expires<=?", [
      now,
    ]);
  }
  async claimNotice(now = Date.now()): Promise<SubmissionNotice | null> {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.query(
        "SELECT id FROM cover_submission_lock WHERE id=1 FOR UPDATE"
      );
      await db.execute(
        "UPDATE cover_submissions SET notify_state='review',lease_key=NULL,lease_until=0 WHERE notify_state IN ('pending','processing') AND lease_until<=? AND first_attempt IS NOT NULL AND (notify_state='processing' OR first_attempt<? OR attempts>=5)",
        [now, now - 14 * 60000]
      );
      const [rows] = await db.execute<RowDataPacket[]>(
        "SELECT * FROM cover_submissions WHERE expires>? AND next_attempt<=? AND lease_until<=? AND notify_state IN ('pending','processing') ORDER BY expires LIMIT 1 FOR UPDATE",
        [now, now, now]
      );
      const r = rows[0];
      if (!r) {
        await db.commit();
        return null;
      }
      const lease = randomUUID();
      await db.execute(
        "UPDATE cover_submissions SET notify_state='processing', attempts=attempts+1, first_attempt=COALESCE(first_attempt,?),lease_key=?,lease_until=? WHERE id=?",
        [now, lease, now + 120000, r.id]
      );
      await db.commit();
      return {
        row: {
          id: r.id,
          owner: r.owner,
          kind: "project",
          expires: Number(r.expires),
          revision: 1,
          payload: r.payload,
        },
        lease,
        key: r.mail_key,
        attempts: Number(r.attempts) + 1,
      };
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async finishNotice(job: SubmissionNotice) {
    await this.pool.execute(
      "UPDATE cover_submissions SET notify_state='done',lease_key=NULL,lease_until=0 WHERE id=? AND lease_key=?",
      [job.row.id, job.lease]
    );
  }
  async failNotice(job: SubmissionNotice, retry: boolean) {
    await this.pool.execute(
      "UPDATE cover_submissions SET notify_state=?,next_attempt=?,lease_key=NULL,lease_until=0 WHERE id=? AND lease_key=?",
      [
        retry && job.attempts < 5 ? "pending" : "review",
        Date.now() + Math.min(120000, 10000 * 2 ** job.attempts),
        job.row.id,
        job.lease,
      ]
    );
  }
  async close() {
    await this.pool.end();
  }
}

export class CoverSubmissions {
  constructor(
    private vault: CoverVault,
    private repo: SubmissionRepository,
    private crypt: VaultCrypto,
    private now = Date.now
  ) {}
  private key(owner: string, requestId: string) {
    return owner + ":" + requestId;
  }
  private receipt(row: VaultRow, digest?: string) {
    const saved = this.crypt.open<Submission>(row);
    if (digest && saved.digest !== digest) throw Error("conflict");
    return saved.receipt;
  }
  async submit(session: string, projectId: string, unknownInput: unknown) {
    const user = await this.vault.identity(session);
    if (!user) throw Error("unauthorized");
    const input = submissionSchema.parse(unknownInput);
    // The authenticated address is authoritative; no third-party receipt target.
    if (input.customer.email.trim().toLowerCase() !== user.email.toLowerCase())
      throw Error("email-mismatch");
    const id = this.key(user.owner, input.requestId);
    const digest = createHash("sha256")
      .update(JSON.stringify({ projectId, ...input }))
      .digest("hex");
    const old = await this.repo.get(id);
    if (old && old.expires > this.now()) return this.receipt(old, digest);
    if (
      !(await this.vault.throttle(user.owner, "submission", 3)) ||
      !(await this.vault.throttle("all", "submission-global", 30))
    )
      throw Error("rate");
    const saved = await this.vault.getProject(session, projectId);
    if (!saved) throw Error("not-found");
    if (saved.revision !== input.revision) throw Error("conflict");
    const p = saved.project;
    if (p.production.quantity > 200) throw Error("quote-required");
    if (p.production.interior === "ready" && !input.confirmedPages)
      throw Error("pages-unconfirmed");
    const bytes = Buffer.from(input.manuscript, "base64");
    if (
      bytes.toString("base64") !== input.manuscript ||
      bytes.length > MAX_MANUSCRIPT
    )
      throw Error("invalid-file");
    let kind: "pdf" | "docx";
    try {
      kind = await inspectManuscript(new File([bytes], input.filename));
    } catch {
      throw Error("invalid-file");
    }
    if (kind === "docx" && p.production.interior !== "layout")
      throw Error("layout-required");
    const quote = printQuote(p.production);
    if (!quote || quote.totalCents === null) throw Error("quote-required");
    const receipt: SubmissionReceipt = {
      id: input.requestId,
      status: "awaiting_review",
      totalCents: quote.totalCents,
      provisional: p.production.interior === "layout",
      expires: this.now() + SUBMISSION_RETENTION_MS,
    };
    const value: Submission = {
      receipt,
      customer: { ...input.customer, email: user.email },
      project: p,
      projectId,
      revision: saved.revision,
      manuscript: input.manuscript,
      filename: kind === "pdf" ? "sisus.pdf" : "kasikirjoitus.docx",
      digest,
      geometry: coverGeometry(p.production),
      quote,
      receivedAt: this.now(),
      review: "required",
    };
    // Encrypt manuscript, contact details and immutable cover snapshot together.
    const row: VaultRow = {
      id,
      owner: user.owner,
      kind: "project",
      revision: 1,
      expires: receipt.expires,
      payload: this.crypt.seal(id, value),
    };
    await this.repo.prune(this.now());
    try {
      await this.repo.insert(row);
    } catch (e) {
      if (!(e instanceof Error) || e.message !== "duplicate") throw e;
      const existing = await this.repo.get(id);
      if (!existing) throw e;
      return this.receipt(existing, digest);
    }
    return receipt;
  }
  async paymentSource(session: string, requestId: string) {
    const user = await this.vault.identity(session);
    if (!user) throw Error("unauthorized");
    if (!z.string().uuid().safeParse(requestId).success)
      throw Error("not-found");
    const row = await this.repo.get(this.key(user.owner, requestId));
    if (!row || row.expires <= this.now()) throw Error("not-found");
    return { owner: user.owner, source: this.crypt.open<Submission>(row) };
  }
  async getReceipt(session: string, requestId: string) {
    const user = await this.vault.identity(session);
    if (!user) throw Error("unauthorized");
    if (!z.string().uuid().safeParse(requestId).success) return null;
    const row = await this.repo.get(this.key(user.owner, requestId));
    return row && row.expires > this.now() ? this.receipt(row) : null;
  }
}
