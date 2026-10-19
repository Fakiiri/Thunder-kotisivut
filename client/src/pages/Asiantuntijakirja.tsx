import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  Mic2,
  MessageCircle,
  TrendingUp,
  Check,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { KlarnaNote } from "@/components/PackagePurchase";
import PackageFeatures from "@/components/PackageFeatures";
import { useLang } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { books } from "@/lib/books";
import { PREMIUM_FEATURES, PACKAGE_TERMS } from "@/lib/sales-content";

export default function Asiantuntijakirja() {
  const { lang } = useLang();
  const en = lang === "en";
  const harri = books.find(book => book.author === "Harri Lauslahti")!;
  useSEO({
    title:
      "Asiantuntijakirja | Kirja yrittäjälle ja asiantuntijalle | Thunder Kustannus",
    description:
      "Tee osaamisestasi kirja. Premium 2 990 €: painettu kirja, e-kirja, äänikirja ja lanseerauksen tuki. Varaa maksuton kirjakartoitus Thunder Kustannukselta.",
    canonical: "/asiantuntijakirja",
  });
  const cta = en
    ? "Request a free book consultation"
    : "Varaa maksuton kirjakartoitus";
  const benefits = en
    ? [
        [
          "Make your expertise tangible",
          "Give a prospective client more than a business card. A book shows how you think and what you can help them achieve.",
        ],
        [
          "Open a conversation on stage",
          "Turn your expertise into a clear topic for talks, training sessions and podcast discussions.",
        ],
        [
          "Give the media an angle",
          "A book offers a timely reason to discuss your subject. We help present that angle to relevant media.",
        ],
        [
          "Explain the value of your work",
          "A book can help clients understand your approach before the first meeting and support the pricing of your expertise.",
        ],
      ]
    : [
        [
          "Tee osaamisesi näkyväksi",
          "Anna asiakkaallesi enemmän kuin käyntikortti. Kirja näyttää, miten ajattelet ja missä voit auttaa.",
        ],
        [
          "Avaa keskustelu puhujalavoille",
          "Jäsennä osaamisestasi aihe puheenvuoroihin, koulutuksiin ja podcast-keskusteluihin.",
        ],
        [
          "Tarjoa medialle tarttumapinta",
          "Kirja antaa ajankohtaisen syyn puhua aiheestasi. Autamme kertomaan siitä teokseen sopiville medioille.",
        ],
        [
          "Perustele asiantuntijatyösi arvo",
          "Kirja voi auttaa asiakasta ymmärtämään lähestymistapasi jo ennen ensimmäistä tapaamista ja tukea työsi hinnoittelua.",
        ],
      ];
  const steps = en
    ? [
        [
          "Consultation",
          "We discuss your manuscript, readers and goals. You receive an honest assessment of a suitable publishing route.",
        ],
        [
          "Ready for production",
          "You deliver a finished manuscript. We agree the production details and schedule. Proofreading and content editing are not included.",
        ],
        [
          "Production",
          "We handle typesetting, cover design, print production, e-book and audiobook production, and distribution.",
        ],
        [
          "Launch",
          "You receive launch assets, a press release and marketing sparring to support your own book sales.",
        ],
      ]
    : [
        [
          "Kartoitus",
          "Käymme läpi käsikirjoituksesi, lukijat ja tavoitteesi. Saat rehellisen arvion kirjallesi sopivasta julkaisutavasta.",
        ],
        [
          "Aineisto tuotantokuntoon",
          "Toimitat valmiin käsikirjoituksen. Sovimme tuotannon yksityiskohdat ja aikataulun. Oikoluku ja sisällön muokkaus eivät sisälly pakettiin.",
        ],
        [
          "Tuotanto",
          "Hoidamme taiton, kannen, painatuksen, e-kirjan, äänikirjatuotannon ja jakelun.",
        ],
        [
          "Lanseeraus",
          "Saat käyttöösi lanseerausmateriaalit, lehdistötiedotteen ja markkinoinnin sparrauksen oman kirjasi myynnin tueksi.",
        ],
      ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <section className="pt-36 pb-20 md:pt-44 md:pb-24 bg-[#191918] text-[#fff7e9] overflow-hidden">
          <div className="container grid lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-orange-400 text-xs font-bold tracking-[0.2em] uppercase mb-6">
                {en
                  ? "Your expertise. Your book. Your next step."
                  : "Sinun osaamisesi. Sinun kirjasi. Seuraava askeleesi."}
              </p>
              <h1 className="thunder-heading text-4xl sm:text-5xl lg:text-6xl mb-7 leading-[1.08]">
                {en ? (
                  <>
                    A book is an expert’s strongest{" "}
                    <span className="text-orange-400">business card.</span>
                  </>
                ) : (
                  <>
                    Kirja on asiantuntijan vahvin{" "}
                    <span className="text-orange-400">käyntikortti.</span>
                  </>
                )}
              </h1>
              <p className="text-xl leading-relaxed text-white/80 max-w-xl mb-4">
                {en
                  ? "We turn your expertise into a book that works for your business. In print, e-book and audio."
                  : "Me teemme osaamisestasi kirjan, joka myy puolestasi. Painettuna, e-kirjana ja äänikirjana."}
              </p>
              <p className="text-sm text-white/60 leading-relaxed max-w-lg mb-8">
                {en
                  ? "For consultants, trainers, leaders, therapists and entrepreneurs with a manuscript ready for the next step."
                  : "Konsulteille, kouluttajille, johtajille, terapeuteille ja yrittäjille, joiden käsikirjoitus on valmis seuraavaan vaiheeseen."}
              </p>
              <Link
                href="/tarjouspyynto"
                className="thunder-btn-primary rounded-lg px-6 py-4 inline-flex items-center gap-3 font-bold"
              >
                {cta}
                <ArrowRight size={18} />
              </Link>
              <p className="mt-4 text-sm text-white/60">
                {en
                  ? "Premium 2 990 € incl. VAT 25.5% · Klarna available at checkout"
                  : "Premium 2 990 € sis. ALV 25,5 % · Myös Klarna maksusivulla"}
              </p>
            </div>
            <div className="relative max-w-sm mx-auto w-full">
              <div
                className="absolute -inset-6 rounded-full bg-orange-500/10 blur-3xl"
                aria-hidden="true"
              />
              <img
                src={harri.image}
                alt={`${harri.title} — ${harri.author}`}
                width={harri.width}
                height={harri.height}
                className="relative w-full rounded-2xl shadow-2xl"
              />
              <div className="relative mt-5 border-t border-white/20 pt-4">
                <p className="text-xs uppercase tracking-widest text-orange-400 mb-1">
                  {en
                    ? "Published with Thunder Kustannus"
                    : "Thunder Kustannuksen julkaisu"}
                </p>
                <p className="font-semibold">Harri Lauslahti</p>
                <p className="text-sm text-white/65">
                  Leading in the Age of AI
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="thunder-section">
          <div className="container">
            <span className="orange-line" />
            <h2 className="thunder-heading text-3xl md:text-4xl mb-10">
              {en
                ? "What a book can do for your business"
                : "Mitä kirja tekee liiketoiminnallesi"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
              {benefits.map(([title, body], index) => {
                const Icon = [BookOpen, Mic2, MessageCircle, TrendingUp][index];
                return (
                  <article key={title} className="border-t border-border pt-6">
                    <Icon className="thunder-orange mb-5" size={28} />
                    <h3 className="text-xl font-bold mb-3">{title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="thunder-section thunder-section-alt" id="premium">
          <div className="container grid lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20 items-start">
            <div>
              <p className="text-xs tracking-widest uppercase font-bold thunder-orange mb-4">
                {en
                  ? "From a manuscript to a launch"
                  : "Käsikirjoituksesta lanseeraukseen"}
              </p>
              <h2 className="thunder-heading text-4xl mb-5">Premium</h2>
              <p className="text-lg text-muted-foreground mb-6">
                {en
                  ? "Your book needs readers as well as pages. Get professional production and a practical foundation for bringing it to their attention."
                  : "Kirjasi tarvitsee sivujen lisäksi lukijoita. Saat ammattimaisen tuotannon ja konkreettiset eväät siihen, että voit lähteä kertomaan kirjastasi."}
              </p>
              <p className="text-5xl font-extrabold thunder-orange">2 990 €</p>
              <p className="text-sm text-muted-foreground mt-2 mb-7">
                {en ? "incl. VAT 25.5%" : "sis. ALV 25,5 %"}
              </p>
              <Link
                href="/tarjouspyynto"
                className="thunder-btn-primary rounded-lg px-6 py-4 inline-flex items-center gap-2 font-bold"
              >
                {cta}
                <ArrowRight size={18} />
              </Link>
              <KlarnaNote />
            </div>
            <div className="rounded-2xl bg-white border border-border p-6 md:p-9">
              <h3 className="text-xl font-bold mb-6">
                {en
                  ? "One package. Production and a launch plan."
                  : "Yksi paketti. Tuotanto ja eväät lanseeraukseen."}
              </h3>
              <PackageFeatures features={PREMIUM_FEATURES[lang]} />
              <p className="text-sm text-muted-foreground leading-relaxed mt-6 border-t border-border pt-5">
                {en
                  ? "Printti includes the e-book, audiobook, typesetting, cover design and distribution. Premium includes 100 printed copies in total. Marketing assets and co-publishing are included; paid advertising or a media budget are not."
                  : "Printti sisältää e-kirjan, äänikirjan, taiton, kannen ja jakelun. Premiumissa saat yhteensä 100 painettua kirjaa. Markkinointimateriaalit ja rinnakkaisjulkaisut kuuluvat pakettiin; maksettu mainonta tai mediabudjetti eivät sisälly hintaan."}
              </p>
            </div>
          </div>
        </section>
        <section className="thunder-section">
          <div className="container">
            <span className="orange-line" />
            <h2 className="thunder-heading text-3xl md:text-4xl mb-10">
              {en
                ? "Four steps from manuscript to launch"
                : "Neljä askelta käsikirjoituksesta lanseeraukseen"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map(([title, body], index) => (
                <article key={title}>
                  <p className="text-5xl font-extrabold text-orange-200 mb-4">
                    0{index + 1}
                  </p>
                  <h3 className="font-bold text-xl mb-3">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {body}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-10 rounded-xl border border-border p-5 text-sm text-muted-foreground leading-relaxed">
              {PACKAGE_TERMS[lang]}
            </p>
          </div>
        </section>
        <section className="pb-20">
          <div className="container">
            <div className="rounded-2xl bg-[#191918] text-white px-7 py-12 md:p-14 grid md:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="thunder-heading text-3xl md:text-4xl mb-4">
                  {en
                    ? "What could your book make possible?"
                    : "Mitä sinun kirjasi voisi avata?"}
                </h2>
                <p className="text-white/70 max-w-2xl leading-relaxed mb-4">
                  {en
                    ? "Start with an honest discussion with a publishing professional: your manuscript, its readers, the market and potential income channels, including library compensation where applicable. An assessment is not a promise of sales or income."
                    : "Aloitetaan rehellisestä arviosta kirjallisuusalan ammattilaisen kanssa: käsikirjoituksesi, lukijasi, markkinatilanne ja mahdolliset tulonlähteet, myös kirjastokorvaukset soveltuvin osin. Arvio ei ole lupaus myynnistä tai tuloista."}
                </p>
                <p className="text-sm text-white/60 flex gap-2 items-center">
                  <Check size={16} />
                  {en
                    ? "Free consultation · No obligation to buy"
                    : "Maksuton kartoitus · Ei ostovelvoitetta"}
                </p>
              </div>
              <Link
                href="/tarjouspyynto"
                className="thunder-btn-primary inline-flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold"
              >
                {cta}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
