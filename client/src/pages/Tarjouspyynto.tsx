// Thunder Kustannus — Tarjouspyyntösivu v3
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
  const { t } = useLang();
  const [form, setForm] = useState<FormData>(INITIAL);
  useSEO({
    title: "Ilmainen arvio kirjaprojektistasi | Thunder Kustannus",
    description: "Pyydä ilmainen arvio kirjasi julkaisemisesta. Arvioimme kirjaprojektisi ja kerromme mitä se maksaa. Vastaamme 24 tunnin sisällä. Ei sitoumuksia.",
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
        alert("Lomakkeen lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä: info@thunderkustannus.fi");
      }
    } catch {
      alert("Verkkovirhe. Tarkista yhteys ja yritä uudelleen.");
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
          <h1 className="thunder-heading text-4xl text-foreground mb-4">Arvio vastaanotettu!</h1>
          <p className="text-muted-foreground text-lg max-w-lg mb-2">
            Kiitos yhteydenotostasi, <strong className="text-foreground">{form.name}</strong>.
          </p>
          <p className="text-muted-foreground text-lg max-w-lg">
            Olemme sinuun yhteydessä 24 tunnin sisällä — puhelimitse numeroon{" "}
            <strong className="text-foreground">{form.phone}</strong> tai sähköpostilla{" "}
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
              Täytä lomake huolellisesti — mitä enemmän kerrot kirjastasi, sitä tarkemman arvion voimme antaa.
              Vastaamme <strong className="text-foreground">24 tunnin sisällä</strong>. Ei sitoumuksia.
            </p>
          </div>

          {/* Luottamusindikaattorit */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: <Phone className="w-4 h-4" />, text: "Soitamme sinulle" },
              { icon: <Mail className="w-4 h-4" />, text: "Vastaus 24 h sisällä" },
              { icon: <CheckCircle2 className="w-4 h-4" />, text: "Ei sitoumuksia" },
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
                <h2 className="text-foreground font-bold text-lg">Yhteystiedot</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nimi {requiredStar}</label>
                  <input
                    type="text" name="name" required
                    value={form.name} onChange={handleChange}
                    className={inputCls} placeholder="Etunimi Sukunimi"
                  />
                </div>
                <div>
                  <label className={labelCls}>Sähköposti {requiredStar}</label>
                  <input
                    type="email" name="email" required
                    value={form.email} onChange={handleChange}
                    className={inputCls} placeholder="sinä@esimerkki.fi"
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Puhelinnumero {requiredStar}
                    <span className="text-muted-foreground font-normal ml-1">(soitamme sinulle)</span>
                  </label>
                  <input
                    type="tel" name="phone" required
                    value={form.phone} onChange={handleChange}
                    className={inputCls} placeholder="+358 40 123 4567"
                  />
                </div>
                <div>
                  <label className={labelCls}>Kiinnostava paketti</label>
                  <select name="package" value={form.package} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse paketti</option>
                    {PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.price} €</option>
                    ))}
                    <option value="custom">Räätälöity paketti</option>
                    <option value="unknown">En ole vielä varma</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kirjan tiedot */}
            <div className="bg-white border border-border rounded-xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 thunder-orange" />
                <h2 className="text-foreground font-bold text-lg">Kirjan tiedot</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Kirjan (työ)nimi tai aihe {requiredStar}</label>
                  <input
                    type="text" name="bookTitle" required
                    value={form.bookTitle} onChange={handleChange}
                    className={inputCls} placeholder="Esim. Yrittäjän selviytymisopas tai Muistelmani"
                  />
                </div>
                <div>
                  <label className={labelCls}>Genre / aihe</label>
                  <select name="genre" value={form.genre} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse genre</option>
                    <option value="tietokirja">Tietokirja</option>
                    <option value="romaani">Romaani</option>
                    <option value="omaelämäkerta">Omaelämäkerta / muistelmat</option>
                    <option value="liiketoiminta">Liiketoiminta / yrittäjyys</option>
                    <option value="lastenkirja">Lastenkirja</option>
                    <option value="runokirja">Runokirja</option>
                    <option value="oppikirja">Oppikirja / opas</option>
                    <option value="muu">Muu</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Arvioitu sivumäärä</label>
                  <select name="pages" value={form.pages} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="alle100">Alle 100 sivua</option>
                    <option value="100-200">100–200 sivua</option>
                    <option value="200-300">200–300 sivua</option>
                    <option value="yli300">Yli 300 sivua</option>
                    <option value="ei-tiedä">En tiedä vielä</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Käsikirjoituksen tila</label>
                  <select name="manuscript" value={form.manuscript} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="valmis">Valmis — voidaan aloittaa heti</option>
                    <option value="lähes">Lähes valmis (1–4 viikkoa)</option>
                    <option value="kesken">Työn alla (1–3 kuukautta)</option>
                    <option value="idea">Vasta idea — haluaisin neuvoja</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Haluatko äänikirjan?</label>
                  <select name="audiobook" value={form.audiobook} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="kylla">Kyllä, ehdottomasti</option>
                    <option value="ei">Ei tällä kertaa</option>
                    <option value="ehka">Ehkä — haluaisin lisätietoa</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Toivottu julkaisuaikataulu</label>
                  <select name="timeline" value={form.timeline} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="1kk">1 kuukauden sisällä</option>
                    <option value="1-3kk">1–3 kuukauden sisällä</option>
                    <option value="3-6kk">3–6 kuukauden sisällä</option>
                    <option value="yli6kk">Yli 6 kuukautta</option>
                    <option value="ei-kiire">Ei kiirettä — haluan ensin tietää lisää</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Viesti */}
            <div className="bg-white border border-border rounded-xl p-8">
              <h2 className="text-foreground font-bold text-lg mb-2">Lisätietoja</h2>
              <p className="text-muted-foreground text-sm mb-4">Kerro vapaasti kirjastasi, tavoitteistasi tai kysymyksistäsi. Mitä enemmän kerrot, sitä paremmin voimme auttaa.</p>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={5}
                className={inputCls + " resize-none"}
                placeholder="Esim. Kirjani käsittelee... Tavoitteeni on... Minulla on kysymys..."
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
                Olen lukenut{" "}
                <a href="/sopimusehdot" className="thunder-orange underline hover:no-underline">sopimusehdot</a>
                {" "}ja hyväksy, että Thunder Kustannus käsittelee tietojani arviopyyntöä varten.
                Voin ottaa yhteyttä myös puhelimitse antamaani numeroon.
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
              Vastaamme 24 tunnin sisällä. Ei sitoumuksia. Tietojasi ei luovuteta kolmansille osapuolille.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
