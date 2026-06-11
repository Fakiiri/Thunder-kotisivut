// Thunder Kustannus — Kirjapainolaskuri
// Hinnat: Druktava-hinnasto × 2.1 (kate) × 1.135 (ALV 13.5%)
// Kannen materiaali: Metsä Board

import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowRight, Calculator, AlertCircle, BookOpen } from "lucide-react";
import { SOFTCOVER_PRICING, QUANTITIES, PAGE_COUNTS } from "@/lib/pricingData";

// Paperin nimet suomeksi
const PAPER_LABELS: Record<string, string> = {
  "80g Standard": "80g — kevyt (romaanit, runot)",
  "100g Standard": "100g — standardi (tietokirjat)",
  "120g Standard": "120g — paksu (kuvakirjat, oppaat)",
};

// Koon nimet
const FORMAT_LABELS: Record<string, string> = {
  "128x210": "128 × 210 mm",
  "135x210": "135 × 210 mm",
  "148x210": "148 × 210 mm",
  "170x240": "170 × 240 mm",
  "210x297": "210 × 297 mm",
};

// Haetaan uniikkit formaatit ja paperit datasta
const FORMATS = Array.from(new Set(SOFTCOVER_PRICING.map((d) => d.format)));
const PAPERS = Array.from(new Set(SOFTCOVER_PRICING.map((d) => d.paper)));

function fmt(n: number) {
  return n.toLocaleString("fi-FI", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PrintCalculator() {
  const [format, setFormat] = useState<string>("");
  const [paper, setPaper] = useState<string>("");
  const [pages, setPages] = useState<number | "">("");
  const [qty, setQty] = useState<number | "">("");
  const [calculated, setCalculated] = useState(false);

  // Validointi
  const allFilled = format && paper && pages !== "" && qty !== "";

  // Haku datasta
  const result = useMemo(() => {
    if (!allFilled) return null;
    const entry = SOFTCOVER_PRICING.find(
      (d) => d.format === format && d.paper === paper && d.pages === Number(pages)
    );
    if (!entry) return null;
    const unitPrice = (entry.prices as Record<string, number | null>)[String(qty)];
    if (!unitPrice) return null;
    const totalPrice = unitPrice * Number(qty);
    const spine = entry.spine_mm;
    const is32 = Number(pages) === 32;
    return { unitPrice, totalPrice, spine, is32 };
  }, [format, paper, pages, qty, allFilled]);

  const handleCalc = () => {
    if (!allFilled) return;
    setCalculated(true);
  };

  const handleReset = () => {
    setFormat("");
    setPaper("");
    setPages("");
    setQty("");
    setCalculated(false);
  };

  return (
    <section className="thunder-section bg-background">
      <div className="container max-w-3xl">
        {/* Otsikko */}
        <div className="text-center mb-10">
          <span className="orange-line mx-auto" />
          <h2 className="thunder-heading text-4xl md:text-5xl text-foreground mb-3">
            Laske kirjasi hinta
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pehmeäkantinen kirja. Kannen materiaali:{" "}
            <span className="text-foreground font-semibold">Metsä Board</span>.
            Hinnat sisältävät ALV 13,5&nbsp;%.
          </p>
        </div>

        {/* Lomake */}
        <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
          {/* Rivi 1: Koko + Paperi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kirjan koko */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Kirjan koko
              </label>
              <select
                value={format}
                onChange={(e) => { setFormat(e.target.value); setCalculated(false); }}
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Valitse koko…</option>
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_LABELS[f] ?? f}
                  </option>
                ))}
              </select>
            </div>

            {/* Paperin tyyppi */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Paperin tyyppi
              </label>
              <select
                value={paper}
                onChange={(e) => { setPaper(e.target.value); setCalculated(false); }}
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Valitse paperi…</option>
                {PAPERS.map((p) => (
                  <option key={p} value={p}>
                    {PAPER_LABELS[p] ?? p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rivi 2: Sivumäärä + Painosmäärä */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sivumäärä */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sivumäärä
              </label>
              <select
                value={pages}
                onChange={(e) => { setPages(e.target.value === "" ? "" : Number(e.target.value)); setCalculated(false); }}
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Valitse sivumäärä…</option>
                {PAGE_COUNTS.map((p) => (
                  <option key={p} value={p}>
                    {p} sivua{p === 32 ? " (vihko)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Painosmäärä */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Painosmäärä (kpl)
              </label>
              <select
                value={qty}
                onChange={(e) => { setQty(e.target.value === "" ? "" : Number(e.target.value)); setCalculated(false); }}
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Valitse määrä…</option>
                {QUANTITIES.map((q) => (
                  <option key={q} value={q}>
                    {q} kpl
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* --- Nimi + sähköposti (piilotettu pilottivaiheessa) ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Nimi ja sukunimi
              </label>
              <input
                type="text"
                placeholder="Etunimi Sukunimi"
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Sähköpostiosoite
              </label>
              <input
                type="email"
                placeholder="sinä@esimerkki.fi"
                className="w-full rounded-lg border border-border bg-background text-foreground px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          --- Loppu piilotettu osio --- */}

          {/* Laske-nappi */}
          <button
            onClick={handleCalc}
            disabled={!allFilled}
            className={`w-full py-4 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
              allFilled
                ? "thunder-btn-primary cursor-pointer"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <Calculator className="w-5 h-5" />
            Laske hinta
          </button>

          {/* Varoitus jos ei täytetty */}
          {!allFilled && (
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Täytä kaikki kentät laskeaksesi hinnan.
            </p>
          )}

          {/* Tulos */}
          {calculated && result && (
            <div className="mt-2 rounded-xl border border-orange-500/40 bg-orange-500/5 p-6 space-y-4">
              {/* Päähinnat */}
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Kokonaishinta ({qty} kpl)
                  </p>
                  <p className="text-4xl font-extrabold thunder-orange-text">
                    {fmt(result.totalPrice)} €
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    Kappalehinta
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {fmt(result.unitPrice)} € / kpl
                  </p>
                </div>
              </div>

              {/* Tekniset tiedot */}
              <div className="border-t border-border/50 pt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Kirjan selän leveys</p>
                  <p className="font-semibold text-foreground">
                    {result.spine !== null ? `${result.spine} mm` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Kannen materiaali</p>
                  <p className="font-semibold text-foreground">Metsä Board</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Sidonta</p>
                  <p className="font-semibold text-foreground">
                    {result.is32 ? "Niittisidonta (vihko)" : "Liimasidottu pehmeäkantinen"}
                  </p>
                </div>
              </div>

              {/* Huomio 32-sivuisesta */}
              {result.is32 && (
                <p className="text-xs text-orange-400 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  32-sivuinen on niittisidottu vihko — ei liimasidottu.
                </p>
              )}

              {/* CTA */}
              <div className="border-t border-border/50 pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Haluatko edetä? Pyydä ilmainen arvio koko kirjaprojektistasi.
                </p>
                <Link
                  href="/arvio"
                  className="thunder-btn-primary px-6 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2 whitespace-nowrap"
                >
                  Pyydä ilmainen arvio <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Tulos: ei dataa löydy */}
          {calculated && !result && allFilled && (
            <div className="mt-2 rounded-xl border border-border bg-muted/30 p-6 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-semibold mb-1">
                Tälle yhdistelmälle ei löydy hintaa
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Pyydä meiltä räätälöity arvio — löydämme sinulle sopivan ratkaisun.
              </p>
              <Link
                href="/arvio"
                className="thunder-btn-primary px-6 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2"
              >
                Pyydä ilmainen arvio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Nollaa */}
        {calculated && (
          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Laske uudelleen
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
