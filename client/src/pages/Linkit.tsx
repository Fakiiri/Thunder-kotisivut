// /linkit (tehtävä 004): Instagramin ja Facebookin bio. ?source=ig-bio | fb-bio
import { ArrowRight } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { analyticsAllowed } from "@/lib/purchase-analytics";

export const LINKIT_BUTTONS = [
  { id: "testi", label: "Tee 2 minuutin testi", href: "/julkaisutesti", primary: true },
  { id: "puhelu", label: "Varaa ilmainen julkaisupuhelu", href: "/varaa-puhelu" },
  { id: "hinnat", label: "Katso hinnat", href: "/hinnat" },
  { id: "kurssi", label: "Ilmainen kurssi: kirjasi suunnitelma 5 päivässä", href: "/kirjasi-5-paivassa" },
  { id: "muistelma", label: "Muistelman 52 kysymystä", href: "/muistelman-aloitus" },
] as const;

export function linkitSource(search: string): string {
  const s = new URLSearchParams(search).get("source");
  return s && /^[a-z0-9_-]{1,40}$/.test(s) ? s : "ig-bio";
}

export default function Linkit() {
  useSEO({
    title: "Linkit",
    description: "Julkaise kirjasi 4–8 viikossa. Äänikirja mukana jo 890 €.",
    canonical: "/linkit",
    noIndex: true,
  });
  const source = typeof window === "undefined" ? "ig-bio" : linkitSource(window.location.search);

  const track = (id: string) => {
    try {
      if (analyticsAllowed(window.localStorage))
        window.gtag?.("event", "select_content", { content_type: "linkit", item_id: id, source });
    } catch {
      // mittaus ei saa estää klikkiä
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/15 border border-orange-500/40 mx-auto mb-4 flex items-center justify-center thunder-heading text-2xl thunder-orange">
          ST
        </div>
        <h1 className="thunder-heading text-2xl mb-2">Santeri / Thunder Kustannus</h1>
        <p className="text-muted-foreground mb-8">Julkaise kirjasi 4–8 viikossa. Äänikirja mukana jo 890 €.</p>
        <nav className="space-y-3">
          {LINKIT_BUTTONS.map(b => (
            <a
              key={b.id}
              href={`${b.href}?source=${source}`}
              onClick={() => track(b.id)}
              className={`flex items-center justify-between gap-3 w-full rounded-xl px-5 py-4 font-semibold text-left ${
                "primary" in b ? "thunder-btn-primary" : "border border-border bg-card hover:border-orange-400"
              }`}
            >
              {b.label}
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </a>
          ))}
        </nav>
      </div>
    </main>
  );
}
