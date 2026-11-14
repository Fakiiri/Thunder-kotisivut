// Thunder Kustannus — Usein kysytyt kysymykset (6 aihetta)
import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuizCTA from "@/components/QuizCTA";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";
import { FAQ } from "@/lib/publishing-content";

export default function Ukk() {
  const { lang } = useLang();
  const l = lang === "en" ? "en" : "fi";
  useSEO({
    title: l === "en" ? "Frequently asked questions" : "Usein kysytyt kysymykset kirjan julkaisusta",
    description:
      "Vastaukset kirjan julkaisun kysymyksiin: oikeudet, sopimus, käsikirjoitus, äänikirja, jakelu, hinta ja tekijänpalkkio. Thunder Kustannus.",
    canonical: "/ukk",
    keywords: "omakustanne kysymykset, kirjan julkaisu ukk, tekijänpalkkio, kirjan oikeudet, äänikirja hinta",
  });

  useEffect(() => {
    const id = "ukk-schema";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      (el as HTMLScriptElement).type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.flatMap(c =>
        c.items.map(i => ({ "@type": "Question", name: i.q.fi, acceptedAnswer: { "@type": "Answer", text: i.a.fi } }))
      ),
    });
    return () => el?.remove();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-4xl">
          <span className="orange-line" />
          <h1 className="thunder-heading text-4xl md:text-5xl mb-4">
            {l === "en" ? "Frequently asked questions" : "Usein kysytyt kysymykset"}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            {l === "en"
              ? "Straight answers about money, rights and schedule. If your question is not here, ask us. A person replies within 24 hours."
              : "Suorat vastaukset rahasta, oikeuksista ja aikataulusta. Jos kysymystäsi ei löydy, kysy meiltä. Ihminen vastaa 24 tunnin sisällä."}
          </p>

          <nav aria-label={l === "en" ? "Topics" : "Aiheet"} className="flex flex-wrap gap-2 mb-12">
            {FAQ.map(c => (
              <a key={c.id} href={`#${c.id}`} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-orange-400 hover:text-orange-600">
                {c.title[l]}
              </a>
            ))}
          </nav>

          <div className="space-y-12">
            {FAQ.map(c => (
              <section key={c.id} id={c.id} className="scroll-mt-28">
                <h2 className="thunder-heading text-2xl md:text-3xl mb-4">{c.title[l]}</h2>
                <div className="divide-y divide-border rounded-xl border border-border bg-white">
                  {c.items.map(i => (
                    <details key={i.q.fi} className="group p-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                        {i.q[l]}
                        <ChevronDown className="w-5 h-5 shrink-0 text-orange-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                      </summary>
                      <p className="mt-3 text-foreground/75 leading-relaxed">{i.a[l]}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Link href="/nain-julkaiset" className="thunder-btn-outline inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold">
              {l === "en" ? "How publishing works" : "Näin julkaisu etenee"} <ArrowRight size={18} />
            </Link>
            <Link href="/tarjouspyynto" className="thunder-btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold">
              {l === "en" ? "Get a free estimate" : "Pyydä hinta-arvio"} <ArrowRight size={18} />
            </Link>
          </div>
          <QuizCTA source="ukk" />
        </div>
      </div>
      <Footer />
    </div>
  );
}
