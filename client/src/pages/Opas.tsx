import { Fragment } from "react";
import { renderGuideMarkdown, GUIDE_CTA_TITLES } from "@/lib/guide-markdown";
import {
  GuideChecklist,
  GuideEstimate,
  AudioPackageCallout,
} from "@/components/GuideCallsToAction";
import { useGuides } from "@/contexts/GuidesContext";
// Thunder Kustannus — Yksittäinen opas v3 (SEO-parannettu)
// Design: lämmin valkoinen, Plus Jakarta Sans otsikot, Inter body, oranssi aksentti
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

export default function Opas() {
  const GUIDES = useGuides();
  const { slug } = useParams<{ slug: string }>();
  const guide = GUIDES.find(g => g.slug === slug);
  const others = GUIDES.filter(g => g.slug !== slug).slice(0, 3);

  useSEO({
    title: guide ? guide.metaTitle || guide.title : "Opas",
    description: guide
      ? guide.metaDescription || guide.excerpt
      : "Thunder Kustannuksen oppaat kirjailijoille.",
    canonical: guide ? `/oppaat/${guide.slug}` : "/oppaat",
    keywords: guide
      ? `Thunder Kustannus, ${guide.category}, kirjan julkaiseminen, omakustanne, julkaisualusta, ${guide.title}`
      : "Thunder Kustannus, kirjan julkaiseminen",
    ogType: "article",
    noIndex: !guide,
  });

  // Inject Article + BreadcrumbList schema
  useEffect(() => {
    if (!guide) return;
    const schemaId = "article-schema";
    let el = document.getElementById(schemaId);
    if (!el) {
      el = document.createElement("script");
      el.id = schemaId;
      (el as HTMLScriptElement).type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          headline: guide.title,
          description: guide.excerpt,
          datePublished: guide.date,
          dateModified: guide.date,
          author: {
            "@type": "Organization",
            name: "Thunder Kustannus",
          },
          publisher: {
            "@type": "Organization",
            name: "Thunder Kustannus",
            url: "https://thunderkustannus.fi",
          },
          url: `https://thunderkustannus.fi/oppaat/${guide.slug}`,
          inLanguage: "fi",
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Etusivu",
              item: "https://thunderkustannus.fi/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Oppaat",
              item: "https://thunderkustannus.fi/oppaat",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: guide.title,
              item: `https://thunderkustannus.fi/oppaat/${guide.slug}`,
            },
          ],
        },
      ],
    });
    return () => {
      const s = document.getElementById(schemaId);
      if (s) s.remove();
    };
  }, [guide]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-40 text-center container">
          <h1 className="thunder-heading text-4xl text-foreground mb-4">
            Opasta ei löydy
          </h1>
          <Link href="/oppaat" className="thunder-orange underline">
            Palaa oppaiden listaan
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const blocks = renderGuideMarkdown(
    guide.content,
    new Set(GUIDES.map(item => item.slug))
  );
  const half = Math.max(1, Math.floor(blocks.length / 2));
  const headingAfterHalf = blocks.findIndex(
    (block, index) => index >= half && block.type === "h2"
  );
  const middle = headingAfterHalf < 0 ? half : headingAfterHalf;
  const ctaTitle = guide.ctaTitle || GUIDE_CTA_TITLES[guide.slug];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-muted-foreground text-sm mb-10"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              Etusivu
            </Link>
            <span>/</span>
            <Link
              href="/oppaat"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Oppaat
            </Link>
            <span>/</span>
            <span className="text-foreground/60 truncate max-w-[200px]">
              {guide.category}
            </span>
          </nav>

          <header className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest thunder-orange mb-4 block">
              {guide.category}
            </span>
            <h1 className="thunder-heading text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              {guide.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {guide.readTime} lukuaika
              </span>
              <span>•</span>
              <span>
                {new Date(guide.publishDate || guide.date).toLocaleDateString(
                  "fi-FI",
                  {
                    timeZone: "Europe/Helsinki",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          </header>

          <div className="mb-14 prose-content">
            {blocks.map((block, index) => (
              <Fragment key={index}>
                {index === middle && (
                  <>
                    <GuideChecklist />
                    <GuideEstimate title={ctaTitle} compact />
                  </>
                )}
                {block}
              </Fragment>
            ))}
          </div>

          {guide.slug === "kirjan-kustannukset" &&
            GUIDES.some(item => item.slug === "asiantuntijakirja") && (
              <p className="mb-8">
                <Link
                  href="/oppaat/asiantuntijakirja"
                  className="thunder-orange underline underline-offset-4"
                >
                  Lue myös: asiantuntijakirja yrittäjän myyntityökaluna
                </Link>
              </p>
            )}
          {guide.slug === "aanikirjan-tekeminen" && <AudioPackageCallout />}
          <GuideEstimate title={ctaTitle} />

          <p className="mb-12">
            <Link
              href="/asiantuntijakirja"
              className="thunder-orange font-semibold underline underline-offset-4"
            >
              Kirja oman asiantuntijuutesi tueksi? Tutustu asiantuntijakirjan
              julkaisuun →
            </Link>
          </p>
          {others.length > 0 && (
            <div>
              <h2 className="thunder-heading text-2xl text-foreground mb-6">
                Lue myös
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {others.map(g => (
                  <Link
                    key={g.id}
                    href={`/oppaat/${g.slug}`}
                    className="block group"
                  >
                    <div className="thunder-card p-5">
                      <span className="text-xs thunder-orange uppercase tracking-widest mb-2 block">
                        {g.category}
                      </span>
                      <h3 className="text-foreground text-sm font-bold leading-snug group-hover:text-orange-500 transition-colors">
                        {g.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
