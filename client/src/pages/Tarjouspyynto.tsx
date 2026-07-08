// Thunder Kustannus — Tarjouspyyntösivu v4 (FI/EN)
import { useState } from "react";
import { CheckCircle2, Send, Phone, Mail, User, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";

type FormData = {
  name: string; email: string; phone: string; package: string;
  bookTitle: string; genre: string; pages: string;
  manuscript: string; audiobook: string; timeline: string; message: string; agree: boolean;
};

const INITIAL: FormData = {
  name: "", email: "", phone: "", package: "", bookTitle: "",
  genre: "", pages: "", manuscript: "", audiobook: "", timeline: "", message: "", agree: false,
};

const inputCls = "w-full bg-white border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder:text-muted-foreground/60";
const labelCls = "block text-foreground/70 text-sm font-medium mb-1.5";
const requiredStar = <span className="text-orange-500 ml-0.5">*</span>;

export default function Tarjouspyynto() {
  const { t, lang } = useLang();
  const ef = t.estimateForm;
  const [form, setForm] = useState<FormData>(INITIAL);
  useSEO({
    title: "Ilmainen arvio kirjaprojektistasi | Thunder Kustannus",
    description: "Pyydä hinta-arvio kirjasi julkaisemisesta. Arvioimme kirjaprojektisi ja kerromme mitä se maksaa. Vastaamme 24 tunnin sisällä. Ei sitoumuksia.",
    canonical: "/tarjouspyynto",
    keywords: "ilmainen arvio kirja, kirjan julkaiseminen arvio, omakustanne arvio, Thunder Kustannus",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://formspree.io/f/mdayqggn", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          package: form.package,
          bookTitle: form.bookTitle,
          genre: form.genre,
          pages: form.pages,
          manuscript: form.manuscript,
          audiobook: form.audiobook,
          timeline: form.timeline,
          message: form.message,
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        alert(ef?.errorGeneral ?? "Lomakkeen lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä: info@thunderkustannus.fi");
      }
    } catch {
      alert(ef?.errorNetwork ?? "Verkkovirhe. Tarkista yhteys ja yritä uudelleen.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-40 pb-20 flex flex-col items-center justify-center text-center container">
          <div className="w-20 h-20 rounded-full thunder-orange-bg flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="thunder-heading text-4xl text-foreground mb-4">
            {ef?.successTitle ?? "Arvio vastaanotettu!"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mb-2">
            {ef?.successThank ?? "Kiitos yhteydenotostasi,"} <strong className="text-foreground">{form.name}</strong>.
          </p>
          <p className="text-muted-foreground text-lg max-w-lg">
            {ef?.successContact ?? "Olemme sinuun yhteydessä 24 tunnin sisällä — puhelimitse numeroon"}{" "}
            <strong className="text-foreground">{form.phone}</strong>{" "}
            {ef?.successOr ?? "tai sähköpostilla"}{" "}
            <strong className="text-foreground">{form.email}</strong>.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">

          {/* Otsikko */}
          <div className="mb-10">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl text-foreground mb-4">{t.estimate.h1}</h1>
            <p className="text-muted-foreground text-lg">
              {ef?.lead ?? (
                <>
                  Täytä lomake huolellisesti — mitä enemmän kerrot kirjastasi, sitä tarkemman arvion voimme antaa.
                  Vastaamme <strong className="text-foreground">24 tunnin sisällä</strong>. Ei sitoumuksia.
                </>
              )}
            </p>
          </div>

          {/* Luottamusindikaattorit */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Phone className="w-4 h-4" />, text: ef?.trust1 ?? "Soitamme sinulle" },
              { icon: <Mail className="w-4 h-4" />, text: ef?.trust2 ?? "Vastaus 24 h sisällä" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: ef?.trust3 ?? "Ei sitoumuksia" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3">
                <span className="thunder-orange">{item.icon}</span>
                <span className="text-sm font-medium text-foreground/80">{item.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Yhteystiedot */}
            <div className="bg-white border border-border rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 thunder-orange" />
                <h2 className="text-foreground font-bold text-lg">
                  {ef?.contactSection ?? "Yhteystiedot"}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>{ef?.nameLabel ?? "Nimi"} {requiredStar}</label>
                  <input
                    type="text" name="name" required
                    value={form.name} onChange={handleChange}
                    className={inputCls} placeholder={ef?.namePlaceholder ?? "Etunimi Sukunimi"}
                  />
                </div>
                <div>
                  <label className={labelCls}>{ef?.emailLabel ?? "Sähköposti"} {requiredStar}</label>
                  <input
                    type="email" name="email" required
                    value={form.email} onChange={handleChange}
                    className={inputCls} placeholder={ef?.emailPlaceholder ?? "sinä@esimerkki.fi"}
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    {ef?.phoneLabel ?? "Puhelinnumero"} {requiredStar}
                    <span className="text-muted-foreground font-normal ml-1">
                      {ef?.phoneNote ?? "(soitamme sinulle)"}
                    </span>
                  </label>
                  <input
                    type="tel" name="phone" required
                    value={form.phone} onChange={handleChange}
                    className={inputCls} placeholder="+358 40 123 4567"
                  />
                </div>
                <div>
                  <label className={labelCls}>{ef?.packageLabel ?? "Kiinnostava paketti"}</label>
                  <select name="package" value={form.package} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.packagePlaceholder ?? "Valitse paketti"}</option>
                    {PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.price} €</option>
                    ))}
                    <option value="custom">{ef?.packageCustom ?? "Räätälöity paketti"}</option>
                    <option value="unknown">{ef?.packageUnknown ?? "En ole vielä varma"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kirjan tiedot */}
            <div className="bg-white border border-border rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 thunder-orange" />
                <h2 className="text-foreground font-bold text-lg">
                  {ef?.bookSection ?? "Kirjan tiedot"}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>{ef?.bookTitleLabel ?? "Kirjan (työ)nimi tai aihe"} {requiredStar}</label>
                  <input
                    type="text" name="bookTitle" required
                    value={form.bookTitle} onChange={handleChange}
                    className={inputCls} placeholder={ef?.bookTitlePlaceholder ?? "Esim. Yrittäjän selviytymisopas tai Muistelmani"}
                  />
                </div>
                <div>
                  <label className={labelCls}>{ef?.genreLabel ?? "Genre / aihe"}</label>
                  <select name="genre" value={form.genre} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.genrePlaceholder ?? "Valitse genre"}</option>
                    <option value="tietokirja">{ef?.genreNonFiction ?? "Tietokirja"}</option>
                    <option value="romaani">{ef?.genreNovel ?? "Romaani"}</option>
                    <option value="omaelämäkerta">{ef?.genreMemo ?? "Omaelämäkerta / muistelmat"}</option>
                    <option value="liiketoiminta">{ef?.genreBusiness ?? "Liiketoiminta / yrittäjyys"}</option>
                    <option value="lastenkirja">{ef?.genreChildren ?? "Lastenkirja"}</option>
                    <option value="runokirja">{ef?.genrePoetry ?? "Runokirja"}</option>
                    <option value="oppikirja">{ef?.genreTextbook ?? "Oppikirja / opas"}</option>
                    <option value="muu">{ef?.genreOther ?? "Muu"}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{ef?.pagesLabel ?? "Arvioitu sivumäärä"}</label>
                  <select name="pages" value={form.pages} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.pagesPlaceholder ?? "Valitse"}</option>
                    <option value="alle100">{ef?.pagesUnder100 ?? "Alle 100 sivua"}</option>
                    <option value="100-200">{ef?.pages100200 ?? "100–200 sivua"}</option>
                    <option value="200-300">{ef?.pages200300 ?? "200–300 sivua"}</option>
                    <option value="yli300">{ef?.pagesOver300 ?? "Yli 300 sivua"}</option>
                    <option value="ei-tiedä">{ef?.pagesDontKnow ?? "En tiedä vielä"}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{ef?.manuscriptLabel ?? "Käsikirjoituksen tila"}</label>
                  <select name="manuscript" value={form.manuscript} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.manuscriptPlaceholder ?? "Valitse"}</option>
                    <option value="valmis">{ef?.manuscriptReady ?? "Valmis — voidaan aloittaa heti"}</option>
                    <option value="lähes">{ef?.manuscriptAlmost ?? "Lähes valmis (1–4 viikkoa)"}</option>
                    <option value="kesken">{ef?.manuscriptInProgress ?? "Työn alla (1–3 kuukautta)"}</option>
                    <option value="idea">{ef?.manuscriptIdea ?? "Vasta idea — haluaisin neuvoja"}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{ef?.audiobookLabel ?? "Haluatko äänikirjan?"}</label>
                  <select name="audiobook" value={form.audiobook} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.audiobookPlaceholder ?? "Valitse"}</option>
                    <option value="kylla">{ef?.audiobookYes ?? "Kyllä, ehdottomasti"}</option>
                    <option value="ei">{ef?.audiobookNo ?? "Ei tällä kertaa"}</option>
                    <option value="ehka">{ef?.audiobookMaybe ?? "Ehkä — haluaisin lisätietoa"}</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{ef?.timelineLabel ?? "Toivottu julkaisuaikataulu"}</label>
                  <select name="timeline" value={form.timeline} onChange={handleChange} className={inputCls}>
                    <option value="">{ef?.timelinePlaceholder ?? "Valitse"}</option>
                    <option value="1kk">{ef?.timeline1m ?? "1 kuukauden sisällä"}</option>
                    <option value="1-3kk">{ef?.timeline13m ?? "1–3 kuukauden sisällä"}</option>
                    <option value="3-6kk">{ef?.timeline36m ?? "3–6 kuukauden sisällä"}</option>
                    <option value="yli6kk">{ef?.timelineOver6m ?? "Yli 6 kuukautta"}</option>
                    <option value="ei-kiire">{ef?.timelineNoRush ?? "Ei kiirettä — haluan ensin tietää lisää"}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Viesti */}
            <div className="bg-white border border-border rounded-xl p-8">
              <h2 className="text-foreground font-bold text-lg mb-2">
                {ef?.additionalSection ?? "Lisätietoja"}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                {ef?.additionalDesc ?? "Kerro vapaasti kirjastasi, tavoitteistasi tai kysymyksistäsi. Mitä enemmän kerrot, sitä paremmin voimme auttaa."}
              </p>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={5}
                className={inputCls + " resize-none"}
                placeholder={ef?.additionalPlaceholder ?? "Esim. Kirjani käsittelee... Tavoitteeni on... Minulla on kysymys..."}
              />
            </div>

            {/* Suostumus */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox" name="agree" id="agree" required
                checked={form.agree} onChange={handleChange}
                className="mt-1 w-4 h-4 accent-orange-500"
              />
              <label htmlFor="agree" className="text-muted-foreground text-sm leading-relaxed">
                {ef?.consentText ?? "Olen lukenut"}{" "}
                <a href="/sopimusehdot" className="thunder-orange underline hover:no-underline">
                  {ef?.consentTerms ?? "sopimusehdot"}
                </a>
                {" "}{ef?.consentAnd ?? "ja hyväksy, että Thunder Kustannus käsittelee tietojani arviopyyntöä varten. Voin ottaa yhteyttä myös puhelimitse antamaani numeroon."}
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="thunder-btn-primary w-full py-4 rounded-lg text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><Send className="w-4 h-4" /> {t.estimate.submit} →</>
              )}
            </button>

            <p className="text-muted-foreground text-xs text-center">
              {ef?.submitNote ?? "Vastaamme 24 tunnin sisällä. Ei sitoumuksia. Tietojasi ei luovuteta kolmansille osapuolille."}
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
