// Thunder Kustannus — Ilmainen ääninäyte (etusivu heti heron alla)
// Kirjailija lähettää yhden Word-sivun WhatsAppissa tai liittää sen lomakkeeseen.
import { useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, FileText, Headphones, Loader2, ShieldCheck } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { analyticsAllowed } from "@/lib/purchase-analytics";
import { leadSourceLabel, readLeadSource } from "@shared/lead-source";
import { WHATSAPP_PHONE } from "@/components/WhatsAppButton";

const MAX_BYTES = 2 * 1024 * 1024;

const TEXT = {
  fi: {
    badge: "Ilmainen ääninäyte",
    title: "Tältä sinun kirjasi kuulostaisi valmiina.",
    lead: "Lähetä yksi Word-sivu kirjastasi. Saat ilmaisen ääninäytteen yhden arkipäivän kuluessa.",
    ai: "Kirjasi tehdään tekoälyavusteisesti. Jokaisen kirjan tarkistaa ja editoi oikea ihminen.",
    audio: "Äänikirja kuuluu jo 890 €:n Digi-pakettiin.",
    digi: "Tutustu Digi-pakettiin",
    waTitle: "Lähetä WhatsAppissa",
    waLead: "Avaa keskustelu ja liitä Word-sivu viestiin.",
    waBtn: "Avaa WhatsApp",
    waMsg: "Hei! Haluan ilmaisen ääninäytteen kirjastani. Liitän yhden Word-sivun tähän viestiin.",
    or: "tai",
    formTitle: "Liitä tiedosto tähän",
    file: "Word-sivu (.docx)",
    fileHint: "Yksi sivu riittää. Enintään 2 Mt.",
    email: "Sähköpostisi",
    consent: "Saa käyttää tiedostoa ääninäytteen tekemiseen ja vastata minulle sähköpostilla.",
    send: "Lähetä ja saa näyte",
    sending: "Lähetetään…",
    done: "Kiitos! Tiedosto on perillä. Saat ääninäytteen sähköpostiisi yhden arkipäivän kuluessa.",
    errType: "Valitse Word-tiedosto (.docx).",
    errSize: "Tiedosto on liian suuri. Lähetä vain yksi sivu, enintään 2 Mt.",
    errGeneral: "Lähetys ei onnistunut. Lähetä sivu WhatsAppissa tai osoitteeseen info@thunderkustannus.fi.",
    errRate: "Liian monta lähetystä. Lähetä sivu WhatsAppissa tai osoitteeseen info@thunderkustannus.fi.",
    privacy: "Tiedostoa käytetään vain näytteeseen. Emme lisää sinua markkinointilistalle.",
  },
  en: {
    badge: "Free audio sample",
    title: "This is how your book would sound.",
    lead: "Send us one Word page from your book. You get a free audio sample within one business day.",
    ai: "Your book is produced with the help of AI. Every book is checked and edited by a real person.",
    audio: "An audiobook is already included in the 890 € Digi package.",
    digi: "Explore Digi",
    waTitle: "Send on WhatsApp",
    waLead: "Open the chat and attach your Word page.",
    waBtn: "Open WhatsApp",
    waMsg: "Hi! I'd like a free audio sample of my book. I'm attaching one Word page.",
    or: "or",
    formTitle: "Attach the file here",
    file: "Word page (.docx)",
    fileHint: "One page is enough. Max 2 MB.",
    email: "Your email",
    consent: "You may use the file to make my audio sample and reply to me by email.",
    send: "Send and get my sample",
    sending: "Sending…",
    done: "Thank you! We received your file. Your audio sample will arrive by email within one business day.",
    errType: "Please choose a Word file (.docx).",
    errSize: "The file is too large. Send just one page, max 2 MB.",
    errGeneral: "Sending failed. Send the page on WhatsApp or to info@thunderkustannus.fi.",
    errRate: "Too many attempts. Send the page on WhatsApp or to info@thunderkustannus.fi.",
    privacy: "We only use the file for your sample. We will not add you to a marketing list.",
  },
} as const;

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function AudioSampleCTA() {
  const { lang } = useLang();
  const t = TEXT[lang === "en" ? "en" : "fi"];
  const openedAt = useRef(Date.now());
  const [file, setFile] = useState<File | null>(null);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(""); // roskapostiesto, piilotettu ihmisiltä
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(t.waMsg)}`;

  const pick = (f: File | null) => {
    setError("");
    if (!f) return setFile(null);
    if (!/\.docx$/i.test(f.name)) return setError(t.errType), setFile(null);
    if (f.size > MAX_BYTES) return setError(t.errSize), setFile(null);
    setFile(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !email || !consent) return;
    setState("sending");
    setError("");
    let source = "";
    try {
      source = leadSourceLabel(readLeadSource(window.sessionStorage));
    } catch {
      /* storage blocked */
    }
    try {
      const res = await fetch("/api/aaninayte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          filename: file.name,
          file: await toBase64(file),
          consent: true,
          website,
          elapsedMs: Date.now() - openedAt.current,
          source,
        }),
      });
      if (res.status === 204) {
        setState("done");
        try {
          if (analyticsAllowed(window.localStorage)) {
            window.gtag?.("event", "generate_lead", {
              form: "aaninayte",
              page_path: window.location.pathname,
              page_location: window.location.href,
            });
          }
        } catch {
          // Analytiikka ei saa estää onnistunutta lähetystä.
        }
        return;
      }
      setState("idle");
      setError(res.status === 429 ? t.errRate : res.status === 415 ? t.errType : t.errGeneral);
    } catch {
      setState("idle");
      setError(t.errGeneral);
    }
  };

  return (
    <section id="aaninayte" className="relative bg-[#191918] border-t border-white/15 text-white py-14 scroll-mt-24">
      <div className="container grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-4">
            <Headphones className="w-4 h-4" aria-hidden="true" /> {t.badge}
          </span>
          <h2 className="thunder-heading text-3xl md:text-4xl text-white mb-4">{t.title}</h2>
          <p className="text-white/75 text-lg leading-relaxed mb-6 max-w-xl">{t.lead}</p>
          <p className="flex items-start gap-3 rounded-xl border border-orange-400/40 bg-orange-500/10 p-4 text-white/90 max-w-xl">
            <ShieldCheck className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" aria-hidden="true" />
            <span className="font-semibold">{t.ai}</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="font-bold">{t.audio}</p>
            <Link href="/hinnat" className="inline-flex items-center gap-2 text-orange-400 font-bold">
              {t.digi} <ArrowRight size={18} />
            </Link>
          </div>
          <p className="text-white/55 text-sm mt-2">Storytel · BookBeat · Nextory · Spotify</p>
        </div>

        <div className="rounded-2xl bg-white text-foreground p-6 md:p-8 shadow-xl">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 rounded-xl border-2 border-[#25D366] p-4 hover:bg-[#25D366]/10 transition-colors"
          >
            <span>
              <span className="block font-bold">{t.waTitle}</span>
              <span className="block text-sm text-muted-foreground">{t.waLead}</span>
            </span>
            <span className="shrink-0 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-bold text-white">{t.waBtn}</span>
          </a>

          <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> {t.or} <span className="h-px flex-1 bg-border" />
          </div>

          {state === "done" ? (
            <p className="flex items-start gap-3 rounded-xl bg-green-50 p-4 text-green-900" role="status">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" aria-hidden="true" /> {t.done}
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate={false}>
              <p className="font-bold">{t.formTitle}</p>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">{t.file} <span className="text-orange-500">*</span></span>
                <span className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 cursor-pointer hover:border-orange-400">
                  <FileText className="w-5 h-5 text-orange-500 shrink-0" aria-hidden="true" />
                  <span className="text-sm truncate">{file ? file.name : t.fileHint}</span>
                  <input
                    type="file"
                    required
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="sr-only"
                    onChange={e => pick(e.target.files?.[0] ?? null)}
                  />
                </span>
              </label>
              <label className="block">
                <span className="block text-sm font-medium mb-1.5">{t.email} <span className="text-orange-500">*</span></span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nimi@esimerkki.fi"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </label>
              {/* Roskapostiesto: ihminen ei näe tätä kenttää. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
                </label>
              </div>
              <label className="flex items-start gap-3 text-sm text-foreground/80">
                <input type="checkbox" required checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 accent-orange-500" />
                <span>{t.consent}</span>
              </label>
              {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={state === "sending" || !file || !email || !consent}
                className="thunder-btn-primary w-full rounded-lg py-3 text-sm font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {state === "sending" ? (<><Loader2 className="w-4 h-4 animate-spin" /> {t.sending}</>) : (<>{t.send} <ArrowRight size={16} /></>)}
              </button>
              <p className="text-xs text-muted-foreground">{t.privacy}</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
