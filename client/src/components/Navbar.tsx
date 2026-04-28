// Thunder Kustannus — Navbar
// Design: Dark bg, orange accent, Syne font, sticky top
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.09_0.005_240/0.97)] backdrop-blur-md border-b border-white/10 shadow-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded flex items-center justify-center thunder-orange-bg">
            <Zap className="w-4 h-4 text-black" fill="black" />
          </div>
          <span
            className="text-white font-bold text-lg tracking-tight"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Thunder<span className="thunder-orange">Kustannus</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 ${
                location === link.href
                  ? "thunder-orange"
                  : "text-white/70 hover:text-white"
              }`}
              style={{ fontFamily: "DM Sans, sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <Link
            href="/tarjouspyynto"
            className="thunder-btn-primary px-5 py-2.5 rounded text-sm font-bold inline-block"
          >
            Pyydä tarjous
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Avaa valikko"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[oklch(0.09_0.005_240)] border-t border-white/10">
          <nav className="container py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-base font-medium py-2 transition-colors ${
                  location === link.href
                    ? "thunder-orange"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tarjouspyynto"
              className="thunder-btn-primary px-5 py-3 rounded text-sm font-bold inline-block text-center mt-2"
            >
              Pyydä tarjous
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
