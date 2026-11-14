// Thunder Kustannus — Julkaisuopas 2027 -liidimagneetti (etusivulla testin vieressä)
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export const GUIDE_POINTS = {
  fi: [
    "Mitä on ilmaista ja mistä maksat",
    "Kolme laskuesimerkkiä oikealla kirjalla",
    "Tekijänpalkkio, oikeudet ja sopimus selkokielellä",
    "Aikajana viikko viikolta",
    "9 kysymystä ennen kuin allekirjoitat mitään",
    "Päivitetty 10 askeleen tarkistuslista",
  ],
  en: [
    "What is free and what you pay for",
    "Three cost examples with a real book",
    "Royalties, rights and the contract in plain words",
    "A week-by-week timeline",
    "9 questions to ask before you sign anything",
    "The updated 10-step checklist",
  ],
};

export default function GuideMagnetCTA({ source = "home" }: { source?: string }) {
  const { lang } = useLang();
  const en = lang === "en";
  return (
    <aside className="h-full rounded-2xl border border-border bg-white p-7 md:p-10 flex flex-col">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-700">
        <Download size={16} aria-hidden="true" /> {en ? "Free PDF guide" : "Ilmainen PDF-opas"}
      </div>
      <h2 className="thunder-heading text-2xl md:text-3xl mt-4 mb-3">
        {en ? "Publishing guide 2027: everything you ask before you pay" : "Julkaisuopas 2027: kaikki, mitä kysyt ennen kuin maksat"}
      </h2>
      <ul className="space-y-2 mb-6">
        {GUIDE_POINTS[en ? "en" : "fi"].map(p => (
          <li key={p} className="flex items-start gap-2 text-sm text-foreground/80">
            <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 shrink-0" aria-hidden="true" /> {p}
          </li>
        ))}
      </ul>
      <Link
        href={`/lataa-opas?source=${source}`}
        className="mt-auto self-start thunder-btn-outline inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold"
      >
        {en ? "Download the free guide" : "Lataa ilmainen opas"} <ArrowRight size={18} />
      </Link>
    </aside>
  );
}
