import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { lang, setLang, t } = useLang();

  const isHeroPage = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const onDark = isHeroPage && !scrolled;

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/hinnat", label: t.nav.pricing },
    { href: "/oppaat", label: t.nav.guides },
    { href: "/meista", label: t.nav.about },
    { href: "/yhteystiedot", label: t.nav.contact },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar: sähköposti — näkyy vain desktopilla */}
      <div
        className={`hidden md:flex justify-end items-center h-7 transition-all duration-300 ${
          onDark
            ? "bg-black/20 text-white/55"
            : "bg-gray-50 text-foreground/45 border-b border-gray-100"
        }`}
      >
        <div className="container flex justify-end">
          <a
            href="mailto:info@thunderkustannus.fi"
            className={`text-xs transition-colors ${
              onDark ? "hover:text-white/80" : "hover:text-foreground/70"
            }`}
          >
            info@thunderkustannus.fi
          </a>
        </div>
      </div>

      {/* Main navbar */}
      <header
        className={`transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : isHeroPage
            ? "bg-transparent"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center thunder-orange-bg">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span
              className={`font-bold text-lg tracking-tight transition-colors ${onDark ? "text-white" : "text-foreground"}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Thunder<span className="thunder-orange">Kustannus</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location === link.href
                    ? "thunder-orange"
                    : onDark
                    ? "text-white/75 hover:text-white"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + language switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "fi" ? "en" : "fi")}
              className={`text-xs font-bold px-2.5 py-1 rounded border transition-colors ${
                onDark
                  ? "border-white/30 text-white/70 hover:border-white/60 hover:text-white"
                  : "border-gray-200 text-foreground/50 hover:border-gray-400 hover:text-foreground"
              }`}
              aria-label="Switch language"
            >
              {lang === "fi" ? "EN" : "FI"}
            </button>

            <Link
              href="/lataa-opas"
              className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${onDark ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}
            >
              <span className="text-orange-500">↓</span> {t.nav.freeGuide}
            </Link>
            <Link
              href="/tarjouspyynto"
              className="thunder-btn-primary px-5 py-2.5 rounded-lg text-sm font-bold inline-block"
            >
              {t.nav.cta}
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2 ${onDark ? "text-white" : "text-foreground"}`}
            onClick={() => setOpen(!open)}
            aria-label="Avaa valikko"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="container py-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium py-2.5 px-2 rounded transition-colors ${
                    location === link.href
                      ? "thunder-orange bg-orange-50"
                      : "text-foreground/70 hover:text-foreground hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Sähköposti mobiilissa */}
              <a
                href="mailto:info@thunderkustannus.fi"
                className="text-sm py-2.5 px-2 text-foreground/50 hover:text-foreground"
              >
                info@thunderkustannus.fi
              </a>
              {/* Language toggle mobile */}
              <button
                onClick={() => setLang(lang === "fi" ? "en" : "fi")}
                className="text-sm font-bold py-2.5 px-2 text-left text-foreground/60 hover:text-foreground"
              >
                {lang === "fi" ? "🌐 Switch to English" : "🌐 Vaihda suomeksi"}
              </button>
              <Link
                href="/lataa-opas"
                className="border-2 border-orange-400 text-orange-500 px-5 py-3 rounded-lg text-sm font-bold text-center mt-2 block"
              >
                ↓ {t.nav.freeGuide}
              </Link>
              <Link
                href="/tarjouspyynto"
                className="thunder-btn-primary px-5 py-3 rounded-lg text-sm font-bold text-center mt-2 block"
              >
                {t.nav.cta}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
