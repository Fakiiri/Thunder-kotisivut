// Thunder Kustannus — Footer v2 (vaalea)
import { Link } from "wouter";
import { Zap, Instagram, Linkedin } from "lucide-react";
import { COMPANY } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-[oklch(0.12_0.005_240)] pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center thunder-orange-bg">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-white font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Thunder<span className="thunder-orange">Kustannus</span>
              </span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Moderni suomalainen hybridikustantamo. Julkaise kirjasi ammattimaisesti — painettu kirja, e-kirja ja äänikirja.
            </p>
            <p className="text-white/25 text-xs mt-4">{COMPANY.legalName}</p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.instagram.com/thunderkustannus/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Thunder Kustannus Instagramissa"
                className="text-white/35 hover:text-orange-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/thunder-kustannus"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Thunder Kustannus LinkedInissä"
                className="text-white/35 hover:text-orange-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Palvelut */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-widest">Palvelut</h4>
            <ul className="space-y-2.5">
              {[
                { href: "/hinnat", label: "Hinnoittelu" },
                { href: "/tarjouspyynto", label: "Pyydä ilmainen arvio" },
                { href: "/oppaat", label: "Oppaat kirjailijoille" },
                { href: "/meista", label: "Meistä" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/45 hover:text-white/80 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Jakelu */}
          <div>
            <h4 className="text-white font-semibold text-xs mb-4 uppercase tracking-widest">Jakelu</h4>
            <ul className="space-y-2.5">
              {COMPANY.distribution.map((d) => (
                <li key={d}>
                  <span className="text-white/45 text-sm">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} {COMPANY.legalName}. Kaikki oikeudet pidätetään.
            {" "}·{" "}Thunder Media Oy, Y-tunnus: 3575834-8
          </p>
          <div className="flex gap-6">
            <Link href="/sopimusehdot" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Sopimusehdot
            </Link>
            <Link href="/tietosuoja" className="text-white/25 hover:text-white/50 text-xs transition-colors">
              Tietosuoja
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
