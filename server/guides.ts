import fs from "node:fs";
import path from "node:path";
import type { Express } from "express";
import { GUIDES } from "../client/src/lib/data";
import { publishedGuides, type Guide } from "../shared/guides";

export function parseGuideMarkdown(source: string): Guide {
  const match = source
    .replace(/\r\n/g, "\n")
    .match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Guide frontmatter missing");
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([a-z_]+):\s*(.*?)\s*$/);
    if (pair)
      fields[pair[1]] = pair[2].startsWith('"') ? JSON.parse(pair[2]) : pair[2];
  }
  const date = fields.julkaisupaiva;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error("Invalid guide publication date");
  if (
    !/^[a-z0-9-]+$/.test(fields.slug || "") ||
    !fields.title ||
    !fields.meta_description
  )
    throw new Error("Guide metadata incomplete");
  const body = match[2].trim();
  const heading = body.match(/^# (.+)\n/);
  // Explicit public whitelist: segmentti/myyntitavoite and editorial notes never leave the server.
  return {
    id: fields.slug,
    slug: fields.slug,
    title: heading?.[1] || fields.title.replace(/ \| Thunder Kustannus$/, ""),
    metaTitle: fields.title,
    excerpt: fields.meta_description,
    metaDescription: fields.meta_description,
    category: fields.kategoria,
    readTime: fields.lukuaika,
    date,
    publishDate: date,
    ctaTitle: fields.cta_title,
    content: heading ? body.slice(heading[0].length).trim() : body,
  };
}

export function loadScheduledGuides(
  directory = path.resolve(process.cwd(), "content/guides")
): Guide[] {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory)
    .filter(file => file.endsWith(".md"))
    .map(file =>
      parseGuideMarkdown(fs.readFileSync(path.join(directory, file), "utf8"))
    );
}
export function getPublicGuides(now = new Date()): Guide[] {
  const guides = [...GUIDES, ...loadScheduledGuides()];
  if (new Set(guides.map(guide => guide.slug)).size !== guides.length)
    throw new Error("Duplicate guide slug");
  const visible = publishedGuides(guides, now);
  const slugs = new Set(visible.map(guide => guide.slug));
  return visible.map(guide => ({
    ...guide,
    content: guide.content.replace(
      /\[([^\]]+)\]\(\/oppaat\/([a-z0-9-]+)(?:[?#][^)]*)?\)/g,
      (match, label, slug) => (slugs.has(slug) ? match : label)
    ),
  }));
}

export function makeSitemap(template: string, guides: readonly Guide[]) {
  const withoutGuideArticles = template.replace(
    /\s*<url>\s*<loc>https:\/\/thunderkustannus\.fi\/oppaat\/[^<]+<\/loc>[\s\S]*?<\/url>/g,
    ""
  );
  const articles = guides
    .map(
      guide =>
        `  <url><loc>https://thunderkustannus.fi/oppaat/${guide.slug}</loc><lastmod>${guide.publishDate || guide.date}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
    )
    .join("\n");
  return withoutGuideArticles.replace("</urlset>", `${articles}\n</urlset>`);
}

export function registerGuideRoutes(app: Express) {
  app.get("/api/guides", (_req, res) => {
    res.set("Cache-Control", "no-store").json({ guides: getPublicGuides() });
  });
  app.get("/arvio", (req, res) => {
    const query = req.originalUrl.includes("?")
      ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
      : "";
    res.redirect(301, `/tarjouspyynto${query}`);
  });
  app.get("/sitemap.xml", (_req, res) => {
    const template = fs.readFileSync(
      path.resolve(process.cwd(), "client/public/sitemap.xml"),
      "utf8"
    );
    res
      .set("Cache-Control", "no-store")
      .type("application/xml")
      .send(makeSitemap(template, getPublicGuides()));
  });
}
