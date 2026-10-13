import { afterAll, beforeAll, describe, expect, it } from "vitest";
import express from "express";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import { serveStatic } from "./_core/vite";

describe("crawler and visitor routing", () => {
  let server: Server;
  let base: string;
  const directory = mkdtempSync(path.join(tmpdir(), "thunder-routing-"));
  const html = '<html><div id="root"></div><script src="/assets/app.js"></script></html>';

  beforeAll(async () => {
    writeFileSync(path.join(directory, "index.html"), html);
    writeFileSync(path.join(directory, "sitemap.xml"), '<?xml version="1.0"?><urlset/>');
    writeFileSync(path.join(directory, "robots.txt"), "User-agent: *\nAllow: /\n");
    mkdirSync(path.join(directory, "assets"));
    writeFileSync(path.join(directory, "assets/app.js"), "console.log('app');");
    const app = express();
    app.get("/api/check", (_req, res) => res.json({ ok: true }));
    serveStatic(app, directory);
    server = await new Promise<Server>(resolve => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Missing address");
    base = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    rmSync(directory, { recursive: true, force: true });
  });

  for (const agent of ["Mozilla/5.0", "Googlebot", "bingbot"]) {
    it(`serves the complete app and real resources to ${agent}`, async () => {
      const headers = { "User-Agent": agent };
      for (const route of ["/", "/hinnat", "/oppaat/aanikirjan-tekeminen"]) {
        const response = await fetch(base + route, { headers });
        expect(response.status).toBe(200);
        expect(await response.text()).toBe(html);
      }
      const sitemap = await fetch(base + "/sitemap.xml", { headers });
      expect(sitemap.status).toBe(200);
      expect(sitemap.headers.get("content-type")).toContain("xml");
      expect(await sitemap.text()).toContain("<urlset");
      const robots = await fetch(base + "/robots.txt", { headers });
      expect(await robots.text()).toContain("User-agent: *");
      const script = await fetch(base + "/assets/app.js", { headers });
      expect(script.headers.get("content-type")).toContain("javascript");
      const api = await fetch(base + "/api/check", { headers });
      expect(await api.json()).toEqual({ ok: true });
      for (const missing of ["/unknown", "/oppaat/nonexistent", "/images/missing.png", "/api/missing"]) {
        expect((await fetch(base + missing, { headers })).status).toBe(404);
      }
    });
  }
});
