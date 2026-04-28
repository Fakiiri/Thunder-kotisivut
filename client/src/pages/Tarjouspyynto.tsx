// Thunder Kustannus — Tarjouspyyntösivu
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES } from "@/lib/data";

type FormData = {
  name: string;
  email: string;
  phone: string;
  package: string;
  bookTitle: string;
  genre: string;
  pages: string;
  manuscript: string;
  audiobook: string;
  message: string;
  agree: boolean;
};

const INITIAL: FormData = {
  name: "", email: "", phone: "", package: "", bookTitle: "",
  genre: "", pages: "", manuscript: "", audiobook: "", message: "", agree: false,
};

export default function Tarjouspyynto() {
  const [form, setForm] = useState<FormData>(INITIAL);
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
    // Formspree tai muu backend — tällä hetkellä simuloitu lähetys
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="pt-40 pb-20 flex flex-col items-center justify-center text-center container">
          <div className="w-16 h-16 rounded-full thunder-orange-bg flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-black" />
          </div>
          <h1 className="thunder-heading text-4xl text-white mb-4">Tarjouspyyntö lähetetty!</h1>
          <p className="text-white/60 text-lg max-w-md">
            Kiitos yhteydenotostasi. Vastaamme sinulle 24 tunnin sisällä sähköpostiosoitteeseen <strong className="text-white">{form.email}</strong>.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl text-white mb-4">Pyydä tarjous</h1>
            <p className="text-white/60 text-lg">
              Täytä lomake ja saat henkilökohtaisen tarjouksen 24 tunnin sisällä. Ei sitoumuksia.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Yhteystiedot */}
            <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold text-lg mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
                Yhteystiedot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-sm mb-2">Nimi *</label>
                  <input
                    type="text" name="name" required value={form.name} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    placeholder="Etunimi Sukunimi"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Sähköposti *</label>
                  <input
                    type="email" name="email" required value={form.email} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    placeholder="sinä@esimerkki.fi"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Puhelinnumero</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    placeholder="+358 40 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Kiinnostava paketti</label>
                  <select
                    name="package" value={form.package} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  >
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
            <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold text-lg mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
                Kirjan tiedot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-sm mb-2">Kirjan (työ)nimi</label>
                  <input
                    type="text" name="bookTitle" value={form.bookTitle} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                    placeholder="Kirjan nimi tai aihe"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Genre / aihe</label>
                  <select
                    name="genre" value={form.genre} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  >
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
                  <label className="block text-white/60 text-sm mb-2">Arvioitu sivumäärä</label>
                  <select
                    name="pages" value={form.pages} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="">Valitse</option>
                    <option value="alle100">Alle 100 sivua</option>
                    <option value="100-200">100–200 sivua</option>
                    <option value="200-300">200–300 sivua</option>
                    <option value="yli300">Yli 300 sivua</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Käsikirjoituksen tila</label>
                  <select
                    name="manuscript" value={form.manuscript} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="">Valitse</option>
                    <option value="valmis">Valmis</option>
                    <option value="lähes">Lähes valmis</option>
                    <option value="kesken">Työn alla</option>
                    <option value="idea">Vasta idea</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-sm mb-2">Haluatko äänikirjan?</label>
                  <select
                    name="audiobook" value={form.audiobook} onChange={handleChange}
                    className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors"
                  >
                    <option value="">Valitse</option>
                    <option value="kylla">Kyllä</option>
                    <option value="ei">Ei</option>
                    <option value="ehka">Ehkä, haluaisin lisätietoa</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Viesti */}
            <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
              <h2 className="text-white font-bold text-lg mb-6" style={{ fontFamily: "Syne, sans-serif" }}>
                Lisätietoja
              </h2>
              <textarea
                name="message" value={form.message} onChange={handleChange} rows={4}
                className="w-full bg-[oklch(0.15_0.005_240)] border border-white/15 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
                placeholder="Kerro vapaasti kirjastasi, aikataulustasi tai muista toiveistasi..."
              />
            </div>

            {/* Suostumus */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox" name="agree" id="agree" required checked={form.agree} onChange={handleChange}
                className="mt-1 w-4 h-4 accent-orange-400"
              />
              <label htmlFor="agree" className="text-white/50 text-sm leading-relaxed">
                Olen lukenut{" "}
                <a href="/sopimusehdot" className="thunder-orange underline hover:no-underline">sopimusehdot</a>
                {" "}ja hyväksyn, että Thunder Kustannus käsittelee tietojani tarjouspyynnön käsittelyä varten.
              </label>
            </div>

            <button
              type="submit" disabled={loading}
              className="thunder-btn-primary w-full py-4 rounded text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Lähetä tarjouspyyntö
                </>
              )}
            </button>

            <p className="text-white/30 text-xs text-center">
              Vastaamme 24 tunnin sisällä. Ei sitoumuksia.
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
