// Thunder Kustannus — Lataa opas v2 (FI/EN)
import { useState } from "react";
import { ArrowRight, Download, CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";

const PDF_URL = "/manus-storage/kirjan-julkaiseminen-tarkistuslista_f7baa0a3.pdf";

export default function LataaSivu() {
  const { t } = useLang();
  const dl = t.download;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useSEO({
    title: "Lataa ilmainen opas: Kirjan julkaisemisen tarkistuslista",
    description: "Lataa ilmainen 10 askeleen tarkistuslista kirjan julkaisemiseen. Kaikki mitä tarvitset käsikirjoituksesta valmiiseen kirjaan.",
    canonical: "/lataa-opas",
    keywords: "kirjan julkaiseminen opas, omakustanne tarkistuslista, kirjailija opas, ilmainen opas",
  });

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (err) => {
      setError(err.message || (dl?.errorDefault ?? "Jokin meni pieleen. Yritä uudelleen."));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    subscribe.mutate({ email, name });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="pt-28 pb-16 thunder-section-alt">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Vasen: Info */}
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-500 mb-5">
                <span className="w-6 h-px bg-orange-500 inline-block" />
                {dl?.badge ?? "Ilmainen opas"}
              </span>
              <h1 className="thunder-heading text-4xl md:text-5xl text-foreground mb-5 leading-tight">
                {dl?.h1Part1 ?? "Kirjan julkaisemisen"}{" "}
                <span className="thunder-orange">{dl?.h1Highlight ?? "10 askeleen"}</span>{" "}
                {dl?.h1Part2 ?? "tarkistuslista"}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {dl?.lead ?? "Kaikki mitä tarvitset käsikirjoituksesta valmiiseen, myyvään kirjaan — askel askeleelta. Lataa PDF ja aloita julkaisuprosessi tänään."}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  dl?.check1 ?? "ISBN-tunnuksen hakeminen ja viivakoodi",
                  dl?.check2 ?? "Julkaisumuodon valinta (painettu, e-kirja, äänikirja)",
                  dl?.check3 ?? "Kansisuunnittelu ja taitto",
                  dl?.check4 ?? "Jakelukanavat: Storytel, Suomalainen Kirjakauppa ja muut",
                  dl?.check5 ?? "Markkinointi ennen ja jälkeen julkaisun",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{dl?.pdfNote ?? "PDF-opas · 10 askelta · Ilmainen"}</span>
              </div>
            </div>

            {/* Oikea: Lomake tai latauslinkki */}
            <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
              {!submitted ? (
                <>
                  <h2 className="text-foreground text-xl font-bold mb-2">
                    {dl?.formTitle ?? "Lataa opas ilmaiseksi"}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {dl?.formLead ?? "Syötä sähköpostiosoitteesi niin lähetämme oppaan suoraan postilaatikkoosi."}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {dl?.nameLabel ?? "Etunimi"}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={dl?.namePlaceholder ?? "Matti"}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        {dl?.emailLabel ?? "Sähköposti"} <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="matti@esimerkki.fi"
                        required
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={subscribe.isPending || !email}
                      className="w-full thunder-btn-primary py-3.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {subscribe.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {dl?.submitting ?? "Lähetetään..."}</>
                      ) : (
                        <><Download className="w-4 h-4" /> {dl?.submitBtn ?? "Lataa ilmainen opas"}</>
                      )}
                    </button>

                    <p className="text-muted-foreground text-xs text-center">
                      {dl?.noSpam ?? "Ei roskapostia. Voit peruuttaa milloin tahansa."}
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h2 className="text-foreground text-xl font-bold mb-2">
                    {dl?.successTitle ?? "Kiitos!"}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    {dl?.successText ?? "Opas on ladattavissa alla. Lähetimme sen myös sähköpostiisi."}
                  </p>
                  <a
                    href={PDF_URL}
                    download="kirjan-julkaiseminen-tarkistuslista.pdf"
                    className="thunder-btn-primary px-6 py-3 rounded-lg text-sm font-bold inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> {dl?.downloadBtn ?? "Lataa PDF"}
                  </a>
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
