// Liidimagneettisivu (tehtävä 002): /kirjasi-5-paivassa, /muistelman-aloitus, /naytekirja
import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { analyticsAllowed } from "@/lib/purchase-analytics";
import { magnetSource } from "@/lib/magnet-source";
import { MAGNETS, type MagnetKey } from "../../../shared/magnets";

const input =
  "w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 text-base";

export function MagnetPage({ magnet: key }: { magnet: MagnetKey }) {
  const magnet = MAGNETS[key];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  useSEO({
    title: magnet.title,
    description: magnet.subtitle,
    canonical: magnet.path,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !consent) {
      setError("Täytä etunimi ja sähköposti ja hyväksy viestit.");
      return;
    }
    setState("sending");
    setError("");
    const source = magnetSource(window.location.search, window.sessionStorage);
    try {
      const res = await fetch("/api/magneetti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ magnet: key, name, email, consent: true, source, website }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Tilaus epäonnistui. Yritä uudelleen.");
      }
      setState("done");
      if (analyticsAllowed(window.localStorage)) {
        window.gtag?.("event", "sign_up", { form: key });
        (window as Window & { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Lead", {
          content_name: key,
        });
      }
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Tilaus epäonnistui. Yritä uudelleen.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container py-5">
        <Link href="/" className="thunder-heading text-lg text-foreground">
          Thunder Kustannus
        </Link>
      </header>

      <section className="pb-16 pt-4 md:pt-12">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4">
                <span className="w-6 h-px bg-orange-500 inline-block" />
                {magnet.badge}
              </span>
              <h1 className="thunder-heading text-3xl md:text-5xl text-foreground mb-4 leading-tight">
                {magnet.title}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{magnet.subtitle}</p>
              <ul className="space-y-3">
                {magnet.bullets.map(item => (
                  <li key={item} className="flex items-start gap-3 text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 thunder-orange mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 md:p-8">
              {state !== "done" ? (
                <form onSubmit={submit} className="space-y-4" noValidate>
                  <div>
                    <label htmlFor="m-name" className="block text-sm font-medium mb-1.5">
                      Etunimi <span className="text-orange-500">*</span>
                    </label>
                    <input id="m-name" autoComplete="given-name" required value={name}
                      onChange={e => setName(e.target.value)} className={input} />
                  </div>
                  <div>
                    <label htmlFor="m-email" className="block text-sm font-medium mb-1.5">
                      Sähköposti <span className="text-orange-500">*</span>
                    </label>
                    <input id="m-email" type="email" autoComplete="email" required value={email}
                      onChange={e => setEmail(e.target.value)} className={input} />
                  </div>
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                    value={website} onChange={e => setWebsite(e.target.value)}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0" />
                  <label className="flex items-start gap-3 text-sm text-foreground/80">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-orange-500" required />
                    <span>
                      Haluan Thunder Kustannuksen sähköpostit. Voin perua ne milloin tahansa.{" "}
                      <Link href="/tietosuoja" className="underline">Tietosuoja</Link>
                    </span>
                  </label>
                  {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
                  <button type="submit" disabled={state === "sending"}
                    className="w-full thunder-btn-primary py-3.5 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-60">
                    {state === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {magnet.button}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">Tarkista sähköpostisi.</h2>
                  <p className="text-muted-foreground mb-6">Ensimmäinen viesti on matkalla.</p>
                  <Link href={`/julkaisutesti?source=${magnet.path.slice(1)}-kiitos`}
                    className="inline-flex items-center gap-2 border border-border px-5 py-3 rounded-lg font-semibold">
                    Tee 2 minuutin testi <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export const KurssiSivu = () => <MagnetPage magnet="kurssi" />;
export const MuistelmaSivu = () => <MagnetPage magnet="muistelma" />;
export const NaytekirjaSivu = () => <MagnetPage magnet="naytekirja" />;
