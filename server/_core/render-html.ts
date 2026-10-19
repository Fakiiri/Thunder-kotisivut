import type { Guide } from "../../shared/guides";
export interface RenderedPage {
  body: string;
  seo: {
    title: string;
    description: string;
    canonical?: string;
    keywords?: string;
    ogImage?: string;
    ogType?: string;
    noIndex?: boolean;
  };
}
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!
  );
export function appendGuideData(html: string, guides?: readonly Guide[]) {
  if (!guides) return html;
  const json = JSON.stringify(guides)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return html.replace(
    "</head>",
    () => `<script>window.__THUNDER_GUIDES__=${json};</script></head>`
  );
}
export function renderHTML(
  template: string,
  page: RenderedPage,
  guides?: readonly Guide[]
) {
  const seo = page.seo;
  const title = seo.title.includes("Thunder Kustannus")
    ? seo.title
    : `${seo.title} | Thunder Kustannus`;
  const canonical = `https://thunderkustannus.fi${seo.canonical || "/"}`;
  const values: Record<string, string> = {
    description: seo.description,
    robots: seo.noIndex ? "noindex, nofollow" : "index, follow",
    keywords: seo.keywords || "Thunder Kustannus, kirjan julkaisu",
    "og:title": title,
    "og:description": seo.description,
    "og:url": canonical,
    "og:type": seo.ogType || "website",
    "og:image": seo.ogImage || "https://thunderkustannus.fi/og-image.png",
    "twitter:title": title,
    "twitter:description": seo.description,
  };
  let html = template.replace(
    /<title>[\s\S]*?<\/title>/,
    () => `<title>${escape(title)}</title>`
  );
  for (const [name, value] of Object.entries(values)) {
    const attribute = name.startsWith("og:") ? "property" : "name";
    const tag = `<meta ${attribute}="${name}" content="${escape(value)}" />`;
    const pattern = new RegExp(`<meta ${attribute}="${name}"[^>]*>`);
    html = pattern.test(html)
      ? html.replace(pattern, () => tag)
      : html.replace("</head>", () => `${tag}</head>`);
  }
  html = html.replace(
    /<link rel="canonical"[^>]*>/,
    () => `<link rel="canonical" href="${escape(canonical)}" />`
  );
  return appendGuideData(
    html.replace(
      '<div id="root"></div>',
      () => `<div id="root">${page.body}</div>`
    ),
    guides
  );
}
