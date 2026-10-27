import type { CoverSyncJob } from "./sync";
import type { JourneyAudience } from "../../shared/cover-journey";
import {
  createHash,
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomUUID,
} from "node:crypto";
import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import {
  projectSchema,
  type CoverProject,
} from "../../client/src/lib/cover/model";
export type VaultRow = {
  id: string;
  kind: "link" | "session" | "project" | "consent" | "readiness";
  owner: string;
  expires: number;
  revision: number;
  payload: Buffer;
  summary?: Buffer;
};
export interface VaultRepository {
  queueSync(owner: string): Promise<void>;

  projectSave(row: VaultRow, expected: number): Promise<void>;
  prune(now: number): Promise<void>;
  takeLink(id: string, now: number): Promise<VaultRow | null>;
  get(id: string): Promise<VaultRow | null>;
  save(row: VaultRow, expectedRevision?: number): Promise<boolean>;
  list(owner: string, kind: VaultRow["kind"]): Promise<VaultRow[]>;
  remove(owner: string, id: string): Promise<void>;
  rate(
    key: string,
    limit: number,
    windowMs: number,
    now: number
  ): Promise<boolean>;
}
export class VaultCrypto {
  constructor(private key: Buffer) {
    if (key.length !== 32) throw Error("Cover encryption key must be 32 bytes");
  }
  id(value: string) {
    return createHmac("sha256", this.key).update(value).digest("hex");
  }
  seal(id: string, value: unknown) {
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", this.key, iv);
    cipher.setAAD(Buffer.from(id));
    const body = Buffer.concat([
      cipher.update(JSON.stringify(value), "utf8"),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]);
  }
  open<T>(row: VaultRow): T {
    const iv = row.payload.subarray(0, 12),
      tag = row.payload.subarray(12, 28),
      dec = createDecipheriv("aes-256-gcm", this.key, iv);
    dec.setAAD(Buffer.from(row.id));
    dec.setAuthTag(tag);
    return JSON.parse(
      Buffer.concat([
        dec.update(row.payload.subarray(28)),
        dec.final(),
      ]).toString("utf8")
    );
  }
}
// Test/development implementation. Production must use a durable repository.
export class MemoryVault implements VaultRepository {
  syncJobs = new Map<
    string,
    {
      revision: number;
      delivered: number;
      attempts: number;
      next: number;
      lease: string;
      until: number;
      review: boolean;
    }
  >();
  paid = new Set<string>();
  async queueSync(owner: string) {
    const old = this.syncJobs.get(owner);
    this.syncJobs.set(owner, {
      revision: (old?.revision || 0) + 1,
      delivered: old?.delivered || 0,
      attempts: 0,
      next: Date.now(),
      lease: old?.lease || "",
      until: old?.until || 0,
      review: false,
    });
  }
  async claimSync(): Promise<CoverSyncJob | null> {
    const now = Date.now();
    const hit = Array.from(this.syncJobs.entries()).find(
      ([, r]) => !r.review && r.next <= now && r.until <= now
    );
    if (!hit) return null;
    const [owner, r] = hit;
    r.lease = randomUUID();
    r.until = now + 120000;
    r.attempts++;
    return {
      owner,
      revision: r.revision,
      attempts: r.attempts,
      lease: r.lease,
    };
  }
  async finishSync(job: CoverSyncJob, idle = false) {
    const r = this.syncJobs.get(job.owner);
    if (!r || r.lease !== job.lease) return;
    r.delivered = Math.max(r.delivered, job.revision);
    r.lease = "";
    r.until = 0;
    r.attempts = 0;
    r.next =
      r.revision === job.revision
        ? idle
          ? Number.MAX_SAFE_INTEGER
          : Date.now() + 900000
        : Date.now();
  }
  async failSync(job: CoverSyncJob, permanent: boolean) {
    const r = this.syncJobs.get(job.owner);
    if (!r || r.lease !== job.lease) return;
    r.lease = "";
    r.until = 0;
    r.review = r.revision === job.revision && (permanent || job.attempts >= 8);
    r.next =
      Date.now() + Math.min(900000, 15000 * 2 ** Math.min(job.attempts, 6));
  }
  async hasPaidOrder(email: string) {
    return this.paid.has(email.toLowerCase());
  }

