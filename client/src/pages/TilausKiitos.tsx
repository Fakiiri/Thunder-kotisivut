import { ArrowRight, BookOpen, Mail, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const steps = [
  { title: "Vahvistus sähköpostiisi", text: "Lähetämme tilausvahvistuksen maksusivulla antamaasi sähköpostiosoitteeseen, kun maksu on vahvistunut. Jos maksu on vielä käsittelyssä, vahvistus lähtee sen valmistuttua." },
  { title: "Otamme sinuun yhteyttä", text: "Otamme sinuun henkilökohtaisesti yhteyttä yhden arkipäivän kuluessa maksun vahvistumisesta. Käymme yhdessä läpi ostamasi paketin ja seuraavat vaiheet." },
  { title: "Saat ohjeet aineistoon", text: "Annamme ohjeet käsikirjoituksen ja muun aineiston toimittamiseen. Sinun ei tarvitse lähettää tiedostoja vielä — sovimme ensin, miten pääsemme parhaiten alkuun." },
];

export default function TilausKiitos() {
  useSEO({ title: "Kiitos tilauksestasi", description: "Näin kirjasi julkaiseminen jatkuu tilauksen jälkeen.", canonical: "/kiitos", noIndex: true });
  return <div className="min-h-screen bg-background text-foreground">
    <Navbar />
    <main className="container pt-36 pb-24 max-w-4xl">
      <section className="rounded-3xl bg-[#191816] text-[#fff8ea] px-6 py-12 sm:px-12 sm:py-16">
        <BookOpen className="h-10 w-10 text-[#ff620f] mb-7" aria-hidden="true" />
        <p className="text-sm tracking-widest uppercase text-[#ff9c65] mb-4">Thunder Kustannus</p>
        <h1 className="thunder-heading text-4xl sm:text-6xl leading-tight mb-6">Kiitos tilauksestasi.</h1>
        <p className="text-lg sm:text-xl leading-relaxed max-w-2xl text-[#fff8ea]/85">Sinun kirjasi seuraava luku alkaa tästä. Olemme tukenasi julkaisun seuraavissa vaiheissa.</p>
      </section>
      <section className="mt-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="thunder-heading text-3xl mb-8">Mitä tapahtuu seuraavaksi?</h2>
        <ol className="space-y-8">
          {steps.map((step, index) => <li key={step.title} className="flex gap-4 sm:gap-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-800 font-bold" aria-hidden="true">{index + 1}</span>
            <div><h3 className="font-semibold text-xl mb-2">{step.title}</h3><p className="leading-relaxed text-muted-foreground">{step.text}</p></div>
          </li>)}
        </ol>
      </section>
      <aside className="mt-12 rounded-2xl border border-border p-6 sm:p-8">
        <h2 className="thunder-heading text-2xl mb-3">Jäikö jokin mietityttämään?</h2>
        <p className="text-muted-foreground leading-relaxed mb-6">Jos et löydä tilausvahvistusta, tarkista myös roskapostikansio. Saat meihin yhteyden sähköpostilla tai WhatsAppissa.</p>
        <div className="flex flex-wrap gap-4">
          <a className="inline-flex items-center gap-2 font-semibold underline underline-offset-4" href="mailto:info@thunderkustannus.fi"><Mail size={19} aria-hidden="true" /> info@thunderkustannus.fi</a>
          <a className="inline-flex items-center gap-2 font-semibold underline underline-offset-4" href="https://wa.me/358403519546" target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden="true" /> WhatsApp</a>
        </div>
      </aside>
      <Link href="/" className="inline-flex items-center gap-2 mt-8 font-semibold">Takaisin etusivulle <ArrowRight size={18} aria-hidden="true" /></Link>
    </main>
    <Footer />
  </div>;
}
