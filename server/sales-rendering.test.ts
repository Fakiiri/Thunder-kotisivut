import { describe, expect, it, vi, afterEach } from "vitest";
import { renderPage } from "../client/src/entry-ssr";
import { renderHTML } from "./_core/render-html";
import { PACKAGES, GUIDES } from "../client/src/lib/data";
import { AUTHOR_FEEDBACK } from "../client/src/lib/sales-content";
import { readFileSync } from "node:fs";

const template = readFileSync(
  new URL("../client/index.html", import.meta.url),
  "utf8"
);
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("server-rendered sales pages", () => {
  it("renders real readable content and route-specific metadata for every target route", () => {
    for (const route of [
      "/",
      "/hinnat",
      "/meista",
      "/kirjat",
      "/oppaat",
      "/asiantuntijakirja",
      ...GUIDES.map(guide => `/oppaat/${guide.slug}`),
    ]) {
      const page = renderPage(route)!;
      expect(page.body).toContain("<h1");
      expect(page.body).not.toContain("opacity:0");
      expect(page.seo.canonical).toBe(route);
      const html = renderHTML(template, page);
      expect(html).toContain(`href="https://thunderkustannus.fi${route}"`);
      expect(html.match(/rel="canonical"/g)).toHaveLength(1);
      expect(html).toContain(page.seo.description.replaceAll("&", "&amp;"));
      expect(html).not.toContain('<div id="root"></div>');
    }
    expect(renderPage("/oppaat/nonexistent")).toBeNull();
  });
  it("keeps payment destinations and prices, exposes complete Premium terms and hides unapproved feedback", () => {
    vi.stubEnv("VITE_EDITORIAL_PREVIEW", "false");
    const page = renderPage("/")!;
    for (const pkg of PACKAGES) expect(page.body).toContain(pkg.price);
    expect(page.body).toContain("Jopa 10 markkinointimateriaalia");
    expect(page.body).toContain("Prioriteettituki 12 kk");
    expect(page.body).toContain("45 minuutin");
    expect(page.body).toContain("/asiantuntijakirja");
    expect(page.body).not.toContain("+ 2 muuta");
    expect(page.body).not.toContain("[TÄYTÄ:");
    for (const feedback of AUTHOR_FEEDBACK)
      expect(page.body).not.toContain(feedback.quote);
    expect(page.body).toContain(
      "https://buy.stripe.com/4gM28rg8f9pr7wL9SP8g001"
    );
  });
  it("marks feedback drafts visibly and makes editorial previews noindex", () => {
    vi.stubEnv("VITE_EDITORIAL_PREVIEW", "true");
    const page = renderPage("/")!;
    expect(page.body).toContain("Tekstiehdotus · ei julkaistavaksi");
    expect(page.body).toContain("eivät varmennettuja lainauksia");
    expect(renderHTML(template, page)).toContain('content="noindex, nofollow"');
  });
  it("does not keep an expired campaign in the server-rendered HTML", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-26T00:01:00+02:00"));
    expect(renderPage("/")!.body).not.toContain("JOULUN JULKAISUKAMPANJA");
  });
});
