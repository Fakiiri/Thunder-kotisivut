import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  BookOpen,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import {
  questions,
  quizResult,
  answersSchema,
  QUIZ_VERSION,
  MARKETING_PERMISSION,
  type QuizAnswers,
} from "@shared/publication-quiz";
import { trackQuiz } from "@/lib/quiz-analytics";
type Result = ReturnType<typeof quizResult>;
const field =
  "w-full rounded-xl border border-border bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400";
const primary =
  "thunder-btn-primary inline-flex justify-center items-center gap-2 rounded-xl px-6 py-3.5 font-bold disabled:opacity-40 disabled:cursor-not-allowed";
export default function Julkaisutesti() {
  useSEO({
    title: "Onko käsikirjoituksesi valmis julkaistavaksi? Tee 2 minuutin testi",
    description:
      "Kahdeksan kysymystä ja oma toimintasuunnitelma kirjasi julkaisuun. Löydä sopiva julkaisusuunta ja varaa maksuton 15 minuutin julkaisupuhelu.",
    canonical: "/julkaisutesti",
  });
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [token, setToken] = useState("");
  const [bookingURL, setBookingURL] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const trackedComplete = useRef(false);
  const requestKey = useRef("");
  const preview = import.meta.env.VITE_EDITORIAL_PREVIEW === "true";
  useEffect(() => {
    if (step >= 0) heading.current?.focus();
  }, [step, result]);
  useEffect(() => {
    let stored = "";
    try {
      stored = sessionStorage.getItem("thunder_quiz_link") || "";
    } catch {}
    const raw =
      window.location.hash ||
      (window as Window & { thunderQuizLink?: string }).thunderQuizLink ||
      stored;
    const fragment = raw.match(/^#(oma-tulos|puhelu)=([a-f0-9]{64})$/);
    if (!fragment) return;
    const controller = new AbortController();
    setBusy(true);
    setToken(fragment[2]);

    // Token stays in fragment (not server logs, Analytics paths or referrer).
    fetch(`/api/quiz/result/${fragment[2]}`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok)
          throw Error(
            "Linkki ei ole enää käytössä. Voit tehdä testin uudelleen tai ottaa yhteyttä sähköpostilla."
          );
        const data = await response.json();
        setResult(data.result);
        setSaved(true);
        setStep(8);
        setBookingURL(data.bookingURL || "");
        if (fragment[1] === "puhelu" && data.bookingURL && !preview)
          await openCalendar(fragment[2], data.result.profile);
      })
      .catch(e => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, []);
  function complete() {
    const parsed = answersSchema.safeParse(answers);
    if (!parsed.success) return;
    const value = quizResult(parsed.data);
    setResult(value);
    setStep(8);
    if (!trackedComplete.current) {
      trackQuiz("quiz_complete", { profile: value.profile });
      trackedComplete.current = true;
    }
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (preview)
        throw Error(
          "Esikatselu: oikeita sähköposteja ei lähetetä eikä tietoja tallenneta."
        );
      const source =
        new URLSearchParams(window.location.search).get("source") || "direct";
      requestKey.current ||= crypto.randomUUID();
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          email,
          name,
          marketing,
          website,
          version: QUIZ_VERSION,
          requestKey: requestKey.current,
          source: /^[a-zA-Z0-9_-]{1,80}$/.test(source) ? source : "direct",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "Tallennus ei onnistunut. Yritä uudelleen.");
      setSaved(true);
      setToken(data.token);
      setBookingURL(data.bookingURL || "");
      setResult(data.result);
      trackQuiz("quiz_lead_saved", { profile: data.result.profile });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lähetys ei onnistunut.");
    } finally {
      setBusy(false);
    }
  }
  async function openCalendar(
    leadToken = token,
    profile = result?.profile || "unknown"
  ) {
    setBusy(true);
    setError("");
    try {
      if (preview)
        throw Error("Esikatselu: oikeaa ajanvarausta ei avata vielä.");
      const response = await fetch("/api/quiz/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: leadToken }),
      });
      if (!response.ok)
        throw Error(
          "Varauskalenteria ei voitu avata. Kokeile uudelleen tai ota yhteyttä sähköpostilla."
        );
      const data = await response.json();
      trackQuiz("quiz_booking_click", { profile });
      window.location.assign(data.url);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Kalenterin avaaminen epäonnistui."
      );
    } finally {
      setBusy(false);
    }
  }
  const question = step >= 0 && step < 8 ? questions[step] : null;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container max-w-3xl">
          {step === -1 ? (
            <section className="relative rounded-3xl bg-[#191918] text-[#fff8ea] px-7 py-12 sm:p-14 overflow-hidden">
              <div
                aria-hidden="true"
                className="absolute w-64 h-64 rounded-full border border-orange-400/20 -right-24 -top-24"
              />
              <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                Sinun kirjasi. Seuraava askel.
              </p>
              <h1
                ref={heading}
                tabIndex={-1}
                className="thunder-heading text-4xl sm:text-5xl leading-tight mb-6"
              >
                Onko käsikirjoituksesi valmis julkaistavaksi?
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8">
                Sinulla on tarina. Selvitetään, mitä sen julkaiseminen
                seuraavaksi vaatii. Vastaa kahdeksaan kysymykseen ja saat omaan
                tilanteeseesi sopivan suunnitelman.
              </p>
              <ul className="space-y-3 mb-9 text-white/80">
                {[
                  "Kolme konkreettista seuraavaa askelta",
                  "Sinulle sopiva julkaisusuunta ja pakettivaihtoehto",
                  "Mahdollisuus maksuttomaan 15 minuutin julkaisupuheluun",
                ].map(x => (
                  <li key={x} className="flex gap-3">
                    <Check size={20} className="text-orange-400 shrink-0" />
                    {x}
                  </li>
                ))}
              </ul>
              <button
                className={primary}
                onClick={() => {
                  setStep(0);
                  trackQuiz("quiz_start");
                }}
              >
                Aloita maksuton testi <ArrowRight size={18} />
              </button>
              <p className="flex items-center gap-2 text-sm text-white/60 mt-5">
                <Clock size={16} /> Noin 2 minuuttia · ei ostopakkoa
              </p>
              <p className="text-xs text-white/50 mt-4">
                Tulos heti ruudulle. Voit halutessasi tilata sen myös
                sähköpostiisi.
              </p>
            </section>
          ) : question ? (
            <section className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-sm">
              <div className="flex justify-between text-sm mb-3">
                <span>Kysymys {step + 1} / 8</span>
                <span className="text-muted-foreground">
                  Oma julkaisusuuntasi
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Testin eteneminen"
                aria-valuenow={step + 1}
                aria-valuemin={0}
                aria-valuemax={8}
                className="h-1.5 rounded-full bg-orange-100 mb-9"
              >
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${((step + 1) / 8) * 100}%` }}
                />
              </div>
              <h1
                ref={heading}
                tabIndex={-1}
                className="thunder-heading text-2xl sm:text-3xl mb-7 focus:outline-none"
              >
                {question.title}
              </h1>
              <fieldset>
                <legend className="sr-only">{question.title}</legend>
                <div className="space-y-3">
                  {question.choices.map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex gap-3 items-center cursor-pointer rounded-xl border-2 p-4 min-h-16 transition-colors ${answers[question.key] === value ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300"}`}
                    >
                      <input
                        type="radio"
                        name={question.key}
                        value={value}
                        checked={answers[question.key] === value}
                        onChange={() =>
                          setAnswers(prev => ({
                            ...prev,
                            [question.key]: value,
                          }))
                        }
                        className="accent-orange-600 w-5 h-5 shrink-0"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="mt-8 flex justify-between gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm px-2 py-3"
                  onClick={() => setStep(step - 1)}
                >
                  <ArrowLeft size={16} /> Takaisin
                </button>
                <button
                  className={primary}
                  disabled={!answers[question.key]}
                  onClick={() => {
                    trackQuiz("quiz_step", { step: step + 1 });
                    if (step === 7) complete();
                    else setStep(step + 1);
                  }}
                >
                  {step === 7 ? "Näytä oma suunnitelmani" : "Seuraava"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </section>
          ) : result ? (
            <>
              <section className="rounded-3xl bg-[#191918] text-white p-7 sm:p-10 mb-7">
                <p className="text-orange-400 text-sm font-bold mb-4">
                  SINUN JULKAISUSUUNTASI
                </p>
                <h1
                  ref={heading}
                  tabIndex={-1}
                  className="thunder-heading text-3xl sm:text-4xl mb-5"
                >
                  {result.name}
                </h1>
                <p className="text-lg text-white/80">{result.summary}</p>
                <div className="mt-6 border-t border-white/15 pt-5 flex gap-3">
                  <BookOpen className="text-orange-400 shrink-0" />
                  <p>
                    {result.ready
                      ? "Oman arviosi mukaan teksti on valmis tuotantoon. Varmistetaan vielä toteutuksen yksityiskohdat."
                      : "Kirjasi seuraava askel on tekstin viimeistely. Sinun ei tarvitse ostaa tuotantopakettia vielä."}
                  </p>
                </div>
              </section>
              {!saved ? (
                <section className="rounded-2xl border border-border bg-white p-7 sm:p-9 mb-7">
                  <Mail className="text-orange-600 mb-4" />
                  <h2 className="thunder-heading text-2xl mb-3">
                    Oma suunnitelmasi talteen
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Saat tuloksen ja nämä kolme askelta sähköpostiisi. Samasta
                    viestistä voit varata Santerilta maksuttoman 15 minuutin
                    julkaisupuhelun. Tuloksen lähettämiseen riittää
                    sähköpostiosoite.
                  </p>
                  <form onSubmit={save} className="space-y-5">
                    <label className="block">
                      Etunimi{" "}
                      <span className="text-muted-foreground text-sm">
                        (vapaaehtoinen)
                      </span>
                      <input
                        className={`${field} mt-2`}
                        autoComplete="given-name"
                        maxLength={100}
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </label>
                    <label className="block">
                      Sähköpostiosoite
                      <input
                        required
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        className={`${field} mt-2`}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </label>
                    <div
                      aria-hidden="true"
                      style={{ position: "absolute", left: "-10000px" }}
                    >
                      <label>
                        Verkkosivusto
                        <input
                          tabIndex={-1}
                          autoComplete="off"
                          value={website}
                          onChange={e => setWebsite(e.target.value)}
                        />
                      </label>
                    </div>
                    <label className="flex items-start gap-3 text-sm leading-relaxed">
                      <input
                        type="checkbox"
                        checked={marketing}
                        onChange={e => setMarketing(e.target.checked)}
                        className="mt-1 accent-orange-600 w-5 h-5 shrink-0"
                      />
                      {MARKETING_PERMISSION}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Käytämme osoitetta pyytämäsi tuloksen toimittamiseen.
                      Jatkoviestit ovat vapaaehtoisia.{" "}
                      <Link href="/tietosuoja" className="underline">
                        Tietosuojaseloste
                      </Link>
                    </p>
                    <button className={primary} disabled={busy}>
                      {busy
                        ? "Tallennetaan…"
                        : "Lähetä toimintasuunnitelma sähköpostiini"}
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </section>
              ) : (
                <section className="rounded-2xl border border-orange-200 bg-white p-7 sm:p-9 mb-7">
                  <p role="status" className="flex gap-2 text-green-800 mb-5">
                    <CheckCircle2 size={20} /> Oma toimintasuunnitelmasi on tallessa.
                  </p>
                  <h2 className="thunder-heading text-2xl mb-3">
                    Jutellaanko kirjasi seuraavasta askeleesta?
                  </h2>
                  <p className="text-muted-foreground mb-5">
                    Valitse kalenterista sinulle sopiva aika. Puhelu on maksuton
                    eikä sido ostamaan. Saat varausvahvistuksen
                    kalenteripalvelusta.
                  </p>
                  <button
                    className={primary}
                    disabled={busy || !bookingURL}
                    onClick={() => void openCalendar()}
                  >
                    <Phone size={18} /> Varaa 15 minuutin ilmainen
                    julkaisupuhelu
                  </button>
                  {!bookingURL && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      Santerin ajanvarauslinkki lisätään ennen käyttöönottoa.
                      Esikatselu ei tee oikeita varauksia.
                    </p>
                  )}
                </section>
              )}
              <section className="rounded-2xl border border-border bg-white p-7 sm:p-9 mb-7">
                <h2 className="thunder-heading text-2xl mb-6">
                  Kolme askelta eteenpäin
                </h2>
                <ol className="space-y-6">
                  {result.steps.map((s, i) => (
                    <li key={s} className="flex gap-4 leading-relaxed">
                      <span className="rounded-full bg-orange-100 text-orange-800 font-bold w-9 h-9 flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="rounded-2xl border border-orange-200 bg-orange-50 p-7 mb-7">
                <p className="text-xs uppercase tracking-widest font-bold text-orange-700">
                  Suuntaa antava pakettivaihtoehto
                </p>
                <h2 className="text-2xl font-bold my-3">
                  {result.package}{" "}
                  <span className="whitespace-nowrap">
                    {result.price.toLocaleString("fi-FI")} €
                  </span>
                </h2>
                <p className="mb-4">{result.reason}</p>
                {result.notes.map(n => (
                  <p key={n} className="mb-3 text-sm">
                    {n}
                  </p>
                ))}
                <p className="text-sm text-muted-foreground mb-5">
                  {result.caveat}
                </p>
                <Link
                  href="/hinnat"
                  onClick={() =>
                    trackQuiz("quiz_package_click", { profile: result.profile })
                  }
                  className="text-orange-700 font-bold underline underline-offset-4"
                >
                  Vertaa pakettien sisältöä ja rajauksia →
                </Link>
              </section>
              <p className="text-sm text-muted-foreground">
                Kysyttävää?{" "}
                <a className="underline" href="mailto:info@thunderkustannus.fi">
                  info@thunderkustannus.fi
                </a>
                . Älä lähetä käsikirjoitusta tämän testin kautta.
              </p>
              <button
                className="mt-6 underline text-sm"
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                  setStep(-1);
                  setSaved(false);
                  setToken("");
                  setBookingURL("");
                  setError("");
                  trackedComplete.current = false;
                  requestKey.current = "";
                  try {
                    sessionStorage.removeItem("thunder_quiz_link");
                  } catch {}
                  delete (window as Window & { thunderQuizLink?: string })
                    .thunderQuizLink;
                  window.history.replaceState(null, "", "/julkaisutesti");
                }}
              >
                Tee testi uudelleen
              </button>
            </>
          ) : null}
          {error && (
            <p
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-900"
            >
              {error} Voit ottaa yhteyttä myös osoitteeseen
              info@thunderkustannus.fi.
            </p>
          )}
          {preview && (
            <p className="mt-6 bg-amber-100 p-4 text-sm">
              Esikatselu. Sähköposteja tai puhelupyyntöjä ei lähetetä.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