  async projectSave(row: VaultRow, expected: number) {
    const old = this.rows.get(row.id);
    if (old && old.owner !== row.owner) throw Error("not-found");
    if ((old?.revision || 0) !== expected) throw Error("conflict");
    const rows = Array.from(this.rows.values()).filter(
      r => r.kind === "project" && r.id !== row.id
    );
    const own = rows.filter(r => r.owner === row.owner);
    if (
      own.length >= 5 ||
      own.reduce((n, r) => n + r.payload.length, 0) + row.payload.length >
        40 * 1024 * 1024 ||
      rows.reduce((n, r) => n + r.payload.length, 0) + row.payload.length >
        128 * 1024 * 1024
    )
      throw Error("quota");
    this.rows.set(row.id, row);
    await this.queueSync(row.owner);
  }
  async prune(now: number) {
    for (const [id, row] of Array.from(this.rows.entries()))
      if (row.expires <= now) this.rows.delete(id);
    for (const [id, hit] of Array.from(this.hits.entries()))
      if (hit.until <= now) this.hits.delete(id);
  }
  rows = new Map<string, VaultRow>();
  hits = new Map<string, { count: number; until: number }>();
  async takeLink(id: string, now: number) {
    const r = this.rows.get(id);
    if (!r || r.kind !== "link" || r.expires <= now) return null;
    this.rows.delete(id);
    return r;
  }
  async get(id: string) {
    return this.rows.get(id) || null;
  }
  async save(row: VaultRow, expected?: number) {
    const old = this.rows.get(row.id);
    if (expected !== undefined && (old?.revision || 0) !== expected)
      return false;
    this.rows.set(row.id, row);
    if (["session", "consent", "readiness"].includes(row.kind))
      await this.queueSync(row.owner);
    return true;
  }
  async list(owner: string, kind: VaultRow["kind"]) {
    return Array.from(this.rows.values())
      .filter(r => r.owner === owner && r.kind === kind)
      .map(r =>
        kind === "project" && r.summary ? { ...r, payload: r.summary } : r
      );
  }
  async remove(owner: string, id: string) {
    if (this.rows.get(id)?.owner === owner) {
      this.rows.delete(id);
      if (id.startsWith("project:")) await this.queueSync(owner);
    }
  }
  async rate(key: string, limit: number, windowMs: number, now: number) {
    if (this.hits.size > 20000) {
      for (const [id, v] of Array.from(this.hits.entries()))
        if (v.until <= now) this.hits.delete(id);
      if (this.hits.size > 20000 && !this.hits.has(key)) return false;
    }
    let h = this.hits.get(key);
    if (!h || h.until <= now) {
      h = { count: 0, until: now + windowMs };
      this.hits.set(key, h);
    }
    return ++h.count <= limit;
  }
}
const COVER_SYNC_UPSERT =
  "INSERT INTO cover_journey_sync(owner,revision,next_attempt_ms) VALUES (?,1,?) ON DUPLICATE KEY UPDATE revision=revision+1,attempts=0,review=0,next_attempt_ms=VALUES(next_attempt_ms)";
