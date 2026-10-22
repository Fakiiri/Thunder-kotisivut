import mysql, { type RowDataPacket, type Pool } from "mysql2/promise";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { QuizAnswers } from "../../shared/publication-quiz";
export type Lead = {
  id: string;
  email: string;
  name: string;
  answers: QuizAnswers;
  marketing: boolean;
  token: string;
  source: string;
  createdAt?: string;
};
export type Job = {
  id: string;
  kind: string;
  key: string;
  attempts: number;
  lead: Lead;
  details?: string;
};
export function leadId(email: string, date = new Date()) {
  return createHash("sha256")
    .update(`${email.toLowerCase().trim()}:${date.toISOString().slice(0, 10)}`)
    .digest("hex");
}
export class QuizStore {
  pool: Pool;
  constructor(url: string) {
    this.pool = mysql.createPool(url);
  }
  async init() {
    await this.pool.query(`CREATE TABLE IF NOT EXISTS quiz_leads (
      id VARCHAR(64) PRIMARY KEY, email VARCHAR(254) NOT NULL, name VARCHAR(100) NOT NULL,
      answers JSON NOT NULL, marketing BOOLEAN NOT NULL, permission_text TEXT NOT NULL,
      token VARCHAR(64) NOT NULL UNIQUE, request_key VARCHAR(36) NOT NULL, source VARCHAR(80) NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, booked_at DATETIME NULL,
      INDEX(email), INDEX(created_at))`);
    await this.pool.query(`CREATE TABLE IF NOT EXISTS quiz_suppression (
      email VARCHAR(254) PRIMARY KEY, reason VARCHAR(30) NOT NULL, created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
    await this.pool.query(`CREATE TABLE IF NOT EXISTS quiz_outbox (
      id VARCHAR(110) PRIMARY KEY, lead_id VARCHAR(64) NOT NULL, kind VARCHAR(25) NOT NULL,
      provider_key VARCHAR(36) NOT NULL, details TEXT NULL, status VARCHAR(15) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0, due_at DATETIME NOT NULL, first_attempt_at DATETIME NULL,
      lease_until DATETIME NULL, completed_at DATETIME NULL, last_error VARCHAR(100) NULL,
      INDEX(status,due_at), FOREIGN KEY (lead_id) REFERENCES quiz_leads(id) ON DELETE CASCADE)`);
  }
  async save(
    input: Omit<Lead, "id" | "token">,
    permission: string,
    requestKey: string
  ) {
    const id = leadId(input.email);
    const token = randomBytes(32).toString("hex");
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      const [insert] = await db.execute<mysql.ResultSetHeader>(
        "INSERT IGNORE INTO quiz_leads (id,email,name,answers,marketing,permission_text,token,request_key,source) VALUES (?,?,?,?,?,?,?,?,?)",
        [
          id,
          input.email,
          input.name,
          JSON.stringify(input.answers),
          input.marketing,
          permission,
          token,
          requestKey,
          input.source,
        ]
      );
      if (insert.affectedRows)
        for (const [kind, days] of [
          ["result", 0],
          ["owner", 0],
          ["contact", 0],
          ...(input.marketing
            ? [
                ["day2", 2],
                ["day5", 5],
              ]
            : []),
        ] as [string, number][]) {
          await db.execute(
            "INSERT INTO quiz_outbox (id,lead_id,kind,provider_key,due_at) VALUES (?,?,?,?,DATE_ADD(NOW(), INTERVAL ? DAY))",
            [`${id}:${kind}`, id, kind, randomUUID(), days]
          );
        }
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT token,request_key FROM quiz_leads WHERE id=?",
        [id]
      );
      // A repeated email alone must never disclose somebody else's personal result link.
      await db.commit();
      return {
        id,
        token:
          rows[0].request_key === requestKey ? (rows[0].token as string) : null,
      };
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async find(token: string): Promise<Lead | null> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM quiz_leads WHERE token=?",
      [token]
    );
    return rows.length ? this.read(rows[0]) : null;
  }
  read(row: RowDataPacket): Lead {
    return {
      id: row.lead_id || row.id,
      email: row.email,
      name: row.name,
      answers:
        typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers,
      marketing: !!row.marketing,
      token: row.token,
      source: row.source,
      createdAt: String(row.created_at),
    };
  }
  async suppress(email: string, reason: string) {
    await this.pool.execute(
      "INSERT INTO quiz_suppression(email,reason) VALUES (?,?) ON DUPLICATE KEY UPDATE reason=VALUES(reason)",
      [email, reason]
    );
    await this.pool.execute(
      "INSERT IGNORE INTO quiz_outbox(id,lead_id,kind,provider_key,due_at) SELECT CONCAT(id,':stop-marketing'),id,'stop-marketing',UUID(),NOW() FROM quiz_leads WHERE email=?",
      [email]
    );
  }
  async suppressed(lead: Lead) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT 1 FROM quiz_suppression WHERE email=? UNION SELECT 1 FROM quiz_leads WHERE email=? AND booked_at IS NOT NULL LIMIT 1",
      [lead.email, lead.email]
    );
    if (rows.length) return true;
    // A paid webhook stops follow-ups even before its Brevo buyer-list job finishes.
    const [orders] = await this.pool.query<RowDataPacket[]>(
      "SELECT 1 FROM payment_orders WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(payload,'$.email')))=? LIMIT 1",
      [lead.email]
    );
    return !!orders.length;
  }
  async book(lead: Lead, details: string) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.execute("UPDATE quiz_leads SET booked_at=NOW() WHERE id=?", [
        lead.id,
      ]);
      for (const kind of [
        "booking-owner",
        "booking-customer",
        "stop-marketing",
      ])
        await db.execute(
          "INSERT IGNORE INTO quiz_outbox(id,lead_id,kind,provider_key,details,due_at) VALUES (?,?,?,?,?,NOW())",
          [`${lead.id}:${kind}`, lead.id, kind, randomUUID(), details]
        );
      await db.commit();
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async pauseForCalendar(lead: Lead) {
    await this.pool.execute(
      "UPDATE quiz_leads SET booked_at=NOW() WHERE id=?",
      [lead.id]
    );
    await this.pool.execute(
      "INSERT IGNORE INTO quiz_outbox(id,lead_id,kind,provider_key,due_at) VALUES (?,?, 'stop-marketing',?,NOW())",
      [`${lead.id}:stop-marketing`, lead.id, randomUUID()]
    );
  }
  async claim(): Promise<Job | null> {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.execute(
        "UPDATE quiz_outbox SET status='review' WHERE status IN ('pending','processing') AND first_attempt_at < DATE_SUB(NOW(), INTERVAL 14 MINUTE) AND (lease_until IS NULL OR lease_until<NOW())"
      );
      const [rows] = await db.query<
        RowDataPacket[]
      >(`SELECT j.*, l.email,l.name,l.answers,l.marketing,l.token,l.source,l.created_at FROM quiz_outbox j JOIN quiz_leads l ON l.id=j.lead_id
        WHERE (j.status='pending' AND j.due_at<=NOW()) OR (j.status='processing' AND j.lease_until<NOW()) ORDER BY j.due_at LIMIT 1 FOR UPDATE`);
      if (!rows.length) {
        await db.commit();
        return null;
      }
      const row = rows[0];
      await db.execute(
        "UPDATE quiz_outbox SET status='processing',attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,NOW()),lease_until=DATE_ADD(NOW(), INTERVAL 2 MINUTE) WHERE id=?",
        [row.id]
      );
      await db.commit();
      return {
        id: row.id,
        kind: row.kind,
        key: row.provider_key,
        attempts: row.attempts + 1,
        lead: this.read(row),
        details: row.details,
      };
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async finish(job: Job, status = "done") {
    await this.pool.execute(
      "UPDATE quiz_outbox SET status=?,completed_at=NOW(),lease_until=NULL WHERE id=? AND provider_key=?",
      [status, job.id, job.key]
    );
  }
  async fail(job: Job, retry: boolean) {
    await this.pool.execute(
      "UPDATE quiz_outbox SET status=?,lease_until=NULL,due_at=DATE_ADD(NOW(), INTERVAL 30 SECOND),last_error='Provider delivery failed' WHERE id=?",
      [retry && job.attempts < 5 ? "pending" : "review", job.id]
    );
  }
  async cleanup() {
    // Tokens and pending jobs expire with the lead. Keep opt-outs to prevent re-enrolment.
    await this.pool.execute(
      "DELETE FROM quiz_leads WHERE created_at < DATE_SUB(NOW(), INTERVAL 180 DAY)"
    );
  }
  async expiredEmails(): Promise<string[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT email FROM quiz_leads GROUP BY email HAVING MAX(created_at)<DATE_SUB(NOW(),INTERVAL 180 DAY)"
    );
    return rows.map(row => row.email);
  }
}
