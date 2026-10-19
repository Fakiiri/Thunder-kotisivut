// Local editorial preview only. This module is never imported by the production server.
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getPublicGuides, makeSitemap } from "./guides";
import { renderHTML, appendGuideData } from "./_core/render-html";

async function startPreview() {
  const date = new Date(process.argv[2] || "2026-12-29T12:00:00+02:00");
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid preview date");
  const guides = getPublicGuides(date);
  const publicFolder = path.resolve(process.cwd(), "dist/public");
  const renderer = await import(
    pathToFileURL(path.resolve(process.cwd(), "dist/ssr/entry-ssr.js")).href
  );
  const app = express();
  app.use((_req, res, next) => {
    res.set({
      "X-Robots-Tag": "noindex, nofollow",
      "Cache-Control": "no-store",
    });
    next();
  });
  app.get("/api/guides", (_req, res) => res.json({ guides }));
  app.get("/sitemap.xml", (_req, res) =>
    res
      .type("xml")
      .send(
        makeSitemap(
          fs.readFileSync("client/public/sitemap.xml", "utf8"),
          guides
        )
      )
  );
  app.use(express.static(publicFolder, { index: false }));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.sendStatus(404);
      return;
    }
    const template = fs.readFileSync(
      path.join(publicFolder, "index.html"),
      "utf8"
    );
    const page = renderer.renderPage(req.path, guides);
    let html = page
      ? renderHTML(
          template,
          { ...page, seo: { ...page.seo, noIndex: true } },
          guides
        )
      : appendGuideData(template, guides);
    html = html.replace(
      "<body>",
      '<body><aside style="position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#fff2cc;color:#563500;padding:9px 16px;font:600 13px Arial;text-align:center">ESIKATSELU: myös tulevat oppaat näkyvät. Ei tuotantojulkaisu. Lomakkeita ei lähetetä tästä esikatselusta.</aside>'
    );
    res.type("html").send(html);
  });
  app.listen(5190, "127.0.0.1", () =>
    console.log("Editorial guide preview: http://127.0.0.1:5190/oppaat")
  );
}
startPreview().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
