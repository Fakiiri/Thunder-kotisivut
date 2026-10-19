import { useGuides } from "@/contexts/GuidesContext";
// Thunder Kustannus — Etusivu v2
// Design: Warm white bg, charcoal text, orange accents, Plus Jakarta Sans headings
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, BookOpen, Headphones, Store, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import CampaignBanner from "@/components/CampaignBanner";
import AuthorFeedback from "@/components/AuthorFeedback";
import PackageFeatures from "@/components/PackageFeatures";
import { PACKAGE_TERMS } from "@/lib/sales-content";
import Footer from "@/components/Footer";
import { PACKAGES, COMPANY } from "@/lib/data";
import PackagePurchase, { KlarnaNote } from "@/components/PackagePurchase";
import { paymentLinkFor } from "@/lib/payments";
import { trackPurchaseClick } from "@/lib/purchase-analytics";
import PrintCalculator from "@/components/PrintCalculator";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const HERO_IMG = "/images/painettu.png";
const AUDIOBOOK_IMG = "/images/aani.png";
const BOOKS_IMG = "/images/premium.png";
const EBOOK_IMG = "/images/ebook-reader.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const GUIDES = useGuides();
  const { t, lang } = useLang();
  const pkgTranslations = lang === "en" && t.pricing?.packages ? t.pricing.packages : undefined;
  useSEO({
    title: "Omakustanne ja kirjan julkaisu",
    description: "Thunder Kustannus on suomalainen kirjailijoiden julkaisualusta. Yhdistämme ammattimaisen kustannustoiminnan ja kirjailijan täyden kontrollin — painettu kirja, e-kirja ja äänikirja. Sinulla pysyvät oikeudet ja 60–70 % myyntituloista.",
    canonical: "/",
    keywords: "omakustanne, kirjan julkaiseminen, äänikirja, e-kirja, kustantamo, julkaisualusta, omakustannekirja",
  });
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── HERO — tumma osio, valkoisella tekstillä ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="Thunder Kustannus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/65 to-black/20" />
        </div>

        <div className="container relative z-10 pt-32 pb-16">
          <div className="max-w-xl">
            <motion.div initial={false} animate="visible" variants={fadeUp}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-5">
                <span className="w-6 h-px bg-orange-400 inline-block" />
                {t.home.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={false} animate="visible" variants={fadeUp}
              className="thunder-heading text-5xl md:text-6xl lg:text-7xl text-white mb-5"
            >
              {t.home.h1}
            </motion.h1>

            <motion.p
              initial={false} animate="visible" variants={fadeUp}
              className="text-white/75 text-lg leading-relaxed mb-8 max-w-md"
            >
              {t.home.lead}
            </motion.p>

            <motion.div initial={false} animate="visible" variants={fadeUp} className="flex flex-wrap gap-3">
              <Link href="/tarjouspyynto" className="thunder-btn-primary px-7 py-3.5 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                {t.home.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/hinnat" className="px-7 py-3.5 rounded-lg text-sm font-bold inline-flex items-center gap-2 border-2 border-white/30 text-white hover:border-white/60 transition-colors">
                {t.home.ctaSecondary}
              </Link>
            </motion.div>

            <motion.div initial={false} animate="visible" variants={fadeUp} className="flex flex-wrap gap-5 mt-10">
              {COMPANY.distribution.slice(0, 4).map((b) => (
                <span key={b} className="text-white/35 text-xs font-medium uppercase tracking-wider">{b}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#191918] border-t border-white/15 text-white py-7">
        <div className="container flex flex-col md:flex-row gap-5 md:items-center md:justify-between">
          <div><p className="font-bold text-xl md:text-2xl">{lang === "en" ? "An audiobook is already included in the 890 € package." : "Äänikirja kuuluu jo 890 €:n pakettiin."}</p><p className="text-white/65 text-sm mt-2">Storytel · BookBeat · Nextory · Spotify</p></div>
          <Link href="/hinnat" className="inline-flex items-center gap-2 text-orange-400 font-bold shrink-0">{lang === "en" ? "Explore Digi" : "Tutustu Digi-pakettiin"}<ArrowRight size={18} /></Link>
        </div>
      </section>
      <CampaignBanner />

      {/* ── PALVELUT — vaalea tausta ── */}
      <section className="thunder-section bg-background">
        <div className="container">
          <div className="text-center mb-14">
            <span className="orange-line mx-auto" />
            <h2 className="thunder-heading text-4xl md:text-5xl text-foreground mb-3">
              {t.home.servicesTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t.home.servicesLead}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                paymentId: "printti",
                placement: "home_printed" as const,
                title: t.home.service1Title,
                desc: t.home.service1Desc,
                img: HERO_IMG,
              },
              {
                icon: Headphones,
                paymentId: "digi",
                placement: "home_audio" as const,
                title: t.home.service2Title,
                desc: t.home.service2Desc,
                img: AUDIOBOOK_IMG,
              },
              {
                icon: Store,
                paymentId: "digi",
                placement: "home_ebook" as const,
                title: t.home.service3Title,
                desc: t.home.service3Desc,
                img: EBOOK_IMG,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="thunder-card overflow-hidden group"
              >
                <a href={paymentLinkFor(item.paymentId) ?? "/hinnat"}
                  aria-label={`${item.title} — ${paymentLinkFor(item.paymentId) ? (lang === "en" ? "Order package" : "Tilaa paketti") : (lang === "en" ? "See packages" : "Tutustu paketteihin")}`}
                  onClick={event => trackPurchaseClick(event, { packageId: item.paymentId, placement: item.placement, checkout: !!paymentLinkFor(item.paymentId) })}
                  className="relative block h-44 overflow-hidden focus-visible:outline-4 focus-visible:outline-orange-500 focus-visible:outline-offset-2">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <div className="w-9 h-9 rounded-lg thunder-orange-bg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </a>
                <div className="p-6">
                  <h3 className="text-foreground font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                  <PackagePurchase packageId={item.paymentId} placement={item.placement} fallbackHref="/hinnat" className="mt-5 inline-flex items-center gap-2 thunder-btn-primary px-5 py-3 rounded-lg text-sm font-bold">
                    {lang === "en" ? "See packages" : "Tutustu paketteihin"} <ArrowRight size={16} aria-hidden="true" />
                  </PackagePurchase>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KIRJAPAINOLASKURI ── */}
      <PrintCalculator />

      {/* ── HINNAT — alt-tausta ── */}
      <section className="thunder-section thunder-section-alt">
        <div className="container">
          <div className="text-center mb-14">
            <span className="orange-line mx-auto" />
            <h2 className="thunder-heading text-4xl md:text-5xl text-foreground mb-3">
              {t.home.pricingTitle}
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t.home.pricingLead}
            </p>
            <p className="mt-5 text-foreground/75 text-base max-w-2xl mx-auto leading-relaxed">
              {lang === "en"
                ? "You can order just the book printing at the price you calculated — only shipping costs are added. Or choose the package that suits your situation from the options below:"
                : "Voit tilata meiltä pelkän kirjan painatuksen laskurista saamallasi hinnalla, vain toimituskulut lisätään. Voit myös valita tilanteeseesi sopivan paketin alla olevista vaihtoehdoista:"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-start gap-6 max-w-6xl mx-auto">
            {PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial={false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`relative rounded-xl p-7 border flex flex-col transition-all duration-300 ${
                  pkg.highlight
                    ? "border-orange-400 bg-white shadow-[0_0_0_1px_oklch(0.68_0.20_42/0.3),0_8px_40px_oklch(0.68_0.20_42/0.12)]"
                    : "border-border bg-white hover:border-orange-200 hover:shadow-md"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="thunder-orange-bg text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      {t.home.pricingPopular}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                    {pkgTranslations ? pkgTranslations[PACKAGES.indexOf(pkg)]?.tagline : pkg.tagline}
                  </p>
                  <h3 className="text-foreground text-2xl font-bold mb-3">{pkg.name}</h3>
                  <div className="flex flex-col gap-1">
                    <span className="thunder-orange text-4xl md:text-3xl lg:text-4xl font-extrabold whitespace-nowrap">{pkg.price} €</span>
                    <span className="text-muted-foreground text-sm">{pkg.priceNote}</span>
                  </div>
                </div>
                <div className="mb-7 flex-1">
                  <PackageFeatures emphasizeAudio={pkg.id === "digi"} features={(pkgTranslations ? pkgTranslations[PACKAGES.indexOf(pkg)]?.features ?? pkg.features : pkg.features)} />
                </div>
                <PackagePurchase
                  packageId={pkg.id}
                  placement="home_packages"
                  className={`w-full py-3 rounded-lg text-sm font-bold text-center block transition-all ${
                    pkg.highlight ? "thunder-btn-primary" : "thunder-btn-outline"
                  }`}
                >
                  {lang === "en" ? "Get a free estimate" : pkg.cta}
                </PackagePurchase>
                {pkg.id === "premium" && <Link href="/asiantuntijakirja" className="inline-flex justify-center items-center gap-2 font-semibold text-sm thunder-orange underline underline-offset-4 mt-5">{lang === "en" ? "For experts and entrepreneurs" : "Lue lisää asiantuntijoille"}<ArrowRight size={15} /></Link>}
              </motion.div>
            ))}
          </div>

          <KlarnaNote />
          <p className="text-sm leading-relaxed text-muted-foreground max-w-4xl mx-auto mt-6">{PACKAGE_TERMS[lang]}</p>
          <div className="text-center mt-8">
            <Link href="/hinnat" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
              {t.home.pricingMore} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <AuthorFeedback />

      {/* ── OPPAAT ── */}
      <section className="thunder-section bg-background">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="orange-line" />
              <h2 className="thunder-heading text-4xl md:text-5xl text-foreground mb-2">
              {t.home.guidesTitle}
            </h2>
            <p className="text-muted-foreground text-lg">{t.home.guidesLead}</p>
            </div>
            <Link href="/oppaat" className="inline-flex items-center gap-2 thunder-orange hover:opacity-80 font-semibold text-sm transition-opacity whitespace-nowrap">
              {t.home.guidesAll} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GUIDES.slice(0, 3).map((guide) => (
              <motion.article
                key={guide.id}
                initial={false}
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link href={`/oppaat/${guide.slug}`} className="block group h-full">
                  <div className="thunder-card p-6 h-full">
                    <span className="text-xs font-semibold uppercase tracking-widest thunder-orange mb-3 block">
                      {guide.category}
                    </span>
                    <h3 className="text-foreground font-bold text-base leading-snug mb-3 group-hover:text-orange-500 transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{guide.excerpt}</p>
                    <div className="text-muted-foreground text-xs">{guide.readTime} {t.home.guideReadTime}</div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATAA OPAS — sähköpostikeräys ── */}
      <section className="thunder-section thunder-section-alt">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <span className="orange-line mx-auto" />
            <h2 className="thunder-heading text-3xl md:text-4xl text-foreground mb-3">
              {t.home.downloadTitle}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              {t.home.downloadLead}
            </p>
            <Link href="/lataa-opas" className="thunder-btn-primary px-8 py-4 rounded-lg text-base font-bold inline-flex items-center gap-2">
              {t.home.downloadCta} <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-muted-foreground text-xs mt-3">{t.home.downloadNote}</p>
          </div>
        </div>
      </section>

      {/* ── CTA — tumma osio ── */}
      <section className="py-24 thunder-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src={HERO_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container relative z-10 text-center">
          <span className="orange-line mx-auto" />
          <h2 className="thunder-heading text-4xl md:text-6xl text-white mb-5">
            {t.home.ctaTitle}
          </h2>
          <p className="text-white/65 text-xl mb-10 max-w-lg mx-auto">
            {t.home.ctaLead}
          </p>
          <Link href="/tarjouspyynto" className="thunder-btn-primary px-10 py-4 rounded-lg text-base font-bold inline-flex items-center gap-2">
            {t.home.ctaBtn} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
