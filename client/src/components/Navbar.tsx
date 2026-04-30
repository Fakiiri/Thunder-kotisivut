// Thunder Kustannus — Navbar v2
// Design: White/light bg when scrolled, transparent on hero, orange CTA
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Zap } from "lucide-react";

const navLinks = [
  { href: "/", label: "Etusivu" },
  { href: "/hinnat", label: "Hinnat" },
  { href: "/oppaat", label: "Oppaat" },
  { href: "/meista", label: "Meistä" },
  { href: "/yhteystiedot", label: "Yhteystiedot" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Hero pages have dark bg — nav text should be white until scrolled
  const isHeroPage = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  const onDark = isHeroPage && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/lataa-opas"
            className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${onDark ? "text-white/80 hover:text-white" : "text-foreground/70 hover:text-foreground"}`}
          >
            <span className="text-orange-500">↓</span> Ilmainen opas
          </Link>
          <Link
            href="/tarjouspyynto"
            className="thunder-btn-primary px-5 py-2.5 rounded-lg text-sm font-bold inline-block"
          >
            Pyydä tarjous
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
            <Link
              href="/lataa-opas"
              className="border-2 border-orange-400 text-orange-500 px-5 py-3 rounded-lg text-sm font-bold text-center mt-2 block"
            >
              ↓ Lataa ilmainen opas
            </Link>
            <Link
              href="/tarjouspyynto"
              className="thunder-btn-primary px-5 py-3 rounded-lg text-sm font-bold text-center mt-2 block"
            >
              Pyydä tarjous
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
