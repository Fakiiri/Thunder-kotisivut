// Thunder Kustannus — Meistä v2 (vaalea)
import { Link } from "wouter";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";

export default function Meista() {
  const { t } = useLang();
  useSEO({
    title: "Thunder Kustannus — Meistä",
    description: "Thunder Kustannus on suomalainen hybridijulkaisualusta kirjailijoille. Yhdistämme ammattimaisen kustannustoiminnan ja kirjailijan täyden kontrollin. Oikeudet pysyvät sinulla — me hoidamme loput.",
    canonical: "/meista",
    keywords: "Thunder Kustannus, suomalainen kustantamo, hybridikustantamo, hybridijulkaisualusta, omakustanne, Iron Mom Finland",
  });

  useEffect(() => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Thunder Kustannus — Meistä",
      "url": "https://thunderkustannus.fi/meista",
      "description": "Thunder Kustannus on suomalainen hybridijulkaisualusta kirjailijoille — omakustannekirjat, e-kirjat ja äänikirjat ammattimaisesti.",
      "publisher": {
        "@type": "Organization",
        "name": "Thunder Kustannus",
        "legalName": "Iron Mom Finland OY",
        "url": "https://thunderkustannus.fi"
      }
    };
    let el = document.getElementById('meista-schema');
    if (!el) {
      el = document.createElement('script');
      el.id = 'meista-schema';
      (el as HTMLScriptElement).type = 'application/ld+json';
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(schema);
    return () => { el?.remove(); };
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-4xl">
          <div className="mb-16">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-foreground mb-6">{t.about.h1}</h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
              Thunder Kustannus syntyi yhdestä yksinkertaisesta havainnosta: kirjailijoilla on tarinoita, mutta heillä ei ole välineitä tai tietoa niiden julkaisemiseen ammattimaisesti. Rakensimme alustan, joka muuttaa tämän.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="thunder-heading text-3xl text-foreground mb-4">Miksi Thunder Kustannus?</h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>Perinteiset kustantamot hylkäävät yli 99 % käsikirjoituksista. Prosessi kestää vuosia. Kirjailija saa vain murto-osan myyntituloista.</p>
                <p>Toisessa ääripäässä on täysin omatoiminen julkaiseminen — mutta se vaatii osaamista taitosta jakelusopimusten neuvotteluun ja markkinointiin.</p>
                <p>Thunder Kustannus on kolmas tie: kirjailijoiden julkaisualusta, jossa yhdistyvät ammattimainen kustannustoiminta ja kirjailijan täysi kontrolli. Sinä omistat kirjasi ja saat suurimman osan tuloista — me hoidamme taiton, kannen, ISBN:n ja jakelun.</p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Jakelu", value: "7+ kanavaa" },
                { label: "Julkaisuaika", value: "4–8 viikkoa" },
                { label: "Tekijänpalkkio", value: "60–70 %" },
                { label: "Oikeudet", value: "Kirjailijalla" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <span className="thunder-orange font-extrabold text-xl">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-foreground mb-8">Arvomme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Läpinäkyvyys", desc: "Selkeät hinnat, selkeät sopimukset. Tiedät aina tarkalleen mitä saat ja mitä se maksaa." },
                { title: "Kirjailijan oikeudet", desc: "Sinä omistat kirjasi. Aina. Me olemme palveluntarjoaja, emme oikeuksien omistaja." },
                { title: "Laatu", desc: "Ammattimainen taitto, kansisuunnittelu ja äänikirjatuotanto. Kirjasi ansaitsee parhaan." },
              ].map((v) => (
                <div key={v.title} className="thunder-card p-6">
                  <div className="w-8 h-1 thunder-orange-bg rounded mb-4" />
                  <h3 className="text-foreground font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-foreground mb-8">Jakeluverkostomme</h2>
            <div className="flex flex-wrap gap-3">
              {COMPANY.distribution.map((d) => (
                <span key={d} className="px-5 py-2.5 border border-border rounded-full text-foreground/60 text-sm font-medium bg-white hover:border-orange-300 transition-colors">
                  {d}
                </span>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-10 py-4 rounded-lg font-bold inline-flex items-center gap-2 text-base">
              {t.about.ctaBtn} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
