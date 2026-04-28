// Thunder Kustannus — Yksittäinen opas-sivu (SEO-optimoitu)
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GUIDES } from "@/lib/data";

export default function Opas() {
  const { slug } = useParams<{ slug: string }>();
  const guide = GUIDES.find((g) => g.slug === slug);
  const others = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  if (!guide) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-40 text-center container">
          <h1 className="thunder-heading text-4xl text-white mb-4">Opasta ei löydy</h1>
          <Link href="/oppaat" className="thunder-orange underline">Palaa oppaiden listaan</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const paragraphs = guide.content.trim().split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/40 text-sm mb-10">
            <Link href="/oppaat" className="hover:text-white transition-colors inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Oppaat
            </Link>
            <span>/</span>
            <span className="text-white/60">{guide.category}</span>
          </div>

          {/* Article header */}
          <header className="mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest thunder-orange mb-4 block">
              {guide.category}
            </span>
            <h1 className="thunder-heading text-4xl md:text-5xl text-white mb-6 leading-tight">
              {guide.title}
            </h1>
            <div className="flex items-center gap-4 text-white/40 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {guide.readTime} lukuaika
              </span>
              <span>•</span>
              <span>{new Date(guide.date).toLocaleDateString("fi-FI", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </header>

          {/* Article content */}
          <div className="prose-thunder mb-16">
            {paragraphs.map((block, i) => {
              if (block.startsWith("## ")) {
                return (
                  <h2 key={i} className="thunder-heading text-2xl md:text-3xl text-white mt-10 mb-4">
                    {block.replace("## ", "")}
                  </h2>
                );
              }
              if (block.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-bold text-white mt-8 mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
                    {block.replace("### ", "")}
                  </h3>
                );
              }
              if (block.startsWith("- ")) {
                const items = block.split("\n").filter((l) => l.startsWith("- "));
                return (
                  <ul key={i} className="space-y-2 mb-6 ml-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-white/70 text-base leading-relaxed flex items-start gap-2">
                        <span className="thunder-orange mt-1.5 text-xs">▸</span>
                        {item.replace("- ", "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-white/70 text-base leading-relaxed mb-5">
                  {block}
                </p>
              );
            })}
          </div>

          {/* CTA box */}
          <div className="bg-[oklch(0.13_0.006_240)] border border-orange-400/30 rounded-xl p-8 mb-16 text-center">
            <h3 className="thunder-heading text-2xl text-white mb-3">
              Valmis julkaisemaan kirjasi?
            </h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Thunder Kustannus hoitaa kaiken — taitosta jakeluun. Pyydä ilmainen tarjous tänään.
            </p>
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-8 py-3 rounded font-bold inline-flex items-center gap-2">
              Pyydä tarjous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Related guides */}
          {others.length > 0 && (
            <div>
              <h2 className="thunder-heading text-2xl text-white mb-6">Lue myös</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {others.map((g) => (
                  <Link key={g.id} href={`/oppaat/${g.slug}`} className="block group">
                    <div className="rounded-lg border border-white/10 bg-[oklch(0.11_0.005_240)] p-5 hover:border-orange-400/30 transition-all">
                      <span className="text-xs thunder-orange uppercase tracking-widest mb-2 block">{g.category}</span>
                      <h3 className="text-white text-sm font-bold leading-snug group-hover:text-orange-300 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
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
