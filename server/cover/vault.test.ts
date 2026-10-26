import { describe, it, expect } from "vitest";
import { randomBytes } from "node:crypto";
import { CoverVault, MemoryVault, VaultCrypto } from "./vault";
import { createProject } from "../../client/src/lib/cover/model";
function fixture() {
  let now = Date.UTC(2026, 9, 26);
  const repo = new MemoryVault(),
    crypto = new VaultCrypto(randomBytes(32)),
    vault = new CoverVault(repo, crypto, () => now);
  return { repo, crypto, vault, advance: (ms: number) => (now += ms) };
}
async function login(vault: CoverVault, email = "one@example.com") {
  const token = await vault.requestLink(email, false, "127.0.0.1");
  return (await vault.verify(token!))!.session;
}
describe("private cover vault", () => {
  it("uses encrypted payloads, single-use links and no owner identity from the browser", async () => {
    const f = fixture(),
      token = await f.vault.requestLink("one@example.com", false, "127.0.0.1");
    expect([...f.repo.rows.values()][0].payload.toString()).not.toContain(
      "one@example.com"
    );
    expect(await f.vault.verify(token!)).toBeTruthy();
    expect(await f.vault.verify(token!)).toBeNull();
  });
  it("expires links and sessions", async () => {
    const f = fixture(),
      token = await f.vault.requestLink("one@example.com", false, "127.0.0.1");
    f.advance(15 * 60000);
    expect(await f.vault.verify(token!)).toBeNull();
    const session = await login(f.vault);
    f.advance(31 * 86400000);
    expect(await f.vault.identity(session)).toBeNull();
  });
  it("prevents one customer reading, changing or deleting another project", async () => {
    const f = fixture(),
      one = await login(f.vault),
      two = await login(f.vault, "two@example.com"),
      saved = await f.vault.saveProject(one, createProject());
    expect(await f.vault.getProject(two, saved.id)).toBeNull();
    await expect(
      f.vault.saveProject(two, createProject(), saved.id, 1)
    ).rejects.toThrow("not-found");
    await f.vault.deleteProject(two, saved.id);
    expect(await f.vault.getProject(one, saved.id)).toBeTruthy();
  });
  it("resumes on a new device without changing its contents", async () => {
    const f = fixture(),
      one = await login(f.vault),
      p = createProject();
    p.title = "Asiakkaan oma kansi";
    const saved = await f.vault.saveProject(one, p),
      otherDevice = await login(f.vault);
    expect(
      (await f.vault.getProject(otherDevice, saved.id))?.project.title
    ).toBe(p.title);
  });
  it("rejects stale revisions instead of overwriting another device", async () => {
    const f = fixture(),
      session = await login(f.vault),
      p = createProject(),
      saved = await f.vault.saveProject(session, p);
    p.title = "Uusi";
    await f.vault.saveProject(session, p, saved.id, 1);
    await expect(
      f.vault.saveProject(session, createProject(), saved.id, 1)
    ).rejects.toThrow("conflict");
    expect((await f.vault.getProject(session, saved.id))?.project.title).toBe(
      "Uusi"
    );
  });
  it("enforces project quotas even for concurrent creation requests", async () => {
    const f = fixture(),
      session = await login(f.vault);
    const results = await Promise.allSettled(
      Array.from({ length: 7 }, () =>
        f.vault.saveProject(session, createProject())
      )
    );
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(5);
  });
  it("caps email requests and does not record marketing consent before verification", async () => {
    const f = fixture();
    const t = await f.vault.requestLink("one@example.com", true, "1");
    expect([...f.repo.rows.values()].some(r => r.kind === "consent")).toBe(
      false
    );
    await f.vault.verify(t!);
    expect([...f.repo.rows.values()].some(r => r.kind === "consent")).toBe(
      true
    );
    await f.vault.requestLink("one@example.com", false, "2");
    await f.vault.requestLink("one@example.com", false, "3");
    expect(await f.vault.requestLink("one@example.com", false, "4")).toBeNull();
  });
  it("revokes sessions at logout and detects encrypted payload tampering", async () => {
    const f = fixture(),
      session = await login(f.vault);
    await f.vault.logout(session);
    expect(await f.vault.identity(session)).toBeNull();
    const next = await login(f.vault, "tamper@example.com");
    const row = Array.from(f.repo.rows.values()).find(
      r => r.kind === "session"
    )!;
    row.payload[30] ^= 1;
    expect(() => f.crypto.open(row)).toThrow();
    await f.vault.logout(session).catch(() => {});
  });
});
