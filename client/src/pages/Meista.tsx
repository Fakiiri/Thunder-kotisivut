// Thunder Kustannus — Meistä v3 (FI/EN)
import { Link } from "wouter";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";

export default function Meista() {
  const { t, lang } = useLang();
  const ae = t.aboutExtended;

  useSEO({
    title: "Thunder Kustannus — Meistä",
    description: "Thunder Kustannus on suomalainen hybridijulkaisualusta kirjailijoille. Yhdistämme ammattimaisen kustannustoiminnan ja kirjailijan täyden kontrollin. Oikeudet pysyvät sinulla — me hoidamme loput.",
    canonical: "/meista",
    keywords: "Thunder Kustannus, suomalainen julkaisualusta, julkaisualusta, hybridijulkaisualusta, omakustanne, Iron Mom Finland",
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

  const stats = [
    {
      label: ae?.statsDistribution ?? "Jakelu",
      value: ae?.statsDistributionValue ?? "7+ kanavaa",
    },
    {
      label: ae?.statsTime ?? "Julkaisuaika",
      value: ae?.statsTimeValue ?? "4–8 viikkoa",
    },
    {
      label: ae?.statsRoyalty ?? "Tekijänpalkkio",
      value: ae?.statsRoyaltyValue ?? "60–70 %",
    },
    {
      label: ae?.statsRights ?? "Oikeudet",
      value: ae?.statsRightsValue ?? "Kirjailijalla",
    },
  ];

  const values = [
    {
      title: ae?.value1Title ?? "Läpinäkyvyys",
      desc: ae?.value1Desc ?? "Selkeät hinnat, selkeät sopimukset. Tiedät aina tarkalleen mitä saat ja mitä se maksaa.",
    },
    {
      title: ae?.value2Title ?? "Kirjailijan oikeudet",
      desc: ae?.value2Desc ?? "Sinä omistat kirjasi. Aina. Me olemme palveluntarjoaja, emme oikeuksien omistaja.",
    },
    {
      title: ae?.value3Title ?? "Laatu",
      desc: ae?.value3Desc ?? "Ammattimainen taitto, kansisuunnittelu ja äänikirjatuotanto. Kirjasi ansaitsee parhaan.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-4xl">
          <div className="mb-16">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-foreground mb-6">{t.about.h1}</h1>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
              {ae?.origin ?? "Thunder Kustannus syntyi yhdestä yksinkertaisesta havainnosta: kirjailijoilla on tarinoita, mutta heillä ei ole välineitä tai tietoa niiden julkaisemiseen ammattimaisesti. Rakensimme alustan, joka muuttaa tämän."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="thunder-heading text-3xl text-foreground mb-4">
                {ae?.whyTitle ?? "Miksi Thunder Kustannus?"}
              </h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>{ae?.why1 ?? "Perinteiset kustantamot hylkäävät yli 99 % käsikirjoituksista. Prosessi kestää vuosia. Kirjailija saa vain murto-osan myyntituloista."}</p>
                <p>{ae?.why2 ?? "Toisessa ääripäässä on täysin omatoiminen julkaiseminen — mutta se vaatii osaamista taitosta jakelusopimusten neuvotteluun ja markkinointiin."}</p>
                <p>{ae?.why3 ?? "Thunder Kustannus on kolmas tie: kirjailijoiden julkaisualusta, jossa yhdistyvät ammattimainen kustannustoiminta ja kirjailijan täysi kontrolli. Sinä omistat kirjasi ja saat suurimman osan tuloista — me hoidamme taiton, kannen, ISBN:n ja jakelun."}</p>
              </div>
            </div>
            <div className="space-y-4">
              {stats.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-border pb-4">
                  <span className="text-muted-foreground text-sm">{item.label}</span>
                  <span className="thunder-orange font-extrabold text-xl">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-foreground mb-8">
              {ae?.valuesTitle ?? "Arvomme"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((v) => (
                <div key={v.title} className="thunder-card p-6">
                  <div className="w-8 h-1 thunder-orange-bg rounded mb-4" />
                  <h3 className="text-foreground font-bold text-lg mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-foreground mb-8">
              {ae?.distributionTitle ?? "Jakeluverkostomme"}
            </h2>
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
