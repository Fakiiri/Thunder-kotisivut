// Thunder Kustannus — Footer
import { Link } from "wouter";
import { Zap } from "lucide-react";
import { COMPANY } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.07_0.005_240)] border-t border-white/10 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded flex items-center justify-center thunder-orange-bg">
                <Zap className="w-4 h-4 text-black" fill="black" />
              </div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: "Syne, sans-serif" }}>
                Thunder<span className="thunder-orange">Kustannus</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Moderni suomalainen palvelukustantamo. Julkaise kirjasi ammattimaisesti — painettu kirja, e-kirja ja äänikirja.
            </p>
            <p className="text-white/30 text-xs mt-4">{COMPANY.legalName}</p>
          </div>

          {/* Palvelut */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest" style={{ fontFamily: "Syne, sans-serif" }}>
              Palvelut
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/hinnat", label: "Hinnoittelu" },
                { href: "/tarjouspyynto", label: "Pyydä tarjous" },
                { href: "/oppaat", label: "Oppaat kirjailijoille" },
                { href: "/meista", label: "Meistä" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jakelu */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-widest" style={{ fontFamily: "Syne, sans-serif" }}>
              Jakelu
            </h4>
            <ul className="space-y-2">
              {COMPANY.distribution.map((d) => (
                <li key={d}>
                  <span className="text-white/50 text-sm">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} {COMPANY.legalName}. Kaikki oikeudet pidätetään.
          </p>
          <div className="flex gap-6">
            <Link href="/sopimusehdot" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Sopimusehdot
            </Link>
            <Link href="/tietosuoja" className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Tietosuoja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
