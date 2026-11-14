import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X, Zap } from "lucide-react";
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

  const en = lang === "en";
  type NavItem = { href: string; label: string; external?: boolean };
  type NavGroup = { label: string; href?: string; items?: NavItem[] };
  // Kaikki aiemmat linkit säilyvät; ne on vain ryhmitelty alasvetovalikoihin.
  const navGroups: NavGroup[] = [
    { label: t.nav.home, href: "/" },
    {
      label: en ? "Services" : "Palvelut",
      items: [
        { href: "/hinnat", label: en ? "Pricing and packages" : "Hinnat ja paketit" },
        { href: "/#aaninayte", label: en ? "Free audio sample" : "Ilmainen ääninäyte", external: true },
        { href: "/asiantuntijakirja", label: en ? "Books for experts" : "Asiantuntijakirja" },
        { href: "/kansisuunnittelija", label: en ? "Cover designer" : "Kansisuunnittelija" },
      ],
    },
    {
      label: en ? "How to publish" : "Näin julkaiset",
      items: [
        { href: "/nain-julkaiset", label: en ? "How publishing works" : "Näin julkaisu etenee" },
        { href: "/ukk", label: en ? "FAQ" : "Usein kysytyt kysymykset" },
        { href: "/julkaisutesti", label: en ? "2-minute quiz" : "2 minuutin julkaisutesti" },
        { href: "/varaa-puhelu", label: en ? "Book a call" : "Varaa julkaisupuhelu", external: true },
        { href: "/sopimusehdot", label: en ? "Terms" : "Sopimusehdot" },
      ],
    },
    {
      label: t.nav.guides,
      items: [
        { href: "/oppaat", label: en ? "All guides" : "Kaikki oppaat" },
        { href: "/lataa-opas", label: en ? "Publishing guide 2027 (PDF)" : "Julkaisuopas 2027 (PDF)" },
        { href: "/kirjasi-5-paivassa", label: en ? "Your book in 5 days" : "Kirjasi 5 päivässä" },
        { href: "/muistelman-aloitus", label: en ? "Start your memoir" : "Muistelman aloitus" },
        { href: "/naytekirja", label: en ? "Sample book" : "Näytekirja" },
      ],
    },
    { label: t.nav.books, href: "/kirjat" },
    {
      label: t.nav.about,
      items: [
        { href: "/meista", label: t.nav.about },
        { href: "/yhteystiedot", label: t.nav.contact },
      ],
    },
  ];
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  useEffect(() => setOpenGroup(null), [location]);
  const groupActive = (g: NavGroup) =>
    g.href ? location === g.href : !!g.items?.some(i => i.href === location);
  const linkTone = (active: boolean) =>
    active ? "thunder-orange" : onDark ? "text-white/75 hover:text-white" : "text-foreground/60 hover:text-foreground";


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

          {/* Desktop nav: alasvetovalikot */}
          <nav className="hidden xl:flex items-center gap-5" aria-label={en ? "Main" : "Päävalikko"}>
            {navGroups.map(g =>
              g.href ? (
                <Link key={g.label} href={g.href} className={`text-sm font-medium transition-colors duration-200 ${linkTone(groupActive(g))}`}>
                  {g.label}
                </Link>
              ) : (
                <div
                  key={g.label}
                  className="relative"
                  onMouseEnter={() => setOpenGroup(g.label)}
                  onMouseLeave={() => setOpenGroup(null)}
                >
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openGroup === g.label}
                    onClick={() => setOpenGroup(openGroup === g.label ? null : g.label)}
                    className={`inline-flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${linkTone(groupActive(g))}`}
                  >
                    {g.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openGroup === g.label ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  {openGroup === g.label && (
                    <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3 z-50">
                      <ul className="min-w-60 rounded-xl border border-gray-100 bg-white p-2 shadow-xl">
                        {g.items!.map(i => (
                          <li key={i.href}>
                            {i.external ? (
                              <a href={i.href} className="block rounded-lg px-3 py-2 text-sm text-foreground/75 hover:bg-orange-50 hover:text-foreground">
                                {i.label}
                              </a>
                            ) : (
                              <Link
                                href={i.href}
                                className={`block rounded-lg px-3 py-2 text-sm hover:bg-orange-50 ${location === i.href ? "thunder-orange font-semibold" : "text-foreground/75 hover:text-foreground"}`}
                              >
                                {i.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            )}
          </nav>

          {/* CTA + language switcher */}
          <div className="hidden xl:flex items-center gap-3">
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
            className={`xl:hidden p-2 ${onDark ? "text-white" : "text-foreground"}`}
            onClick={() => setOpen(!open)}
            aria-label="Avaa valikko"
            aria-expanded={open}
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="xl:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="container py-5 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
              {navGroups.map(g =>
                g.href ? (
                  <Link
                    key={g.label}
                    href={g.href}
                    onClick={() => setOpen(false)}
                    className={`text-sm font-medium py-2.5 px-2 rounded transition-colors ${
                      location === g.href ? "thunder-orange bg-orange-50" : "text-foreground/70 hover:text-foreground hover:bg-gray-50"
                    }`}
                  >
                    {g.label}
                  </Link>
                ) : (
                  <details key={g.label} className="group" open={groupActive(g)}>
                    <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium py-2.5 px-2 rounded text-foreground/70 hover:bg-gray-50">
                      {g.label}
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <div className="ml-3 border-l border-gray-100 pl-3 flex flex-col">
                      {g.items!.map(i =>
                        i.external ? (
                          <a key={i.href} href={i.href} onClick={() => setOpen(false)} className="text-sm py-2 px-2 rounded text-foreground/65 hover:text-foreground hover:bg-gray-50">
                            {i.label}
                          </a>
                        ) : (
                          <Link
                            key={i.href}
                            href={i.href}
                            onClick={() => setOpen(false)}
                            className={`text-sm py-2 px-2 rounded ${location === i.href ? "thunder-orange bg-orange-50" : "text-foreground/65 hover:text-foreground hover:bg-gray-50"}`}
                          >
                            {i.label}
                          </Link>
                        )
                      )}
                    </div>
                  </details>
                )
              )}
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
