// Thunder Kustannus — Yhteystiedot
import { Link } from "wouter";
import { Mail, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";

export default function Yhteystiedot() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-5xl text-white mb-4">Yhteystiedot</h1>
            <p className="text-white/60 text-xl">Olemme täällä auttamassa. Vastaamme kaikkiin viesteihin 24 tunnin sisällä.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
              <div className="w-10 h-10 rounded thunder-orange-bg flex items-center justify-center mb-4">
                <Mail className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Sähköposti</h3>
              <a href={`mailto:${COMPANY.email}`} className="thunder-orange hover:underline text-sm">
                {COMPANY.email}
              </a>
              <p className="text-white/40 text-xs mt-2">Vastaamme 24h sisällä</p>
            </div>

            <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
              <div className="w-10 h-10 rounded thunder-orange-bg flex items-center justify-center mb-4">
                <ArrowRight className="w-5 h-5 text-black" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Nopein tapa</h3>
              <p className="text-white/60 text-sm mb-4">Täytä tarjouspyyntölomake — saat henkilökohtaisen vastauksen nopeimmin.</p>
              <Link href="/tarjouspyynto" className="thunder-btn-primary px-5 py-2.5 rounded text-sm font-bold inline-block">
                Pyydä tarjous
              </Link>
            </div>
          </div>

          <div className="bg-[oklch(0.11_0.005_240)] border border-white/10 rounded-xl p-8">
            <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: "Syne, sans-serif" }}>{COMPANY.legalName}</h3>
            <p className="text-white/40 text-sm">Suomalainen palvelukustantamo</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
