import { useGuides } from "@/contexts/GuidesContext";
// Thunder Kustannus — Oppaat-listaussivu v3 (FI/EN)
import { Link } from "wouter";
import { ArrowRight, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuizCTA from "@/components/QuizCTA";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";

export default function Oppaat() {
  const GUIDES = useGuides();
  const { t, lang } = useLang();
  useSEO({
    title: "Thunder Kustannus — Oppaat kirjailijoille",
    description: "Thunder Kustannuksen ilmaiset oppaat kirjailijoille: kirjan julkaiseminen, omakustanne, äänikirja, e-kirja, markkinointi ja jakelu. Käsikirjoituksesta valmiiseen kirjaan.",
    canonical: "/oppaat",
    keywords: "Thunder Kustannus oppaat, kirjan julkaiseminen opas, omakustanne opas, äänikirja opas, kirjan markkinointi, julkaisualusta",
  });

  const g = t.guides;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-2xl mb-14">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-foreground mb-4">
              {g?.h1 ?? "Oppaat kirjailijoille"}
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              {g?.lead ?? "Kaikki mitä tarvitset oman kirjan julkaisemiseen — käsikirjoituksesta valmiiseen kirjaan, markkinointiin ja jakeluun."}
            </p>
            {lang === "en" && g?.guidesOnlyFi && (
              <p className="mt-4 text-sm text-muted-foreground italic border border-border rounded-lg px-4 py-3 bg-white">
                {g.guidesOnlyFi}
              </p>
            )}
          </div>

          <Link href="/asiantuntijakirja" className="block border border-orange-200 bg-orange-50 rounded-xl p-6 mb-8"><span className="font-bold block text-lg mb-2">{lang === "en" ? "A book for your expertise" : "Osaamisestasi asiantuntijakirja"}</span><span className="text-sm text-muted-foreground">{lang === "en" ? "Explore publishing and launch support for experts and entrepreneurs →" : "Tutustu asiantuntijan ja yrittäjän julkaisuun sekä lanseerauksen tukeen →"}</span></Link>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUIDES.map((guide) => (
              <article key={guide.id}>
                <Link href={`/oppaat/${guide.slug}`} className="block group h-full">
                  <div className="thunder-card p-7 h-full flex flex-col">
                    <div className="mb-3">
                      <span className="text-xs font-semibold uppercase tracking-widest thunder-orange">
                        {guide.category}
                      </span>
                    </div>
                    <h2 className="text-foreground font-bold text-lg leading-snug mb-3 group-hover:text-orange-500 transition-colors flex-1">
                      {guide.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">{guide.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground/60 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {guide.readTime}
                      </div>
                      <span className="thunder-orange text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        {g?.readLabel ?? "Lue"} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-20 text-center bg-white border border-border rounded-xl p-12 shadow-sm">
            <h2 className="thunder-heading text-3xl text-foreground mb-4">
              {g?.ctaTitle ?? "Valmis julkaisemaan kirjasi?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {g?.ctaLead ?? "Oppaat antavat tietoa — me hoidamme käytännön työn. Pyydä hinta-arvio kirjaprojektistasi."}
            </p>
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-8 py-4 rounded-lg font-bold inline-flex items-center gap-2">
              {g?.ctaBtn ?? "Pyydä hinta-arvio"} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <div className="container"><QuizCTA source="guides_index" /></div>
      <Footer />
    </div>
  );
}