export class MysqlVault implements VaultRepository {
  async queueSync(owner: string) {
    await this.pool.execute(COVER_SYNC_UPSERT, [owner, Date.now()]);
  }
  async claimSync(): Promise<CoverSyncJob | null> {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      const now = Date.now();
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM cover_journey_sync WHERE review=0 AND next_attempt_ms<=? AND lease_until_ms<=? ORDER BY next_attempt_ms LIMIT 1 FOR UPDATE",
        [now, now]
      );
      if (!rows.length) {
        await db.commit();
        return null;
      }
      const r = rows[0],
        lease = randomUUID();
      await db.execute(
        "UPDATE cover_journey_sync SET lease_key=?,lease_until_ms=?,attempts=attempts+1 WHERE owner=?",
        [lease, now + 120000, r.owner]
      );
      await db.commit();
      return {
        owner: r.owner,
        revision: Number(r.revision),
        attempts: Number(r.attempts) + 1,
        lease,
      };
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async finishSync(job: CoverSyncJob, idle = false) {
    await this.pool.execute(
      "UPDATE cover_journey_sync SET delivered_revision=GREATEST(delivered_revision,?),lease_key=NULL,lease_until_ms=0,attempts=0,next_attempt_ms=IF(revision=?, ?, ?) WHERE owner=? AND lease_key=?",
      [
        job.revision,
        job.revision,
        idle ? Number.MAX_SAFE_INTEGER : Date.now() + 900000,
        Date.now(),
        job.owner,
        job.lease,
      ]
    );
  }
  async failSync(job: CoverSyncJob, permanent: boolean) {
    await this.pool.execute(
      "UPDATE cover_journey_sync SET lease_key=NULL,lease_until_ms=0,review=IF(revision=?, ?,0),next_attempt_ms=?,error_code=? WHERE owner=? AND lease_key=?",
      [
        job.revision,
        permanent || job.attempts >= 8 ? 1 : 0,
        Date.now() + Math.min(900000, 15000 * 2 ** Math.min(job.attempts, 6)),
        permanent ? "provider-rejected" : "retry",
        job.owner,
        job.lease,
      ]
    );
  }
  async syncHealth() {
    const now = Date.now();
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total, SUM(review=1) AS review, SUM(review=0 AND next_attempt_ms<=? AND lease_until_ms<=?) AS due, SUM(lease_until_ms>?) AS leased, MIN(IF(review=0 AND next_attempt_ms<=?,next_attempt_ms,NULL)) AS oldest_due FROM cover_journey_sync",
      [now, now, now, now]
    );
    const r = rows[0];
    return {
      total: Number(r.total || 0),
      review: Number(r.review || 0),
      due: Number(r.due || 0),
      leased: Number(r.leased || 0),
      oldestDueSeconds:
        r.oldest_due == null
          ? 0
          : Math.max(0, Math.floor((now - Number(r.oldest_due)) / 1000)),
    };
  }
  async hasPaidOrder(email: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT session_id FROM payment_orders WHERE LOWER(JSON_UNQUOTE(JSON_EXTRACT(payload,'$.email')))=? LIMIT 1",
      [email.toLowerCase()]
    );
    return rows.length > 0;
  }
  async prune(now: number) {
    await this.pool.execute("DELETE FROM cover_vault WHERE expires<=?", [now]);
    await this.pool.execute("DELETE FROM cover_rate WHERE until_ms<=?", [now]);
  }
  pool: Pool;
  constructor(url: string) {
    this.pool = mysql.createPool({ uri: url, connectionLimit: 3 });
  }
  async init() {
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_journey_sync(owner VARCHAR(64) PRIMARY KEY,revision BIGINT NOT NULL,delivered_revision BIGINT NOT NULL DEFAULT 0,attempts INT NOT NULL DEFAULT 0,next_attempt_ms BIGINT NOT NULL,lease_key VARCHAR(36) NULL,lease_until_ms BIGINT NOT NULL DEFAULT 0,review TINYINT NOT NULL DEFAULT 0,error_code VARCHAR(32) NULL,INDEX(next_attempt_ms))"
    );
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_write_lock(id INT PRIMARY KEY)"
    );
    await this.pool.query("INSERT IGNORE INTO cover_write_lock(id) VALUES (1)");
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_vault (id VARCHAR(90) PRIMARY KEY,kind VARCHAR(12) NOT NULL,owner VARCHAR(64) NOT NULL,expires BIGINT NOT NULL,revision INT NOT NULL,payload LONGBLOB NOT NULL,summary BLOB NULL,INDEX(owner,kind),INDEX(expires))"
    );
    await this.pool.query(
      "CREATE TABLE IF NOT EXISTS cover_rate (id VARCHAR(90) PRIMARY KEY, hits INT NOT NULL,until_ms BIGINT NOT NULL,INDEX(until_ms))"
    );
  }
  async projectSave(row: VaultRow, expected: number) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.query("SELECT id FROM cover_write_lock WHERE id=1 FOR UPDATE");
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT id,owner,revision,OCTET_LENGTH(payload) AS bytes FROM cover_vault WHERE kind=?",
        ["project"]
      );
      const old = rows.find(r => r.id === row.id);
      if (old && old.owner !== row.owner) throw Error("not-found");
      if ((old?.revision || 0) !== expected) throw Error("conflict");
      const others = rows.filter(r => r.id !== row.id),
        own = others.filter(r => r.owner === row.owner);
      if (
        own.length >= 5 ||
        own.reduce((n, r) => n + Number(r.bytes), 0) + row.payload.length >
          40 * 1024 * 1024 ||
        others.reduce((n, r) => n + Number(r.bytes), 0) + row.payload.length >
          128 * 1024 * 1024
      )
        throw Error("quota");
      await db.execute(
        "INSERT INTO cover_vault(id,kind,owner,expires,revision,payload,summary) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE expires=VALUES(expires),revision=VALUES(revision),payload=VALUES(payload),summary=VALUES(summary)",
        [
          row.id,
          row.kind,
          row.owner,
          row.expires,
          row.revision,
          row.payload,
          row.summary || null,
        ]
      );
      await db.execute(COVER_SYNC_UPSERT, [row.owner, Date.now()]);
      await db.commit();
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  read(r: RowDataPacket): VaultRow {
    return {
      id: r.id,
      kind: r.kind,
      owner: r.owner,
      expires: Number(r.expires),
      revision: r.revision,
      payload: r.payload,
      summary: r.summary,
    };
  }
  async get(id: string) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      "SELECT * FROM cover_vault WHERE id=?",
      [id]
    );
    return rows.length ? this.read(rows[0]) : null;
  }
  async takeLink(id: string, now: number) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT * FROM cover_vault WHERE id=? AND kind=? AND expires>? FOR UPDATE",
        [id, "link", now]
      );
      if (!rows.length) {
        await db.commit();
        return null;
      }
      await db.execute("DELETE FROM cover_vault WHERE id=?", [id]);
      await db.commit();
      return this.read(rows[0]);
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async save(row: VaultRow, expected?: number) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT revision FROM cover_vault WHERE id=? FOR UPDATE",
        [row.id]
      );
      if (expected !== undefined && (rows[0]?.revision || 0) !== expected) {
        await db.rollback();
        return false;
      }
      await db.execute(
        "INSERT INTO cover_vault(id,kind,owner,expires,revision,payload) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE expires=VALUES(expires),revision=VALUES(revision),payload=VALUES(payload)",
        [row.id, row.kind, row.owner, row.expires, row.revision, row.payload]
      );
      if (["session", "consent", "readiness"].includes(row.kind))
        await db.execute(COVER_SYNC_UPSERT, [row.owner, Date.now()]);
      await db.commit();
      return true;
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async list(owner: string, kind: VaultRow["kind"]) {
    const [rows] = await this.pool.query<RowDataPacket[]>(
      kind === "project"
        ? "SELECT id,kind,owner,expires,revision,COALESCE(summary,payload) AS payload FROM cover_vault WHERE owner=? AND kind=?"
        : "SELECT * FROM cover_vault WHERE owner=? AND kind=?",
      [owner, kind]
    );
    return rows.map(r => this.read(r));
  }
  async remove(owner: string, id: string) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.execute("DELETE FROM cover_vault WHERE owner=? AND id=?", [
        owner,
        id,
      ]);
      if (id.startsWith("project:"))
        await db.execute(COVER_SYNC_UPSERT, [owner, Date.now()]);
      await db.commit();
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
  async rate(key: string, limit: number, windowMs: number, now: number) {
    const db = await this.pool.getConnection();
    try {
      await db.beginTransaction();
      await db.execute(
        "INSERT IGNORE INTO cover_rate(id,hits,until_ms) VALUES (?,0,?)",
        [key, now + windowMs]
      );
      const [rows] = await db.query<RowDataPacket[]>(
        "SELECT hits,until_ms FROM cover_rate WHERE id=? FOR UPDATE",
        [key]
      );
      const expired = Number(rows[0].until_ms) <= now,
        hits = expired ? 1 : Number(rows[0].hits) + 1;
      await db.execute("UPDATE cover_rate SET hits=?,until_ms=? WHERE id=?", [
        hits,
        expired ? now + windowMs : rows[0].until_ms,
        key,
      ]);
      await db.commit();
      return hits <= limit;
    } catch (e) {
      await db.rollback();
      throw e;
    } finally {
      db.release();
    }
  }
}
export class CoverVault {
  constructor(
    public repo: VaultRepository,
    private crypt: VaultCrypto,
    private now = () => Date.now()
  ) {}
  async requestLink(
    email: string,
    marketing: boolean,
    ip: string,
    returnPath?: string
  ) {
    email = email.trim().toLowerCase();
    const owner = this.crypt.id("owner:" + email),
      now = this.now();
    if (!(await this.repo.rate(this.crypt.id("ip:" + ip), 10, 3600000, now)))
      return null;
    if (
      !(await this.repo.rate(this.crypt.id("email:" + email), 3, 3600000, now))
    )
      return null;
    if (!(await this.repo.rate("cover-global-links", 100, 3600000, now)))
      return null;
    const token = randomBytes(32).toString("hex"),
      id = "link:" + this.crypt.id(token);
    await this.repo.save({
      id,
      owner,
      kind: "link",
      revision: 1,
      expires: now + 15 * 60000,
      payload: this.crypt.seal(id, {
        email,
        marketing,
        returnPath: validPaymentReturn(returnPath),
      }),
    });
    return token;
  }
  async throttle(ip: string, purpose: string, limit = 30, windowMs = 3600000) {
    return this.repo.rate(
      this.crypt.id(purpose + ":" + ip),
      limit,
      windowMs,
      this.now()
    );
  }
  async verify(token: string, email?: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return null;
    const now = this.now();
    if (email) {
      const candidate = await this.repo.get("link:" + this.crypt.id(token));
      if (
        !candidate ||
        candidate.owner !== this.crypt.id("owner:" + email.trim().toLowerCase())
      )
        return null;
    }
    const row = await this.repo.takeLink("link:" + this.crypt.id(token), now);
    if (!row) return null;
    const value = this.crypt.open<{
      email: string;
      marketing: boolean;
      returnPath?: string;
    }>(row);
    const session = randomBytes(32).toString("hex"),
      id = "session:" + this.crypt.id(session);
    await this.repo.save({
      id,
      owner: row.owner,
      kind: "session",
      revision: 1,
      expires: now + 30 * 86400000,
      payload: this.crypt.seal(id, { email: value.email, verifiedAt: now }),
    });
    if (value.marketing) {
      const consentId = "consent:" + row.owner;
      const oldConsentRow = await this.repo.get(consentId);
      const oldConsent =
        oldConsentRow && oldConsentRow.expires > now
          ? this.crypt.open<{ verifiedAt?: number }>(oldConsentRow)
          : null;
      await this.repo.save({
        id: consentId,
        owner: row.owner,
        kind: "consent",
        revision: 1,
        expires: now + 180 * 86400000,
        payload: this.crypt.seal(consentId, {
          email: value.email,
          verifiedAt: oldConsent?.verifiedAt || now,
          requestedAt: now,
          version: "cover-news-2026-10-26-v1",
          marketing: true,
        }),
      });
    }
    return {
      session,
      email: value.email,
      returnPath: validPaymentReturn(value.returnPath),
    };
  }
  async identity(session: string) {
    if (!/^[a-f0-9]{64}$/.test(session)) return null;
    const row = await this.repo.get("session:" + this.crypt.id(session));
    if (!row || row.expires <= this.now()) return null;
    const info = this.crypt.open<{ email: string; verifiedAt: number }>(row);
    return { owner: row.owner, ...info };
  }
  async projects(session: string) {
    const user = await this.identity(session);
    if (!user) throw Error("unauthorized");
    const rows = await this.repo.list(user.owner, "project");
    return rows
      .filter(r => r.expires > this.now())
      .map(r => {
        const p = this.crypt.open<{ project?: CoverProject; title?: string }>(
          r
        );
        return {
          id: r.id.slice(8),
          revision: r.revision,
          title: p.title || p.project?.title || "Oma kansiprojekti",
          expires: r.expires,
        };
      });
  }
  async getProject(session: string, id: string) {
    const user = await this.identity(session);
    if (!user) throw Error("unauthorized");
    const row = await this.repo.get("project:" + id);
    if (!row || row.owner !== user.owner || row.expires <= this.now())
      return null;
    return {
      id,
      revision: row.revision,
      project: this.crypt.open<{ project: CoverProject }>(row).project,
    };
  }
  async saveProject(
    session: string,
    input: unknown,
    id?: string,
    revision = 0
  ) {
    const user = await this.identity(session);
    if (!user) throw Error("unauthorized");
    if (
      !(await this.repo.rate(
        this.crypt.id("save:" + user.owner),
        12,
        60000,
        this.now()
      ))
    )
      throw Error("rate");
    const project = projectSchema.parse(input);

    const projectId = id || randomUUID();
    if (!/^[0-9a-f-]{36}$/.test(projectId)) throw Error("invalid");
    const key = "project:" + projectId,
      old = await this.repo.get(key);
    if (id && (!old || old.owner !== user.owner)) throw Error("not-found");
    const payload = this.crypt.seal(key, { project });
    if (payload.length > 24 * 1024 * 1024) throw Error("quota");

    await this.repo.prune(this.now());
    await this.repo.projectSave(
      {
        id: key,
        kind: "project",
        owner: user.owner,
        revision: revision + 1,
        expires: this.now() + 90 * 86400000,
        payload,
        summary: this.crypt.seal(key, {
          title: project.title,
          fingerprint: coverHash(project),
        }),
      },
      revision
    );
    return { id: projectId, revision: revision + 1 };
  }
  async markReady(session: string, id: string, fingerprint: string) {
    const user = await this.identity(session);
    if (!user) throw Error("unauthorized");
    const saved = await this.getProject(session, id);
    if (!saved) throw Error("not-found");
    if (coverHash(saved.project) !== fingerprint) throw Error("conflict");
    const key = "ready:" + id;
    const old = await this.repo.get(key),
      previous =
        old && old.expires > this.now()
          ? this.crypt.open<{ fingerprint: string; at: number }>(old)
          : null;
    await this.repo.save({
      id: key,
      owner: user.owner,
      kind: "readiness",
      revision: saved.revision,
      expires: this.now() + 90 * 86400000,
      payload: this.crypt.seal(key, {
        fingerprint,
        at: previous?.fingerprint === fingerprint ? previous.at : this.now(),
      }),
    });
  }
  async journeyAudience(owner: string): Promise<JourneyAudience | null> {
    const now = this.now(),
      consents = (await this.repo.list(owner, "consent")).filter(
        r => r.expires > now
      );
    const consent = consents.length
      ? this.crypt.open<{
          email?: string;
          marketing: boolean;
          verifiedAt?: number;
        }>(consents[0])
      : null;
    const sessions = (await this.repo.list(owner, "session"))
      .filter(r => r.expires > now)
      .map(r => this.crypt.open<{ email: string; verifiedAt: number }>(r))
      .sort((a, b) => a.verifiedAt - b.verifiedAt);
    const email = consent?.email || sessions[0]?.email;
    if (!email) return null;
    const summaries = (await this.repo.list(owner, "project")).filter(
      r => r.expires > now
    );
    const readyRows = (await this.repo.list(owner, "readiness")).filter(
      r => r.expires > now
    );
    const readyAt: number[] = [];
    for (const r of summaries) {
      const summary = this.crypt.open<{ fingerprint?: string }>(r);
      const marker = readyRows.find(m => m.id === "ready:" + r.id.slice(8));
      if (!marker || !summary.fingerprint) continue;
      const value = this.crypt.open<{ fingerprint: string; at: number }>(
        marker
      );
      if (summary.fingerprint === value.fingerprint) readyAt.push(value.at);
    }
    return {
      email,
      verified: !!consent?.verifiedAt || sessions.length > 0,
      marketing: !!consent?.marketing,
      enrolledAt: consent?.verifiedAt || sessions[0]?.verifiedAt || now,
      ready: readyAt.length > 0,
      readyAt: readyAt.length ? Math.min(...readyAt) : null,
    };
  }
  async logout(session: string) {
    const user = await this.identity(session);
    if (user)
      await this.repo.remove(user.owner, "session:" + this.crypt.id(session));
  }
  async deleteProject(session: string, id: string) {
    const user = await this.identity(session);
    if (!user) throw Error("unauthorized");
    await this.repo.remove(user.owner, "project:" + id);
  }
}

function coverHash(project: CoverProject) {
  return createHash("sha256")
    .update(JSON.stringify(projectSchema.parse(project)))
    .digest("hex");
}

function validPaymentReturn(path: unknown) {
  return typeof path === "string" &&
    /^\/kansi-maksu\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
      path
    )
    ? path
    : undefined;
}
