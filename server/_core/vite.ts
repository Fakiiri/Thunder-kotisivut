import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getPublicGuides } from "../guides";
import type { Guide } from "../../shared/guides";
import { renderHTML, appendGuideData, type RenderedPage } from "./render-html";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    // Let Vite find its own config file (vite.config.ts) — do NOT import it here
    // because vite.config.ts uses import.meta.dirname which breaks in esbuild bundles
    configFile: path.resolve(process.cwd(), "vite.config.ts"),
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(
  app: Express,
  distPath = path.resolve(process.cwd(), "dist", "public"),
  renderPage?: (url: string, guides?: Guide[]) => RenderedPage | null
) {
  // Use process.cwd() which is always /app on Railway
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { index: false }));

  const pagePaths = new Set([
    "/",
    "/hinnat",
    "/julkaisutesti",
    "/kansisuunnittelija",
    "/kirjat",
    "/tarjouspyynto",
    "/arvio",
    "/oppaat",
    "/meista",
    "/asiantuntijakirja",
    "/sopimusehdot",
    "/tietosuoja",
    "/yhteystiedot",
    "/lataa-opas",
    "/tilaus-kiitos",
    "/kiitos",
  ]);

  app.use("*", (req, res) => {
    const pagePath =
      new URL(req.originalUrl, "http://localhost").pathname.replace(
        /\/+$/,
        ""
      ) || "/";
    const guides = getPublicGuides();
    const knownPage =
      pagePaths.has(pagePath) ||
      guides.some(guide => pagePath === `/oppaat/${guide.slug}`);
    if (pagePath.startsWith("/oppaat/") && !knownPage) {
      res
        .set("Cache-Control", "no-store")
        .status(404)
        .type("text/plain")
        .send("Not found");
      return;
    }
    // Missing assets must not masquerade as successful HTML pages.
    if (pagePath.startsWith("/api/") || path.extname(pagePath)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }
    // The same React components and HTML are served to people and crawlers.
    // No user-agent branching, extra bot-only copy, or JavaScript dependency for reading.
    if (renderPage && knownPage) {
      try {
        const page = renderPage(pagePath, guides);
        if (page) {
          const template = fs.readFileSync(
            path.resolve(distPath, "index.html"),
            "utf8"
          );
          res
            .set("Cache-Control", "no-store")
            .status(200)
            .type("html")
            .send(renderHTML(template, page, guides));
          return;
        }
      } catch (error) {
        console.error("[SSR] Page rendering failed", pagePath);
        res.status(500).type("text/plain").send("Page rendering failed");
        return;
      }
    }
    // Unknown page URLs render the existing React 404 page with a real 404.
    res
      .status(knownPage ? 200 : 404)
      .type("html")
      .send(
        appendGuideData(
          fs.readFileSync(path.resolve(distPath, "index.html"), "utf8"),
          renderPage ? guides : undefined
        )
      );
  });
}
