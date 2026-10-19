import { Link } from "wouter";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { KlarnaNote } from "./PackagePurchase";

export function GuideChecklist() {
  return (
    <aside className="my-10 rounded-xl border border-orange-200 bg-orange-50 p-6 md:p-8">
      <ClipboardCheck className="thunder-orange mb-3" aria-hidden="true" />
      <h2 className="font-bold text-xl mb-3">
        Lataa ilmainen 10 askeleen tarkistuslista
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground mb-4">
        Et ole vielä valmis julkaisemaan? Tarkistuslista auttaa hahmottamaan
        seuraavat askeleet käsikirjoituksesta valmiiseen kirjaan.
      </p>
      <Link
        href="/lataa-opas"
        className="thunder-orange font-bold inline-flex items-center gap-2"
      >
        Lataa tarkistuslista
        <ArrowRight size={16} />
      </Link>
    </aside>
  );
}
export function GuideEstimate({
  title = "Valmis julkaisemaan kirjasi?",
  compact = false,
}: {
  title?: string;
  compact?: boolean;
}) {
  return (
    <aside className="bg-orange-50 border border-orange-200 rounded-xl p-6 md:p-8 my-10 text-center">
      <h2 className="thunder-heading text-2xl text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground mb-5 max-w-xl mx-auto">
        Kerro käsikirjoituksestasi ja tavoitteistasi. Etsitään kirjallesi sopiva
        julkaisutapa ja sovitaan realistinen aikataulu.
      </p>
      {!compact && (
        <p className="text-sm leading-relaxed mb-5 text-muted-foreground">
          Digi 890 € · Printti 1 690 € · Premium 2 990 € (sis. ALV 25,5 %).
          Valmiille, alle 250-sivuisille käsikirjoituksille. Oikoluku ja
          sisällön muokkaus eivät sisälly paketteihin.
        </p>
      )}
      <Link
        href="/tarjouspyynto"
        className="thunder-btn-primary px-7 py-3 rounded-lg font-bold inline-flex items-center gap-2"
      >
        Pyydä hinta-arvio
        <ArrowRight size={16} />
      </Link>
      <KlarnaNote />
    </aside>
  );
}
export function AudioPackageCallout() {
  return (
    <aside className="my-10 rounded-xl bg-[#191918] text-white p-7">
      <h2 className="font-bold text-2xl mb-4">
        Thunderin Digi-paketissa äänikirja on mukana.
      </h2>
      <p className="leading-relaxed text-white/80 mb-4">
        890 € (sis. ALV 25,5 %) sisältää taiton, kannen, e-kirjan, äänikirjan ja
        jakelun Storyteliin, BookBeatiin, Nextoryyn ja Spotifyhin.
      </p>
      <Link
        href="/hinnat"
        className="text-orange-400 font-bold underline underline-offset-4"
      >
        Katso Digi-paketin sisältö ja rajaukset
      </Link>
    </aside>
  );
}
