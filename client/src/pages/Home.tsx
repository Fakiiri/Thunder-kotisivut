// Thunder Kustannus — Etusivu v2
// Design: Warm white bg, charcoal text, orange accents, Plus Jakarta Sans headings
import { Link } from "wouter";
import { useSEO } from "@/hooks/useSEO";
import { ArrowRight, BookOpen, Headphones, Store, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES, GUIDES, COMPANY } from "@/lib/data";
import PrintCalculator from "@/components/PrintCalculator";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_hero-AGE9LdUsmSYMTtiyt2bza6.webp";
const AUDIOBOOK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_audiobook-5KzGxqteP6emS5MsYQ9Skm.webp";
const BOOKS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_books_stack-4eaNEqNXq3hg3xEhNouWJe.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Home() {
  const { t } = useLang();
  useSEO({
    title: "Julkaise kirjasi ammattimaisesti",
    description: "Thunder Kustannus on suomalainen kirjailijoiden julkaisualusta. Yhdistämme ammattimaisen kustannustoiminnan ja kirjailijan täyden kontrollin — painettu kirja, e-kirja ja äänikirja. Sinulla pysyvät oikeudet ja 70–80 % myyntituloista.",
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
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-orange-400 mb-5">
                <span className="w-6 h-px bg-orange-400 inline-block" />
                {t.home.badge}
              </span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp}
              className="thunder-heading text-5xl md:text-6xl lg:text-7xl text-white mb-5"
            >
              {t.home.h1}
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp}
              className="text-white/75 text-lg leading-relaxed mb-8 max-w-md"
            >
              {t.home.lead}
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-3">
              <Link href="/arvio" className="thunder-btn-primary px-7 py-3.5 rounded-lg text-sm font-bold inline-flex items-center gap-2">
                {t.home.ctaPrimary} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/hinnat" className="px-7 py-3.5 rounded-lg text-sm font-bold inline-flex items-center gap-2 border-2 border-white/30 text-white hover:border-white/60 transition-colors">
                {t.home.ctaSecondary}
              </Link>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-5 mt-10">
              {COMPANY.distribution.slice(0, 4).map((b) => (
                <span key={b} className="text-white/35 text-xs font-medium uppercase tracking-wider">{b}</span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

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
                title: t.home.service1Title,
                desc: t.home.service1Desc,
                img: BOOKS_IMG,
              },
              {
                icon: Headphones,
                title: t.home.service2Title,
                desc: t.home.service2Desc,
                img: AUDIOBOOK_IMG,
              },
              {
                icon: Store,
                title: t.home.service3Title,
                desc: t.home.service3Desc,
                img: HERO_IMG,
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="thunder-card overflow-hidden group"
              >
                <div className="relative h-44 overflow-hidden">
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
                </div>
                <div className="p-6">
                  <h3 className="text-foreground font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PACKAGES.map((pkg) => (
              <motion.div
                key={pkg.id}
                initial="hidden"
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
                  <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">{pkg.tagline}</p>
                  <h3 className="text-foreground text-2xl font-bold mb-3">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="thunder-orange text-4xl font-extrabold">{pkg.price} €</span>
                    <span className="text-muted-foreground text-sm">{pkg.priceNote}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-7 flex-1">
                  {pkg.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {pkg.features.length > 5 && (
                    <li className="text-muted-foreground text-xs pl-6">+ {pkg.features.length - 5} {t.home.pricingMore2}</li>
                  )}
                </ul>
                <Link
                  href="/tarjouspyynto"
                  className={`w-full py-3 rounded-lg text-sm font-bold text-center block transition-all ${
                    pkg.highlight ? "thunder-btn-primary" : "thunder-btn-outline"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/hinnat" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors">
              {t.home.pricingMore} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

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
                initial="hidden"
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
