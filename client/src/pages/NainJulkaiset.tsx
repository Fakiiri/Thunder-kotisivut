// Thunder Kustannus — Näin julkaisu etenee: hinnat auki, laskuesimerkit, aikajana, 9 kysymystä
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Gift, ShieldCheck, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QuizCTA from "@/components/QuizCTA";
import { useSEO } from "@/hooks/useSEO";
import { useLang } from "@/contexts/LanguageContext";
import { AI_PROMISE, EXAMPLES, INCLUDED, NINE_QUESTIONS, TIMELINE } from "@/lib/publishing-content";

export default function NainJulkaiset() {
  const { lang } = useLang();
  const l = lang === "en" ? "en" : "fi";
  useSEO({
    title: l === "en" ? "How publishing works" : "Näin kirjan julkaisu etenee: hinta, aikataulu ja oikeudet",
    description:
      "Mitä on ilmaista, mistä maksat ja mitä paketti ei sisällä. Laskuesimerkit, aikajana viikko viikolta ja 9 kysymystä ennen kuin allekirjoitat.",
    canonical: "/nain-julkaiset",
    keywords: "kirjan julkaisu hinta, omakustanne laskuesimerkki, kirjan julkaisu aikataulu, mitä omakustanne maksaa",
  });

  const columns = [
    { data: INCLUDED.free, Icon: Gift, tone: "text-green-700" },
    { data: INCLUDED.paid, Icon: CheckCircle2, tone: "thunder-orange" },
    { data: INCLUDED.notIncluded, Icon: XCircle, tone: "text-foreground/40" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28">
        <section className="container max-w-5xl pb-14">
          <span className="orange-line" />
          <h1 className="thunder-heading text-4xl md:text-5xl mb-4">
            {l === "en" ? "How publishing works" : "Näin julkaisu etenee"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {l === "en"
              ? "No small print. Here is what is free, what you pay for, and what happens week by week."
              : "Ei pientä präntättyä. Tässä on, mikä on ilmaista, mistä maksat ja mitä tapahtuu viikko viikolta."}
          </p>
          <p className="mt-6 inline-flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4 font-semibold max-w-2xl">
            <ShieldCheck className="w-5 h-5 thunder-orange mt-0.5 shrink-0" aria-hidden="true" /> {AI_PROMISE[l]}
          </p>
        </section>

        <section className="thunder-section-alt py-14">
          <div className="container max-w-6xl grid gap-6 md:grid-cols-3">
            {columns.map(({ data, Icon, tone }) => (
              <div key={data.title.fi} className="rounded-2xl border border-border bg-white p-6">
                <h2 className="font-bold text-lg mb-4">{data.title[l]}</h2>
                <ul className="space-y-3">
                  {data.items.map(i => (
                    <li key={i.fi} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone}`} aria-hidden="true" /> {i[l]}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="laskuesimerkit" className="container max-w-6xl py-16 scroll-mt-28">
          <h2 className="thunder-heading text-3xl md:text-4xl mb-3">{l === "en" ? "Three real examples" : "Kolme laskuesimerkkiä"}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            {l === "en"
              ? "One price, no extras. Prices include VAT 25.5% and apply to finished manuscripts under 250 pages."
              : "Yksi hinta, ei lisälaskuja. Hinnat sisältävät alv:n 25,5 % ja koskevat valmista, alle 250-sivuista käsikirjoitusta."}
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {EXAMPLES.map(e => (
              <div key={e.pkg} className="thunder-card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest thunder-orange mb-2">{e.pkg}</p>
                <h3 className="font-bold text-lg mb-1">{e.title[l]}</h3>
                <p className="text-3xl font-extrabold thunder-orange mb-3">{e.price}</p>
                <p className="text-sm text-foreground/75 leading-relaxed">{e.gets[l]}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-foreground/75 max-w-3xl">
            {l === "en"
              ? "The cheapest starting price is not the cheapest book. In self-service you pay less up front, then buy layout, cover and audiobook separately and put it all together yourself. With us you get the finished book in your hands and in Finnish shops."
              : "Halvin aloitushinta ei ole halvin kirja. Itsepalvelussa maksat alussa vähemmän, ostat taiton, kannen ja äänikirjan erikseen ja kokoat kaiken itse. Meillä saat valmiin kirjan käteen ja suomalaisiin kauppoihin."}
          </p>
        </section>

        <section id="aikajana" className="thunder-section-alt py-16 scroll-mt-28">
          <div className="container max-w-4xl">
            <h2 className="thunder-heading text-3xl md:text-4xl mb-3">{l === "en" ? "Week by week" : "Viikko viikolta"}</h2>
            <p className="text-muted-foreground mb-8">
              {l === "en"
                ? "Typical progress for a finished manuscript. We agree the exact schedule for each book."
                : "Tyypillinen eteneminen valmiilla käsikirjoituksella. Tarkka aikataulu sovitaan kirjakohtaisesti."}
            </p>
            <ol className="relative border-l-2 border-orange-300 ml-3 space-y-7">
              {TIMELINE.map(s => (
                <li key={s.when.fi} className="pl-6">
                  <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full thunder-orange-bg" aria-hidden="true" />
                  <p className="font-bold">{s.when[l]}</p>
                  <p className="text-foreground/75">{s.what[l]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="ennen-allekirjoitusta" className="container max-w-4xl py-16 scroll-mt-28">
          <h2 className="thunder-heading text-3xl md:text-4xl mb-3">
            {l === "en" ? "9 questions to ask before you sign" : "9 kysymystä ennen kuin allekirjoitat"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {l === "en"
              ? "Ask these from any publisher or service. If you don't get straight answers, be careful. Here are ours."
              : "Kysy nämä keneltä tahansa kustantajalta tai palvelulta. Jos et saa suoria vastauksia, ole varovainen. Tässä meidän vastauksemme."}
          </p>
          <dl className="divide-y divide-border rounded-xl border border-border bg-white">
            {NINE_QUESTIONS.map((x, n) => (
              <div key={x.q.fi} className="grid gap-1 p-5 md:grid-cols-[2fr_3fr] md:gap-6">
                <dt className="font-semibold">{n + 1}. {x.q[l]}</dt>
                <dd className="text-foreground/75">{x.a[l]}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="/#aaninayte" className="thunder-btn-primary inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold">
              {l === "en" ? "Get a free audio sample" : "Pyydä ilmainen ääninäyte"} <ArrowRight size={18} />
            </a>
            <Link href="/ukk" className="thunder-btn-outline inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold">
              {l === "en" ? "All questions" : "Kaikki kysymykset"} <ArrowRight size={18} />
            </Link>
          </div>
          <QuizCTA source="nain-julkaiset" />
        </section>
      </div>
      <Footer />
    </div>
  );
}
