import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import express from "express";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import {
  getPublicGuides,
  loadScheduledGuides,
  registerGuideRoutes,
  parseGuideMarkdown,
} from "./guides";
import { serveStatic } from "./_core/vite";
import { renderPage } from "../client/src/entry-ssr";
import { finnishDate } from "../shared/guides";
import { guideInlineHTML } from "../client/src/lib/guide-markdown";

const releases = [
  ["kirja-lahjaksi", "2026-10-22T00:00:00+03:00"],
  ["muistelmakirjan-julkaiseminen", "2026-10-22T00:00:00+03:00"],
  ["asiantuntijakirja", "2026-11-05T00:00:00+02:00"],
  ["sukukirjan-tekeminen", "2026-11-12T00:00:00+02:00"],
  ["hylatty-kasikirjoitus", "2026-11-19T00:00:00+02:00"],
  ["kirja-valmiiksi-2027", "2026-12-29T00:00:00+02:00"],
];
describe("Finnish publication scheduling, without rebuilds", () => {
  let server: Server;
  let base: string;
  const directory = mkdtempSync(path.join(tmpdir(), "thunder-guides-"));
  beforeAll(async () => {
    writeFileSync(
      path.join(directory, "index.html"),
      readFileSync("client/index.html", "utf8")
    );
    const app = express();
    registerGuideRoutes(app);
    serveStatic(app, directory, renderPage);
    server = await new Promise<Server>(resolve => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing port");
    base = `http://127.0.0.1:${address.port}`;
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
    rmSync(directory, { recursive: true, force: true });
  });

  for (const [slug, timestamp] of releases)
    it(`${slug} opens at Finnish midnight and is absent everywhere beforehand`, async () => {
      vi.useFakeTimers({ toFake: ["Date"] });
      const instant = new Date(timestamp).getTime();
      vi.setSystemTime(new Date(instant - 1));
      const guide = loadScheduledGuides().find(item => item.slug === slug)!;
      expect(finnishDate()).not.toBe(guide.publishDate);
      expect((await fetch(`${base}/oppaat/${slug}`)).status).toBe(404);
      const before = await (await fetch(`${base}/api/guides`)).json();
      expect(
        before.guides.some((item: { slug: string }) => item.slug === slug)
      ).toBe(false);
      const sitemapBefore = await (await fetch(`${base}/sitemap.xml`)).text();
      expect(sitemapBefore).not.toContain(`/oppaat/${slug}</loc>`);
      for (const location of ["/", "/oppaat", "/oppaat/kirjan-kustannukset"]) {
        const html = await (await fetch(base + location)).text();
        expect(html).not.toContain(guide.metaDescription);
        expect(html).not.toContain(`"slug":"${slug}"`);
        expect(html).not.toContain(`href="/oppaat/${slug}"`);
      }
      vi.setSystemTime(new Date(instant));
      expect(finnishDate()).toBe(guide.publishDate);
      const response = await fetch(`${base}/oppaat/${slug}`);
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      const html = await response.text();
      expect(html).toContain(guide.metaTitle);
      expect(html).toContain(guide.metaDescription);
      expect(html).toContain(`https://thunderkustannus.fi/oppaat/${slug}`);
      expect(
        html.match(/href="\/tarjouspyynto"/g)!.length
      ).toBeGreaterThanOrEqual(2);
      expect(html).toContain("Lataa ilmainen 10 askeleen tarkistuslista");
      expect(html).toContain("Klarnalla");
      expect(html).not.toContain("segmentti");
      expect(html).not.toContain("myyntitavoite");
      expect(await (await fetch(`${base}/sitemap.xml`)).text()).toContain(
        `/oppaat/${slug}</loc>`
      );
      expect(
        (await (await fetch(`${base}/api/guides`)).json()).guides.some(
          (item: { slug: string }) => item.slug === slug
        )
      ).toBe(true);
    });
  it("keeps future source content out of today's catalog", () => {
    const today = getPublicGuides(new Date("2026-10-19T12:00:00+03:00"));
    expect(today).toHaveLength(11);
    const serialized = JSON.stringify(today);
    for (const guide of loadScheduledGuides()) {
      expect(serialized).not.toContain(guide.metaDescription);
      expect(serialized).not.toContain(`/oppaat/${guide.slug})`);
    }
    expect(getPublicGuides(new Date("2026-12-29T00:00:00+02:00"))).toHaveLength(
      17
    );
  });
  it("permanently redirects the estimate alias and retains calculator parameters", async () => {
    const response = await fetch(`${base}/arvio?format=A5&qty=100`, {
      redirect: "manual",
    });
    expect(response.status).toBe(301);
    expect(response.headers.get("location")).toBe(
      "/tarjouspyynto?format=A5&qty=100"
    );
  });
  it("does not expose internal frontmatter, unsafe HTML or future links", () => {
    expect(() => parseGuideMarkdown("No frontmatter")).toThrow();
    const html = guideInlineHTML(
      "<script>alert(1)</script> [later](/oppaat/tuleva) [bad](javascript:alert) [ok](/hinnat)",
      new Set()
    );
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('href="/oppaat/tuleva"');
    expect(html).toContain('href="/hinnat"');
  });
});
