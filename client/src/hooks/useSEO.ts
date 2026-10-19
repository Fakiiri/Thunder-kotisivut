// Thunder Kustannus — SEO hook
// Hallitsee kaikkien sivujen meta-tagit, Open Graph ja canonical URL:t

import { createContext, useContext, useEffect } from "react";

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string;
  noIndex?: boolean;
}

// Per-request collector: never store one visitor's metadata in a global variable.
export const ServerSEO = createContext<{ current?: SEOProps } | null>(null);

const SITE_NAME = "Thunder Kustannus";
const BASE_URL = "https://thunderkustannus.fi";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function useSEO({
  title,
  description,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords,
  noIndex = false,
}: SEOProps) {
  const serverSEO = useContext(ServerSEO);
  if (serverSEO) serverSEO.current = { title, description, canonical, ogImage, ogType, keywords, noIndex };
  useEffect(() => {
    // Title
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrVal] = selector.replace("meta[", "").replace("]", "").split('="');
        el.setAttribute(attrName, attrVal.replace('"', ""));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setMetaProp = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Basic meta
    setMetaName("description", description);
    if (keywords) setMetaName("keywords", keywords);
    setMetaName("robots", noIndex || import.meta.env.VITE_EDITORIAL_PREVIEW === "true" ? "noindex, nofollow" : "index, follow");
    setMetaName("author", SITE_NAME);

    // Canonical
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : `${BASE_URL}${window.location.pathname}`;
    setLink("canonical", canonicalUrl);

    // Open Graph
    setMetaProp("og:title", fullTitle);
    setMetaProp("og:description", description);
    setMetaProp("og:type", ogType);
    setMetaProp("og:url", canonicalUrl);
    setMetaProp("og:image", ogImage);
    setMetaProp("og:image:alt", `${SITE_NAME} – Sinun tarinasi kirjaksi`);
    setMetaProp("og:site_name", SITE_NAME);
    setMetaProp("og:locale", "fi_FI");

    // Twitter Card
    setMetaName("twitter:card", "summary_large_image");
    setMetaName("twitter:title", fullTitle);
    setMetaName("twitter:description", description);
    setMetaName("twitter:image", ogImage);
    setMetaName("twitter:image:alt", `${SITE_NAME} – Sinun tarinasi kirjaksi`);

  }, [title, description, canonical, ogImage, ogType, keywords, noIndex]);
}
