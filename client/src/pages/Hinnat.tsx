// Thunder Kustannus — Hinnoittelusivu v2 (vaalea)
import { Link } from "wouter";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES, COMPANY } from "@/lib/data";

export default function Hinnat() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="orange-line mx-auto" />
            <h1 className="thunder-heading text-5xl md:text-6xl text-foreground mb-4">
              Selkeä hinnoittelu
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Ei piilokuluja. Ei yllätyksiä. Kaikki hinnat sisältävät ammattimaisen palvelun alusta loppuun.
            </p>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-xl p-8 border flex flex-col transition-all ${
                  pkg.highlight
                    ? "border-orange-400 bg-white shadow-[0_0_0_1px_oklch(0.68_0.20_42/0.3),0_12px_48px_oklch(0.68_0.20_42/0.12)]"
                    : "border-border bg-white hover:shadow-md"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="thunder-orange-bg text-white text-xs font-bold px-5 py-1.5 rounded-full uppercase tracking-wider">
                      Suosituin
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-2">{pkg.tagline}</p>
                  <h2 className="text-foreground text-3xl font-extrabold mb-4">{pkg.name}</h2>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="thunder-orange text-5xl font-extrabold">{pkg.price} €</span>
                    <span className="text-muted-foreground text-sm">{pkg.priceNote}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{pkg.description}</p>
                </div>

                <div className="flex-1 mb-8">
                  <p className="text-foreground/40 text-xs uppercase tracking-widest mb-4">Sisältyy</p>
                  <ul className="space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {pkg.notIncluded.length > 0 && (
                    <>
                      <p className="text-foreground/30 text-xs uppercase tracking-widest mt-6 mb-3">Ei sisälly</p>
                      <ul className="space-y-2">
                        {pkg.notIncluded.map((f) => (
                          <li key={f} className="flex items-start gap-3 text-sm text-foreground/35">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <Link
                  href="/tarjouspyynto"
                  className={`w-full py-3.5 rounded-lg text-sm font-bold text-center block transition-all ${
                    pkg.highlight ? "thunder-btn-primary" : "thunder-btn-outline"
                  }`}
                >
                  {pkg.cta} <ArrowRight className="inline w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="max-w-3xl mx-auto">
            <h2 className="thunder-heading text-3xl text-foreground mb-8 text-center">Usein kysytyt kysymykset</h2>
            <div className="space-y-3">
              {[
                { q: "Kuinka kauan julkaisuprosessi kestää?", a: "Tyypillisesti 4–8 viikkoa käsikirjoituksen vastaanottamisesta valmiiseen kirjaan. Äänikirjan tuotanto voi lisätä 2–4 viikkoa." },
                { q: "Säilytänkö oikeudet kirjaani?", a: "Kyllä, täysin. Kirjailija omistaa aina tekijänoikeudet kirjaansa. Me hoidamme julkaisuprosessin, mutta oikeudet pysyvät sinulla." },
                { q: "Miten tekijänpalkkiot maksetaan?", a: "Maksamme tekijänpalkkiot neljännesvuosittain. Saat yksityiskohtaiset myyntiraportit kaikista jakelukanavista." },
                { q: "Voinko muuttaa kirjan hintaa myöhemmin?", a: "Kyllä. Voit muuttaa kirjan myyntihintaa milloin tahansa — me päivitämme hinnan kaikkiin jakelukanaviin." },
                { q: "Mitä tapahtuu jos haluan lopettaa sopimuksen?", a: "Sopimus on irtisanottavissa 3 kuukauden varoitusajalla. Kirjasi poistetaan jakelusta ja oikeudet pysyvät sinulla." },
              ].map((item) => (
                <details
                  key={item.q}
                  className="group border border-border rounded-xl bg-white overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer text-foreground font-semibold text-sm hover:text-orange-500 transition-colors list-none">
                    {item.q}
                    <span className="thunder-orange group-open:rotate-45 transition-transform text-xl font-light">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <p className="text-muted-foreground mb-6">Etkö löydä sopivaa pakettia? Tehdään sinulle räätälöity tarjous.</p>
            <Link href="/tarjouspyynto" className="thunder-btn-primary px-10 py-4 rounded-lg text-base font-bold inline-flex items-center gap-2">
              Pyydä räätälöity tarjous <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
