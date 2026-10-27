import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import { registerCoverRoutes } from "./routes";
import { CoverVault, MemoryVault, VaultCrypto, type VaultRow } from "./vault";
import { CoverSubmissions, type SubmissionRepository } from "./submissions";
import { createProject } from "../../client/src/lib/cover/model";

class TestRepository implements SubmissionRepository {
  rows = new Map<string, VaultRow>();
  async get(id: string) {
    return this.rows.get(id) || null;
  }
  async insert(row: VaultRow) {
    if (this.rows.has(row.id)) throw Error("duplicate");
    this.rows.set(row.id, row);
  }
  async prune(now: number) {
    for (const [id, row] of this.rows)
      if (row.expires <= now) this.rows.delete(id);
  }
}
describe("manuscript HTTP boundary", () => {
  let server: Server, base: string, cookie: string, projectId: string;
  const crypto = new VaultCrypto(randomBytes(32));
  const vault = new CoverVault(new MemoryVault(), crypto);
  const repo = new TestRepository();
  const input = {
    requestId: randomUUID(),
    revision: 1,
    customer: {
      name: "Test Author",
      email: "author@example.com",
      phone: "",
      address: "Test road 1",
      postal: "00100",
      city: "Helsinki",
    },
    filename: "book.pdf",
    manuscript: Buffer.from("%PDF-1.4 synthetic %%EOF").toString("base64"),
    confirmedPages: true,
    permission: true,
  };
  beforeAll(async () => {
    const app = express();
    server = await new Promise<Server>(resolve => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw Error();
    base = "http://127.0.0.1:" + address.port;
    registerCoverRoutes(app, {
      base,
      vault,
      sendAccess: null,
      submissions: new CoverSubmissions(vault, repo, crypto),
    });
    const link = await vault.requestLink("author@example.com", false, "local");
    const verified = await vault.verify(link!, "author@example.com");
    cookie = "thunder_cover_dev=" + verified!.session;
    projectId = (await vault.saveProject(verified!.session, createProject()))
      .id;
  });
  afterAll(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  function send(body: unknown, auth = cookie, origin = base) {
    return fetch(base + "/api/cover/submissions/" + projectId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        ...(auth ? { Cookie: auth } : {}),
      },
      body: JSON.stringify(body),
    });
  }
  it("denies unauthenticated and cross-origin intake before storing files", async () => {
    expect((await send(input, "")).status).toBe(401);
    expect((await send(input, cookie, "https://other.invalid")).status).toBe(
      403
    );
    expect(repo.rows.size).toBe(0);
  });
  it("stores a receipt, never serves manuscript bytes, and is safe to retry", async () => {
    const response = await send(input);
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const receipt = await response.json();
    expect(receipt.status).toBe("awaiting_review");
    expect(receipt.manuscript).toBeUndefined();
    expect(receipt.customer).toBeUndefined();
    expect(await (await send(input)).json()).toEqual(receipt);
    const read = await fetch(
      base + "/api/cover/submissions/" + input.requestId,
      { headers: { Cookie: cookie } }
    );
    expect(await read.json()).toEqual(receipt);
    const anonymous = await fetch(
      base + "/api/cover/submissions/" + input.requestId
    );
    expect(anonymous.status).toBe(401);
  });
  it("rejects an oversized body and releases its intake slot", async () => {
    expect(
      (await send({ ...input, manuscript: "A".repeat(13 * 1024 * 1024) }))
        .status
    ).toBe(413);
    expect((await send(input)).status).toBe(201);
    expect(repo.rows.size).toBe(1);
  });
  it("rejects incorrect content types without reserving an intake slot", async () => {
    const response = await fetch(base + "/api/cover/submissions/" + projectId, {
      method: "POST",
      headers: { "Content-Type": "text/plain", Origin: base, Cookie: cookie },
      body: "no file",
    });
    expect(response.status).toBe(415);
    expect((await send(input)).status).toBe(201);
  });
});
