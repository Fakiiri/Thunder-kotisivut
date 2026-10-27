import { describe, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { CoverVault, VaultCrypto, MemoryVault, type VaultRow } from "./vault";
import {
  CoverSubmissions,
  SUBMISSION_RETENTION_MS,
  type SubmissionRepository,
} from "./submissions";
import { createProject } from "../../client/src/lib/cover/model";
import { printQuote } from "../../shared/print-production";

class TestRepository implements SubmissionRepository {
  rows = new Map<string, VaultRow>();
  async get(id: string) {
    return this.rows.get(id) || null;
  }
  async insert(row: VaultRow) {
    if (this.rows.has(row.id)) throw Error("duplicate");
    if ([...this.rows.values()].filter(r => r.owner === row.owner).length >= 2)
      throw Error("quota");
    this.rows.set(row.id, row);
  }
  async prune(now: number) {
    for (const [id, r] of this.rows) if (r.expires <= now) this.rows.delete(id);
  }
}
async function fixture() {
  let time = Date.now();
  const crypto = new VaultCrypto(randomBytes(32));
  const vault = new CoverVault(new MemoryVault(), crypto, () => time);
  const token = await vault.requestLink(
    "author@example.com",
    false,
    "local-test"
  );
  const login = (await vault.verify(token!, "author@example.com"))!;
  const project = createProject();
  const saved = await vault.saveProject(login.session, project);
  const repo = new TestRepository();
  const service = new CoverSubmissions(vault, repo, crypto, () => time);
  const input = {
    requestId: randomUUID(),
    revision: saved.revision,
    customer: {
      name: "Test Author",
      email: "author@example.com",
      phone: "",
      address: "Test road 1",
      postal: "00100",
      city: "Helsinki",
    },
    filename: "book.pdf",
    manuscript: Buffer.from("%PDF-1.4\nsynthetic fixture only\n%%EOF").toString(
      "base64"
    ),
    confirmedPages: true,
    permission: true as const,
  };
  return {
    vault,
    project,
    saved,
    repo,
    service,
    input,
    login,
    advance: (ms: number) => {
      time += ms;
    },
  };
}
describe("quarantined manuscript intake", () => {
  it("encrypts the complete snapshot and computes price from saved project", async () => {
    const f = await fixture();
    const result = await f.service.submit(f.login.session, f.saved.id, f.input);
    expect(result.totalCents).toBe(
      printQuote(f.project.production)!.totalCents
    );
    expect(result.status).toBe("awaiting_review");
    expect(f.repo.rows.size).toBe(1);
    const bytes = [...f.repo.rows.values()][0].payload.toString();
    expect(bytes).not.toContain("author@example.com");
    expect(bytes).not.toContain("Test road");
    expect(bytes).not.toContain("PDF-1.4");
  });
  it("returns the same receipt on retries, but rejects changed content under the same key", async () => {
    const f = await fixture();
    const receipts = await Promise.all([
      f.service.submit(f.login.session, f.saved.id, f.input),
      f.service.submit(f.login.session, f.saved.id, f.input),
    ]);
    expect(receipts[0]).toEqual(receipts[1]);
    expect(f.repo.rows.size).toBe(1);
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        customer: { ...f.input.customer, name: "Changed name" },
      })
    ).rejects.toThrow("conflict");
  });
  it("requires a session and hides another owner's receipts and project", async () => {
    const f = await fixture();
    await expect(f.service.submit("", f.saved.id, f.input)).rejects.toThrow(
      "unauthorized"
    );
    await f.service.submit(f.login.session, f.saved.id, f.input);
    const token = await f.vault.requestLink(
      "other@example.com",
      false,
      "other"
    );
    const other = (await f.vault.verify(token!, "other@example.com"))!;
    expect(
      await f.service.getReceipt(other.session, f.input.requestId)
    ).toBeNull();
    await expect(
      f.service.submit(other.session, f.saved.id, {
        ...f.input,
        customer: { ...f.input.customer, email: "other@example.com" },
      })
    ).rejects.toThrow("not-found");
  });
  it("rejects stale revisions before accepting a new request", async () => {
    const f = await fixture();
    await f.vault.saveProject(
      f.login.session,
      { ...f.project, title: "Changed" },
      f.saved.id,
      f.saved.revision
    );
    await expect(
      f.service.submit(f.login.session, f.saved.id, f.input)
    ).rejects.toThrow("conflict");
    expect(f.repo.rows.size).toBe(0);
  });
  it("does not accept a caller-provided price or different recipient address", async () => {
    const f = await fixture();
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        totalCents: 1,
      })
    ).rejects.toThrow();
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        customer: { ...f.input.customer, email: "victim@example.com" },
      })
    ).rejects.toThrow("email-mismatch");
  });
  it("rejects oversized, active, malformed and path-named files", async () => {
    const f = await fixture();
    for (const input of [
      { ...f.input, manuscript: "A".repeat(12 * 1024 * 1024) },
      {
        ...f.input,
        manuscript: Buffer.from("%PDF-1.4 /JavaScript %%EOF").toString(
          "base64"
        ),
      },
      { ...f.input, manuscript: "not base64" },
      { ...f.input, filename: "../book.pdf" },
    ])
      await expect(
        f.service.submit(f.login.session, f.saved.id, input)
      ).rejects.toThrow();
    expect(f.repo.rows.size).toBe(0);
  });
  it("requires permission and page confirmation for ready interiors", async () => {
    const f = await fixture();
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        permission: false,
      })
    ).rejects.toThrow();
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        confirmedPages: false,
      })
    ).rejects.toThrow("pages-unconfirmed");
  });
  it("limits retained requests and expires receipts", async () => {
    const f = await fixture();
    await f.service.submit(f.login.session, f.saved.id, f.input);
    await f.service.submit(f.login.session, f.saved.id, {
      ...f.input,
      requestId: randomUUID(),
    });
    await expect(
      f.service.submit(f.login.session, f.saved.id, {
        ...f.input,
        requestId: randomUUID(),
      })
    ).rejects.toThrow("quota");
    f.advance(SUBMISSION_RETENTION_MS + 1);
    const newToken = await f.vault.requestLink(
      "author@example.com",
      false,
      "fresh"
    );
    const fresh = (await f.vault.verify(newToken!, "author@example.com"))!;
    expect(
      await f.service.getReceipt(fresh.session, f.input.requestId)
    ).toBeNull();
    await f.repo.prune(Date.now() + SUBMISSION_RETENTION_MS + 1);
    expect(f.repo.rows.size).toBe(0);
  });
});
