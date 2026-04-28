// Thunder Kustannus — Yksittäinen opas v3 (SEO-parannettu)
// Design: lämmin valkoinen, Plus Jakarta Sans otsikot, Inter body, oranssi aksentti
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GUIDES } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";

function renderMarkdown(content: string) {
  const paragraphs = content.trim().split("\n\n").filter(Boolean);
  return paragraphs.map((block, i) => {
    // H2
    if (block.startsWith("## ")) {
      const id = block.replace("## ", "").toLowerCase().replace(/[^a-zäöå0-9]+/gi, "-");
      return (
        <h2 key={i} id={id} className="thunder-heading text-2xl md:text-3xl text-foreground mt-12 mb-4 scroll-mt-24">
          {block.replace("## ", "")}
        </h2>
      );
    }
    // H3
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">
          {block.replace("### ", "")}
        </h3>
      );
    }
    // Table
    if (block.includes("|") && block.includes("---")) {
      const lines = block.split("\n").filter(Boolean);
      const headers = lines[0].split("|").filter(Boolean).map(h => h.trim());
      const rows = lines.slice(2).map(row => row.split("|").filter(Boolean).map(c => c.trim()));
      return (
        <div key={i} className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-orange-50 border-b-2 border-orange-200">
                {headers.map((h, j) => (
                  <th key={j} className="text-left px-4 py-3 font-semibold text-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className={j % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {row.map((cell, k) => (
                    <td key={k} className="px-4 py-3 text-foreground/70 border-b border-gray-100">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    // Bullet list
    if (block.startsWith("- ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- "));
      return (
        <ul key={i} className="space-y-2 my-5 ml-4">
          {items.map((item, j) => (
            <li key={j} className="text-foreground/70 text-base leading-relaxed flex items-start gap-2">
              <span className="thunder-orange mt-1.5 text-xs flex-shrink-0">▸</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="thunder-orange underline hover:opacity-80">$1</a>') }} />
            </li>
          ))}
        </ul>
      );
    }
    // Bold paragraph (starts with **)
    if (block.startsWith("**")) {
      return (
        <p key={i} className="text-foreground text-base leading-relaxed mb-4 font-semibold"
          dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="thunder-orange underline hover:opacity-80">$1</a>') }}
        />
      );
    }
    // Regular paragraph — render bold, italic and links
    return (
      <p key={i} className="text-foreground/70 text-base leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong class='text-foreground'>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="thunder-orange underline hover:opacity-80">$1</a>') }}
      />
    );
  });
}

export default function Opas() {
  const { slug } = useParams<{ slug: string }>();
  const guide = GUIDES.find((g) => g.slug === slug);
  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  useSEO({
    title: guide ? guide.title : "Opas",
    description: guide ? guide.excerpt : "Thunder Kustannuksen oppaat kirjailijoille.",
    canonical: guide ? `/oppaat/${guide.slug}` : "/oppaat",
    keywords: guide ? `${guide.category}, kirjan julkaiseminen, omakustanne, ${guide.title}` : "kirjan julkaiseminen",
    ogType: "article",
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
          "headline": guide.title,
          "description": guide.excerpt,
          "datePublished": guide.date,
          "dateModified": guide.date,
          "author": {
            "@type": "Organization",
            "name": "Thunder Kustannus"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Thunder Kustannus",
            "url": "https://thunderkustannus.fi"
          },
          "url": `https://thunderkustannus.fi/oppaat/${guide.slug}`,
          "inLanguage": "fi"
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Etusivu",
              "item": "https://thunderkustannus.fi/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Oppaat",
              "item": "https://thunderkustannus.fi/oppaat"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": guide.title,
              "item": `https://thunderkustannus.fi/oppaat/${guide.slug}`
            }
          ]
        }
      ]
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
          <h1 className="thunder-heading text-4xl text-foreground mb-4">Opasta ei löydy</h1>
          <Link href="/oppaat" className="thunder-orange underline">Palaa oppaiden listaan</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-muted-foreground text-sm mb-10">
            <Link href="/" className="hover:text-foreground transition-colors">Etusivu</Link>
            <span>/</span>
            <Link href="/oppaat" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Oppaat
            </Link>
            <span>/</span>
            <span className="text-foreground/60 truncate max-w-[200px]">{guide.category}</span>
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
              <span>{new Date(guide.date).toLocaleDateString("fi-FI", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </header>

          <div className="mb-14 prose-content">
            {renderMarkdown(guide.content)}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 mb-14 text-center">
            <h3 className="thunder-heading text-2xl text-foreground mb-3">
              Valmis julkaisemaan kirjasi?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thunder Kustannus hoitaa kaiken — taitosta jakeluun. Pyydä ilmainen tarjous tänään.
            </p>
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-8 py-3 rounded-lg font-bold inline-flex items-center gap-2">
              Pyydä tarjous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {others.length > 0 && (
            <div>
              <h2 className="thunder-heading text-2xl text-foreground mb-6">Lue myös</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {others.map((g) => (
                  <Link key={g.id} href={`/oppaat/${g.slug}`} className="block group">
                    <div className="thunder-card p-5">
                      <span className="text-xs thunder-orange uppercase tracking-widest mb-2 block">{g.category}</span>
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
