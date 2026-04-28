// Thunder Kustannus — Tarjouspyyntösivu v2 (vaalea)
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";

type FormData = {
  name: string; email: string; phone: string; package: string;
  bookTitle: string; genre: string; pages: string;
  manuscript: string; audiobook: string; message: string; agree: boolean;
};

const INITIAL: FormData = {
  name: "", email: "", phone: "", package: "", bookTitle: "",
  genre: "", pages: "", manuscript: "", audiobook: "", message: "", agree: false,
};

const inputCls = "w-full bg-white border border-border rounded-lg px-4 py-3 text-foreground text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all placeholder:text-muted-foreground/60";
const labelCls = "block text-foreground/70 text-sm font-medium mb-1.5";

export default function Tarjouspyynto() {
  const [form, setForm] = useState<FormData>(INITIAL);
  useSEO({
    title: "Pyydä tarjous — Kirjan julkaiseminen",
    description: "Pyydä ilmainen tarjous kirjasi julkaisemisesta. Vastaamme 24 tunnin sisään. Ei sitoumuksia. Thunder Kustannus — suomalainen palvelukustantamo.",
    canonical: "/tarjouspyynto",
    keywords: "tarjouspyyntö, kirjan julkaiseminen tarjous, omakustanne tarjous",
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
          message: form.message,
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        alert("Lomakkeen lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä sähköpostilla: info@thunderkustannus.fi");
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
          <div className="w-16 h-16 rounded-full thunder-orange-bg flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="thunder-heading text-4xl text-foreground mb-4">Tarjouspyyntö lähetetty!</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Kiitos yhteydenotostasi. Vastaamme sinulle 24 tunnin sisällä sähköpostiosoitteeseen{" "}
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
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl text-foreground mb-4">Pyydä tarjous</h1>
            <p className="text-muted-foreground text-lg">
              Täytä lomake ja saat henkilökohtaisen tarjouksen 24 tunnin sisällä. Ei sitoumuksia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Yhteystiedot */}
            <div className="bg-white border border-border rounded-xl p-8">
              <h2 className="text-foreground font-bold text-lg mb-6">Yhteystiedot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nimi *</label>
                  <input type="text" name="name" required value={form.name} onChange={handleChange} className={inputCls} placeholder="Etunimi Sukunimi" />
                </div>
                <div>
                  <label className={labelCls}>Sähköposti *</label>
                  <input type="email" name="email" required value={form.email} onChange={handleChange} className={inputCls} placeholder="sinä@esimerkki.fi" />
                </div>
                <div>
                  <label className={labelCls}>Puhelinnumero</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} className={inputCls} placeholder="+358 40 123 4567" />
                </div>
                <div>
                  <label className={labelCls}>Kiinnostava paketti</label>
                  <select name="package" value={form.package} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse paketti</option>
                    {PACKAGES.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — {p.price} €</option>
                    ))}
                    <option value="custom">Räätälöity paketti</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Kirjan tiedot */}
            <div className="bg-white border border-border rounded-xl p-8">
              <h2 className="text-foreground font-bold text-lg mb-6">Kirjan tiedot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Kirjan (työ)nimi</label>
                  <input type="text" name="bookTitle" value={form.bookTitle} onChange={handleChange} className={inputCls} placeholder="Kirjan nimi tai aihe" />
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
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Käsikirjoituksen tila</label>
                  <select name="manuscript" value={form.manuscript} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="valmis">Valmis</option>
                    <option value="lähes">Lähes valmis</option>
                    <option value="kesken">Työn alla</option>
                    <option value="idea">Vasta idea</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Haluatko äänikirjan?</label>
                  <select name="audiobook" value={form.audiobook} onChange={handleChange} className={inputCls}>
                    <option value="">Valitse</option>
                    <option value="kylla">Kyllä</option>
                    <option value="ei">Ei</option>
                    <option value="ehka">Ehkä, haluaisin lisätietoa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Viesti */}
            <div className="bg-white border border-border rounded-xl p-8">
              <h2 className="text-foreground font-bold text-lg mb-4">Lisätietoja</h2>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={4}
                className={inputCls + " resize-none"}
                placeholder="Kerro vapaasti kirjastasi, aikataulustasi tai muista toiveistasi..."
              />
            </div>

            {/* Suostumus */}
            <div className="flex items-start gap-3">
              <input type="checkbox" name="agree" id="agree" required checked={form.agree} onChange={handleChange} className="mt-1 w-4 h-4 accent-orange-500" />
              <label htmlFor="agree" className="text-muted-foreground text-sm leading-relaxed">
                Olen lukenut{" "}
                <a href="/sopimusehdot" className="thunder-orange underline hover:no-underline">sopimusehdot</a>
                {" "}ja hyväksyn, että Thunder Kustannus käsittelee tietojani tarjouspyynnön käsittelyä varten.
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="thunder-btn-primary w-full py-4 rounded-lg text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <><Send className="w-4 h-4" /> Lähetä tarjouspyyntö</>
              )}
            </button>

            <p className="text-muted-foreground text-xs text-center">Vastaamme 24 tunnin sisällä. Ei sitoumuksia.</p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
