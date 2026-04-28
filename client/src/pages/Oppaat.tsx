// Thunder Kustannus — Oppaat-listaussivu (SEO-optimoitu)
import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GUIDES } from "@/lib/data";

const categories = ["Kaikki", ...Array.from(new Set(GUIDES.map((g) => g.category)))];

export default function Oppaat() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-white mb-4">
              Oppaat kirjailijoille
            </h1>
            <p className="text-white/60 text-xl leading-relaxed">
              Kaikki mitä tarvitset oman kirjan julkaisemiseen — käsikirjoituksesta valmiiseen kirjaan, markkinointiin ja jakeluun.
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 rounded-full border border-white/15 text-white/60 text-sm hover:border-orange-400/50 hover:text-orange-300 cursor-pointer transition-colors"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Guides grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUIDES.map((guide) => (
              <article key={guide.id}>
                <Link href={`/oppaat/${guide.slug}`} className="block group h-full">
                  <div className="rounded-xl border border-white/10 bg-[oklch(0.11_0.005_240)] p-7 h-full flex flex-col hover:border-orange-400/30 transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.70_0.19_42/0.08)]">
                    <div className="mb-4">
                      <span className="text-xs font-semibold uppercase tracking-widest thunder-orange">
                        {guide.category}
                      </span>
                    </div>
                    <h2 className="text-white font-bold text-xl leading-snug mb-3 group-hover:text-orange-300 transition-colors flex-1" style={{ fontFamily: "Syne, sans-serif" }}>
                      {guide.title}
                    </h2>
                    <p className="text-white/50 text-sm leading-relaxed mb-6">{guide.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-white/30 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readTime}
                      </div>
                      <span className="thunder-orange text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Lue <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-20 text-center bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-12">
            <h2 className="thunder-heading text-3xl text-white mb-4">
              Valmis julkaisemaan kirjasi?
            </h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              Oppaat antavat tietoa — me hoidamme käytännön työn. Pyydä tarjous ja aloitetaan.
            </p>
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-8 py-4 rounded font-bold inline-flex items-center gap-2">
              Pyydä tarjous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
