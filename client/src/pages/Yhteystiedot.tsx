// Thunder Kustannus — Yhteystiedot v2 (vaalea)
import { Link } from "wouter";
import { Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";
import { useSEO } from "@/hooks/useSEO";

export default function Yhteystiedot() {
  useSEO({
    title: "Yhteystiedot",
    description: "Ota yhteyttä Thunder Kustannukseen. Vastaamme kaikkiin viesteihin 24 tunnin sisään. Pyydä tarjous kirjasi julkaisemisesta.",
    canonical: "/yhteystiedot",
  });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl text-foreground mb-4">Yhteystiedot</h1>
            <p className="text-muted-foreground text-xl">Vastaamme kaikkiin viesteihin 24 tunnin sisällä.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="thunder-card p-8">
              <div className="w-10 h-10 rounded-lg thunder-orange-bg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">Sähköposti</h3>
              <a href={`mailto:${COMPANY.email}`} className="thunder-orange hover:underline text-sm">
                {COMPANY.email}
              </a>
              <p className="text-muted-foreground text-xs mt-2">Vastaamme 24h sisällä</p>
            </div>

            <div className="thunder-card p-8">
              <div className="w-10 h-10 rounded-lg thunder-orange-bg flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-foreground font-bold text-lg mb-2">Nopein tapa</h3>
              <p className="text-muted-foreground text-sm mb-4">Täytä tarjouspyyntölomake — saat henkilökohtaisen vastauksen nopeimmin.</p>
              <Link href="/tarjouspyynto" className="thunder-btn-primary px-5 py-2.5 rounded-lg text-sm font-bold inline-block">
                Pyydä tarjous
              </Link>
            </div>
          </div>

          <div className="thunder-card p-6">
            <h3 className="text-foreground font-bold mb-1">{COMPANY.legalName}</h3>
            <p className="text-muted-foreground text-sm">Suomalainen palvelukustantamo</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
