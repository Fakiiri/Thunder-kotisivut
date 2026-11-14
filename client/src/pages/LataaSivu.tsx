// Thunder Kustannus — Lataa opas v2 (FI/EN)
import { useState } from "react";
import { ArrowRight, Download, CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { useLang } from "@/contexts/LanguageContext";

const PDF_URL = "/downloads/opas.pdf";

export default function LataaSivu() {
  const { t } = useLang();
  const dl = t.download;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useSEO({
    title: "Lataa ilmainen julkaisuopas 2027 ja tarkistuslista",
    description: "Ilmainen julkaisuopas 2027: hinnat, oikeudet, tekijänpalkkio, aikataulu ja 10 askeleen tarkistuslista kirjan julkaisemiseen.",
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
                {dl?.badge ?? "Ilmainen opas · päivitetty 2027"}
              </span>
              <h1 className="thunder-heading text-4xl md:text-5xl text-foreground mb-5 leading-tight">
                {dl?.h1Part1 ?? "Julkaisuopas"}{" "}
                <span className="thunder-orange">{dl?.h1Highlight ?? "2027:"}</span>{" "}
                {dl?.h1Part2 ?? "kaikki, mitä kysyt ennen kuin maksat"}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {dl?.lead ?? "Hinnat, oikeudet, tekijänpalkkio ja aikataulu selkokielellä. Mukana päivitetty 10 askeleen tarkistuslista käsikirjoituksesta valmiiseen kirjaan."}
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  dl?.check1 ?? "Mitä on ilmaista, mistä maksat ja mitä paketti ei sisällä",
                  dl?.check2 ?? "Kolme laskuesimerkkiä oikealla kirjalla",
                  dl?.check3 ?? "Tekijänpalkkio, oikeudet ja sopimus selkokielellä",
                  dl?.check4 ?? "Aikajana viikko viikolta ja 9 kysymystä ennen allekirjoitusta",
                  dl?.check5 ?? "10 askeleen tarkistuslista: ISBN, kansi, taitto, jakelu ja markkinointi",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <BookOpen className="w-4 h-4" />
                <span>{dl?.pdfNote ?? "PDF-opas · 2027 · Ilmainen"}</span>
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
