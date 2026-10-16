import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GUIDES } from "../../client/src/lib/data";

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

export function serveStatic(app: Express, distPath = path.resolve(process.cwd(), "dist", "public")) {
  // Use process.cwd() which is always /app on Railway
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  const pagePaths = new Set([
    "/", "/hinnat", "/kirjat", "/tarjouspyynto", "/arvio", "/oppaat",
    "/meista", "/sopimusehdot", "/tietosuoja", "/yhteystiedot", "/lataa-opas", "/tilaus-kiitos", "/kiitos",
    ...GUIDES.map(guide => `/oppaat/${guide.slug}`),
  ]);

  app.use("*", (req, res) => {
    const pagePath = new URL(req.originalUrl, "http://localhost").pathname.replace(/\/+$/, "") || "/";
    // Missing assets must not masquerade as successful HTML pages.
    if (pagePath.startsWith("/api/") || path.extname(pagePath)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }
    // Unknown page URLs render the existing React 404 page with a real 404.
    res.status(pagePaths.has(pagePath) ? 200 : 404)
      .sendFile(path.resolve(distPath, "index.html"));
  });
}
