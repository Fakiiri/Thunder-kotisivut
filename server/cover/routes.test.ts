import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { randomBytes } from "node:crypto";
import { registerCoverRoutes, type AccessMail } from "./routes";
import { CoverVault, MemoryVault, VaultCrypto } from "./vault";
import { createProject } from "../../client/src/lib/cover/model";
describe("cover access HTTP boundary", () => {
  let server: Server, base: string;
  let pressCalls = 0;
  let holdPress: Promise<void> | null = null;
  let markStarted = () => {};
  let failPress = false;
  const mail: AccessMail[] = [],
    vault = new CoverVault(new MemoryVault(), new VaultCrypto(randomBytes(32)));
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
      prepress: {
        inspect: async () => {
          pressCalls++;
          markStarted();
          if (holdPress) await holdPress;
          if (failPress) throw Error("synthetic failure");
          return { ok: true };
        },
        export: async () => {
          pressCalls++;
          return { pdf: Buffer.from("%PDF-test") };
        },
      },
      sendAccess: async m => {
        mail.push(m);
      },
    });
  });
  afterAll(async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const post = (path: string, body: unknown, cookie = "", origin?: string) =>
    fetch(base + "/api/cover" + path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin || base,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(body),
    });
  it("does not let link-scanning GET requests consume a login", async () => {
    const r = await post("/access/request", {
      email: "test@example.com",
      marketing: false,
    });
    expect(r.status).toBe(202);
    const url = mail.at(-1)!.url,
      token = new URL(url).hash.slice(7);
    const page = await fetch(base + "/kansi-kirjaudu");
    expect(page.headers.get("content-security-policy")).toContain(
      "default-src"
    );
    expect(await page.text()).not.toContain(token);
    const wrong = await post("/access/verify", {
      token,
      email: "wrong@example.com",
    });
    expect(wrong.status).toBe(401);
    const valid = await post("/access/verify", {
      token,
      email: "test@example.com",
    });
    expect(valid.status).toBe(200);
    expect(valid.headers.get("set-cookie")).toContain("HttpOnly");
    expect(
      (await post("/access/verify", { token, email: "test@example.com" }))
        .status
    ).toBe(401);
  });
  it("rejects cross-origin writes and unauthorized project requests", async () => {
    expect(
      (
        await post(
          "/access/request",
          { email: "x@example.com", marketing: false },
          "",
          "https://evil.example"
        )
      ).status
    ).toBe(403);
    expect((await fetch(base + "/api/cover/projects")).status).toBe(401);
    expect((await post("/projects", { project: createProject() })).status).toBe(
      401
    );
  });
  it("saves a project through an authenticated session and detects stale updates", async () => {
    await post("/access/request", {
      email: "save@example.com",
      marketing: false,
    });
    const token = new URL(mail.at(-1)!.url).hash.slice(7),
      r = await post("/access/verify", { token, email: "save@example.com" }),
      cookie = r.headers.get("set-cookie")!.split(";")[0];
    const saved = await post("/projects", { project: createProject() }, cookie);
    expect(saved.status).toBe(201);
    const data = await saved.json();
    const loaded = await fetch(base + "/api/cover/projects/" + data.id, {
      headers: { Cookie: cookie },
    });
    expect(loaded.status).toBe(200);
    expect(loaded.headers.get("cache-control")).toBe("no-store");
    expect(
      (
        await post(
          "/projects",
          { project: createProject(), id: data.id, revision: 0 },
          cookie
        )
      ).status
    ).toBe(409);
    await post("/logout", {}, cookie);
    expect(
      (
        await fetch(base + "/api/cover/projects", {
          headers: { Cookie: cookie },
        })
      ).status
    ).toBe(401);
  });
  it("checks project ownership before preflight or PDF work", async () => {
    const a = await vault.verify(
      (await vault.requestLink("owner@example.com", false, "owner"))!,
      "owner@example.com"
    );
    const b = await vault.verify(
      (await vault.requestLink("other@example.com", false, "other"))!,
      "other@example.com"
    );
    const saved = await vault.saveProject(a!.session, createProject());
    const before = pressCalls,
      cookie = "thunder_cover_dev=" + b!.session;
    expect(
      (
        await post(
          "/projects/" + saved.id + "/preflight",
          { confirmed: true },
          cookie
        )
      ).status
    ).toBe(404);
    expect(
      (
        await post(
          "/projects/" + saved.id + "/export",
          { confirmed: true, proof: true },
          cookie
        )
      ).status
    ).toBe(404);
    expect(pressCalls).toBe(before);
  });
  it("allows only one expensive conversion at a time and releases it after failure", async () => {
    const a = await vault.verify(
      (await vault.requestLink("press@example.com", false, "press"))!,
      "press@example.com"
    );
    const saved = await vault.saveProject(a!.session, createProject()),
      cookie = "thunder_cover_dev=" + a!.session;
    let release = () => {};
    holdPress = new Promise<void>(resolve => {
      release = resolve;
    });
    const started = new Promise<void>(resolve => {
      markStarted = resolve;
    });
    failPress = true;
    const first = post(
      "/projects/" + saved.id + "/preflight",
      { confirmed: true },
      cookie
    );
    await started;
    try {
      expect(
        (
          await post(
            "/projects/" + saved.id + "/preflight",
            { confirmed: true },
            cookie
          )
        ).status
      ).toBe(429);
    } finally {
      release();
    }
    expect((await first).status).toBe(503);
    holdPress = null;
    failPress = false;
    markStarted = () => {};
    expect(
      (
        await post(
          "/projects/" + saved.id + "/preflight",
          { confirmed: true },
          cookie
        )
      ).status
    ).toBe(200);
  });
});
