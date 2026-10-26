import { describe, it, expect } from "vitest";
import { randomBytes, createHash } from "node:crypto";
import { CoverVault, MemoryVault, VaultCrypto } from "./vault";
import { createProject, projectSchema } from "../../client/src/lib/cover/model";
const hash = (p: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(projectSchema.parse(p)))
    .digest("hex");
async function fixture(marketing = true) {
  const repo = new MemoryVault(),
    vault = new CoverVault(repo, new VaultCrypto(randomBytes(32)));
  const key = await vault.requestLink("reader@example.com", marketing, "test");
  expect(repo.syncJobs.size).toBe(0);
  const login = await vault.verify(key!, "reader@example.com");
  return {
    repo,
    vault,
    session: login!.session,
    owner: (await vault.identity(login!.session))!.owner,
  };
}
describe("durable cover journey changes", () => {
  it("queues verified consent and keeps address, image and text out of queue records", async () => {
    const f = await fixture(),
      p = createProject();
    p.title = "Yksityinen salainen tarina";
    await f.vault.saveProject(f.session, p);
    expect(JSON.stringify(Array.from(f.repo.syncJobs.entries()))).not.toContain(
      "reader@example.com"
    );
    expect(JSON.stringify(Array.from(f.repo.syncJobs.entries()))).not.toContain(
      p.title
    );
    expect(await f.vault.journeyAudience(f.owner)).toMatchObject({
      verified: true,
      marketing: true,
      ready: false,
    });
  });
  it("marks a particular saved version ready and automatically invalidates readiness after an edit", async () => {
    const f = await fixture(),
      p = createProject(),
      saved = await f.vault.saveProject(f.session, p);
    await f.vault.markReady(f.session, saved.id, hash(p));
    const first = await f.vault.journeyAudience(f.owner);
    expect(first?.ready).toBe(true);
    await f.vault.markReady(f.session, saved.id, hash(p));
    expect((await f.vault.journeyAudience(f.owner))?.readyAt).toBe(
      first?.readyAt
    );
    p.title = "Muutettu otsikko";
    await f.vault.saveProject(f.session, p, saved.id, 1);
    expect((await f.vault.journeyAudience(f.owner))?.ready).toBe(false);
    await expect(
      f.vault.markReady(f.session, saved.id, hash(createProject()))
    ).rejects.toThrow("conflict");
  });
  it("does not lose a newer change while an old sync is in flight", async () => {
    const f = await fixture(),
      job = await f.repo.claimSync();
    expect(job).toBeTruthy();
    await f.vault.saveProject(f.session, createProject());
    await f.repo.finishSync(job!);
    const next = await f.repo.claimSync();
    expect(next!.revision).toBeGreaterThan(job!.revision);
    await f.repo.finishSync(job!);
    expect(f.repo.syncJobs.get(f.owner)?.lease).toBe(next!.lease);
  });
  it("does not turn service-only verification into a marketing subscription", async () => {
    const f = await fixture(false);
    expect(await f.vault.journeyAudience(f.owner)).toMatchObject({
      verified: true,
      marketing: false,
    });
  });
  it("keeps a consenting verified identity available after logout for the agreed follow-up", async () => {
    const f = await fixture();
    await f.vault.logout(f.session);
    expect(await f.vault.journeyAudience(f.owner)).toMatchObject({
      email: "reader@example.com",
      verified: true,
      marketing: true,
    });
  });
  it("does not let another customer mark a project ready", async () => {
    const f = await fixture(),
      saved = await f.vault.saveProject(f.session, createProject());
    const key = await f.vault.requestLink("other@example.com", true, "other"),
      other = await f.vault.verify(key!);
    await expect(
      f.vault.markReady(other!.session, saved.id, hash(createProject()))
    ).rejects.toThrow("not-found");
  });
});
