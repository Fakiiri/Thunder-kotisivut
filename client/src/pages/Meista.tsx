// Thunder Kustannus — Meistä-sivu
import { Link } from "wouter";
import { ArrowRight, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";

export default function Meista() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="mb-16">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-white mb-6">
              Meistä
            </h1>
            <p className="text-white/60 text-xl leading-relaxed max-w-2xl">
              Thunder Kustannus syntyi yhdestä yksinkertaisesta havainnosta: kirjailijoilla on tarinoita, mutta heillä ei ole välineitä tai tietoa niiden julkaisemiseen ammattimaisesti.
            </p>
          </div>

          {/* Story */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="thunder-heading text-3xl text-white mb-4">Miksi Thunder Kustannus?</h2>
              <div className="space-y-4 text-white/60 text-base leading-relaxed">
                <p>
                  Perinteiset kustantamot hylkäävät yli 99 % käsikirjoituksista. Prosessi kestää vuosia. Kirjailija saa vain murto-osan myyntituloista.
                </p>
                <p>
                  Toisessa ääripäässä on täysin omatoiminen julkaiseminen — mutta se vaatii osaamista taitosta, jakelusopimusten neuvotteluun ja markkinointiin.
                </p>
                <p>
                  Thunder Kustannus on kolmas tie: ammattimainen palvelukustantamo, jossa kirjailija säilyttää kontrollin ja oikeudet, mutta saa kaiken tarvitsemansa avun.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: "Jakelu", value: "7+ kanavaa" },
                { label: "Julkaisuaika", value: "4–8 viikkoa" },
                { label: "Tekijänpalkkio", value: "70–80 %" },
                { label: "Oikeudet", value: "Kirjailijalla" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-white/50 text-sm">{item.label}</span>
                  <span className="thunder-orange font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-white mb-8">Arvomme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Läpinäkyvyys",
                  desc: "Selkeät hinnat, selkeät sopimukset. Tiedät aina tarkalleen mitä saat ja mitä se maksaa.",
                },
                {
                  title: "Kirjailijan oikeudet",
                  desc: "Sinä omistat kirjasi. Aina. Me olemme palveluntarjoaja, emme oikeuksien omistaja.",
                },
                {
                  title: "Laatu",
                  desc: "Ammattimainen taitto, kansisuunnittelu ja äänikirjatuotanto. Kirjasi ansaitsee parhaan.",
                },
              ].map((v) => (
                <div key={v.title} className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-6">
                  <div className="w-8 h-1 thunder-orange-bg rounded mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
                    {v.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution */}
          <div className="mb-20">
            <h2 className="thunder-heading text-3xl text-white mb-8">Jakeluverkostomme</h2>
            <div className="flex flex-wrap gap-3">
              {COMPANY.distribution.map((d) => (
                <span
                  key={d}
                  className="px-5 py-2.5 border border-white/15 rounded-full text-white/70 text-sm font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-6 mb-12">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-4 h-4 thunder-orange" />
              <span className="text-white font-semibold text-sm" style={{ fontFamily: "Syne, sans-serif" }}>
                {COMPANY.legalName}
              </span>
            </div>
            <p className="text-white/40 text-xs">
              Rekisteröity Suomessa. Kaikki palvelut tuotetaan suomen kielellä.
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-10 py-4 rounded font-bold inline-flex items-center gap-2 text-base">
              Aloita kirjaprojektisi <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
