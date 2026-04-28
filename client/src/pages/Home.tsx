// Thunder Kustannus — Etusivu
// Design: Bold black/orange, Syne headings, asymmetric editorial layout
import { Link } from "wouter";
import { ArrowRight, BookOpen, Headphones, Store, CheckCircle2, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PACKAGES, GUIDES, COMPANY } from "@/lib/data";
import { motion } from "framer-motion";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_hero-AGE9LdUsmSYMTtiyt2bza6.webp";
const AUDIOBOOK_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_audiobook-5KzGxqteP6emS5MsYQ9Skm.webp";
const BOOKS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663402214228/kjokCxRA3tYow9xSz5Mijk/thunder_books_stack-4eaNEqNXq3hg3xEhNouWJe.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={HERO_IMG} alt="Thunder Kustannus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        </div>

        <div className="container relative z-10 pt-28 pb-20">
          <div className="max-w-2xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest thunder-orange mb-6">
                <span className="w-8 h-px bg-orange-400 inline-block" />
                Suomen modernein kustantamo
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="thunder-heading text-5xl md:text-7xl text-white mb-6"
            >
              Sinun tarinasi
              <br />
              <span className="thunder-orange">ansaitsee</span>
              <br />
              tulla kuulluksi.
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="text-white/70 text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
            >
              Thunder Kustannus julkaisee kirjasi ammattimaisesti — painettu kirja, e-kirja ja äänikirja. Jakelu kaikkiin suomalaisiin kirjakauppoihin ja suoratoistopalveluihin.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-wrap gap-4"
            >
              <Link href="/tarjouspyynto" className="thunder-btn-primary px-8 py-4 rounded text-base font-bold inline-flex items-center gap-2">
                Pyydä ilmainen tarjous
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/hinnat" className="thunder-btn-outline px-8 py-4 rounded text-base font-bold inline-flex items-center gap-2">
                Katso hinnat
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex flex-wrap gap-6 mt-12"
            >
              {["Storytel", "BookBeat", "Spotify", "Suomalainen Kirjakauppa"].map((b) => (
                <span key={b} className="text-white/40 text-xs font-medium uppercase tracking-wider">
                  {b}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-orange-400/60 to-transparent" />
        </div>
      </section>

      {/* ── PALVELUT ── */}
      <section className="thunder-section thunder-section-light">
        <div className="container">
          <div className="text-center mb-16">
            <span className="orange-line mx-auto" />
            <h2 className="thunder-heading text-4xl md:text-5xl text-white mb-4">
              Kaikki yhdeltä kustantamolta
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Hoidamme kaiken käsikirjoituksesta valmiiseen kirjaan — ja siitä eteenpäin jakeluun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Painettu kirja",
                desc: "Ammattimainen taitto, kansisuunnittelu ja painatus. Jakelu Suomalaiseen Kirjakauppaan, Adlibrikseen ja kirjastoihin.",
                img: BOOKS_IMG,
              },
              {
                icon: Headphones,
                title: "Äänikirja",
                desc: "Ammattilukija, studioäänitys ja jakelu Storyteliin, BookBeatiin, Nextoryyn ja Spotifyhin.",
                img: AUDIOBOOK_IMG,
              },
              {
                icon: Store,
                title: "E-kirja",
                desc: "EPUB3-formaatti, jakelu kaikkiin digitaalisiin kanaviin ja suoratoistopalveluihin.",
                img: HERO_IMG,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-[oklch(0.11_0.005_240)] hover:border-orange-400/40 transition-all duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.11_0.005_240)] to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 rounded thunder-orange-bg flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-xl mb-2" style={{ fontFamily: "Syne, sans-serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HINNAT (preview) ── */}
      <section className="thunder-section">
        <div className="container">
          <div className="text-center mb-16">
            <span className="orange-line mx-auto" />
            <h2 className="thunder-heading text-4xl md:text-5xl text-white mb-4">
              Selkeä hinnoittelu
            </h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Ei piilokuluja. Ei yllätyksiä. Valitse paketti, joka sopii sinulle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PACKAGES.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`relative rounded-lg p-8 border transition-all duration-300 ${
                  pkg.highlight
                    ? "border-orange-400 bg-[oklch(0.13_0.006_240)] shadow-[0_0_40px_oklch(0.70_0.19_42/0.15)]"
                    : "border-white/10 bg-[oklch(0.11_0.005_240)] hover:border-white/20"
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="thunder-orange-bg text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                      Suosituin
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-white/50 text-xs uppercase tracking-widest mb-1">{pkg.tagline}</p>
                  <h3 className="text-white text-2xl font-bold mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="thunder-orange text-4xl font-extrabold" style={{ fontFamily: "Syne, sans-serif" }}>
                      {pkg.price} €
                    </span>
                    <span className="text-white/40 text-sm">{pkg.priceNote}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-8">
                  {pkg.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 thunder-orange mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {pkg.features.length > 5 && (
                    <li className="text-white/40 text-xs pl-6">+ {pkg.features.length - 5} muuta</li>
                  )}
                </ul>
                <Link
                  href="/tarjouspyynto"
                  className={`w-full py-3 rounded text-sm font-bold text-center block transition-all ${
                    pkg.highlight
                      ? "thunder-btn-primary"
                      : "thunder-btn-outline"
                  }`}
                >
                  {pkg.cta}
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/hinnat" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
              Katso kaikki paketin sisällöt <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── OPPAAT (preview) ── */}
      <section className="thunder-section thunder-section-light">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="orange-line" />
              <h2 className="thunder-heading text-4xl md:text-5xl text-white mb-2">
                Oppaat kirjailijoille
              </h2>
              <p className="text-white/60 text-lg">Kaikki mitä tarvitset kirjan julkaisemiseen.</p>
            </div>
            <Link href="/oppaat" className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-semibold text-sm transition-colors whitespace-nowrap">
              Kaikki oppaat <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES.slice(0, 3).map((guide, i) => (
              <motion.article
                key={guide.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <Link href={`/oppaat/${guide.slug}`} className="block group">
                  <div className="rounded-lg border border-white/10 bg-[oklch(0.11_0.005_240)] p-6 h-full hover:border-orange-400/30 transition-all duration-300">
                    <span className="text-xs font-semibold uppercase tracking-widest thunder-orange mb-3 block">
                      {guide.category}
                    </span>
                    <h3 className="text-white font-bold text-lg leading-snug mb-3 group-hover:text-orange-300 transition-colors" style={{ fontFamily: "Syne, sans-serif" }}>
                      {guide.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed mb-4">{guide.excerpt}</p>
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                      <span>{guide.readTime} lukuaika</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 thunder-orange-bg opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black" />
        <div className="container relative z-10 text-center">
          <h2 className="thunder-heading text-4xl md:text-6xl text-white mb-6">
            Valmis julkaisemaan?
          </h2>
          <p className="text-white/70 text-xl mb-10 max-w-lg mx-auto">
            Pyydä ilmainen tarjous — vastaamme 24 tunnin sisällä.
          </p>
          <Link href="/tarjouspyynto" className="thunder-btn-primary px-10 py-5 rounded text-lg font-bold inline-flex items-center gap-3">
            Pyydä tarjous nyt
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
