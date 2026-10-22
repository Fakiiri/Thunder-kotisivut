import { z } from "zod";

export const QUIZ_BOOKING_URL = "https://calendar.app.google/3fFXKiKe7dixDnQi8";

export const QUIZ_VERSION = "2026-10-21-v1";
export const MARKETING_PERMISSION =
  "Haluan lisäksi kaksi henkilökohtaiseen testitulokseeni liittyvää sähköpostia kirjan julkaisemisesta seuraavan viikon aikana. Voin peruuttaa ne milloin tahansa.";
export const questions = [
  {
    key: "genre",
    title: "Millainen kirja sinulla on työn alla?",
    choices: [
      ["fiction", "Romaani, runot tai muu kaunokirjallisuus"],
      ["memoir", "Elämäkerta tai sukukirja"],
      ["children", "Lastenkirja"],
      ["expert", "Tieto- tai asiantuntijakirja"],
      ["other", "Muu teos"],
    ],
  },
  {
    key: "readiness",
    title: "Missä vaiheessa käsikirjoituksesi on?",
    choices: [
      ["idea", "Minulla on idea tai muistiinpanoja"],
      ["draft", "Kirjoitan vielä ensimmäistä versiota"],
      ["revision", "Kokonainen teksti on valmis, mutta viimeistelen sitä"],
      ["ready", "Teksti on viimeistelty ja valmis tuotantoon"],
    ],
  },
  {
    key: "goal",
    title: "Mikä on kirjasi tärkein tavoite?",
    choices: [
      ["family", "Säilyttää tarina läheisille tai suvulle"],
      ["sales", "Saada lukijoita ja myydä kirjaa"],
      ["expert", "Tuoda osaamiseni esiin ja tukea työtäni"],
      ["personal", "Toteuttaa haaveeni omasta kirjasta"],
    ],
  },
  {
    key: "format",
    title: "Missä muodossa haluat lukijan kohtaavan kirjasi?",
    choices: [
      ["digital", "E-kirjana ja äänikirjana"],
      ["print", "Painettuna kirjana"],
      ["both", "Sekä painettuna että digitaalisesti"],
      ["unsure", "En vielä tiedä, auta valitsemaan"],
    ],
  },
  {
    key: "copies",
    title: "Kuinka monta painettua kirjaa arvelet tarvitsevasi?",
    choices: [
      ["none", "En tarvitse painettuja kirjoja"],
      ["small", "Noin 1–50 kappaletta"],
      ["many", "Noin 100 kappaletta tai enemmän"],
      ["unsure", "En vielä tiedä"],
    ],
  },
  {
    key: "launch",
    title: "Kuinka paljon apua toivot kirjan näkyvyyteen?",
    choices: [
      ["own", "Hoidan esittelyn ja markkinoinnin itse"],
      [
        "support",
        "Haluan julkaisuun myös materiaaleja ja markkinoinnin sparrausta",
      ],
      ["unsure", "Haluan ensin selvittää vaihtoehdot"],
    ],
  },
  {
    key: "timeline",
    title: "Milloin toivot kirjan valmistuvan?",
    choices: [
      ["urgent", "Alle kuukaudessa"],
      ["soon", "Noin 1–3 kuukaudessa"],
      ["later", "Myöhemmin, aikaa on yli 3 kuukautta"],
      ["unsure", "Minulla ei vielä ole tavoiteaikaa"],
    ],
  },
  {
    key: "audio",
    title: "Kiinnostaako sinua kirjasi julkaiseminen äänikirjana?",
    choices: [
      ["yes", "Kyllä"],
      ["no", "Ei tällä hetkellä"],
      ["unsure", "Haluan kuulla lisää"],
    ],
  },
] as const;
export const answersSchema = z.object({
  genre: z.enum(["fiction", "memoir", "family", "children", "expert", "other"]),
  readiness: z.enum(["idea", "draft", "revision", "ready"]),
  goal: z.enum(["family", "sales", "expert", "personal"]),
  format: z.enum(["digital", "print", "both", "unsure"]),
  copies: z.enum(["none", "small", "many", "unsure"]),
  launch: z.enum(["own", "support", "unsure"]),
  timeline: z.enum(["urgent", "soon", "later", "unsure"]),
  audio: z.enum(["yes", "no", "unsure"]),
});
export type QuizAnswers = z.infer<typeof answersSchema>;
export const profiles = {
  digi: {
    name: "Digitaalinen tarinankertoja",
    package: "Digi-paketti",
    price: 890,
    summary:
      "Haluat kirjasi lukijoiden ja kuuntelijoiden saataville ilman omaa painosvarastoa.",
    reason:
      "Digitaalinen julkaisu sopii tavoitteeseesi. Digi sisältää e-kirjan ja äänikirjan tuotannon sekä jakelun sovittuihin palveluihin.",
  },
  printti: {
    name: "Oman kirjan tekijä",
    package: "Printti-paketti",
    price: 1690,
    summary:
      "Haluat tarinasi kansien väliin, käteen annettavaksi ja luettavaksi.",
    reason:
      "Painettu kirja on sinulle tärkeä. Printti sisältää 50 painettua kirjaa sekä e-kirjan ja äänikirjan.",
  },
  premium: {
    name: "Julkaisua ja näkyvyyttä rakentava tekijä",
    package: "Premium-paketti",
    price: 2990,
    summary:
      "Haluat kirjan lisäksi tukea siihen, miten esittelet sen yleisöllesi.",
    reason:
      "Toivot julkaisuun myös näkyvyyden tukea. Premium sisältää 100 painettua kirjaa, digitaaliset formaatit ja markkinoinnin materiaaleja sekä sparrausta. Maksettu mainonta ei sisälly pakettiin.",
  },
} as const;
export type QuizProfile = keyof typeof profiles;
function personalDirection(a: QuizAnswers) {
  const publicAudience = a.goal === "sales" || a.goal === "expert";
  const genre = a.genre === "memoir" || a.genre === "family"
    ? "life" : a.genre === "children" ? "children" : a.genre === "expert" ? "expert" : "story";
  const directions = {
    story: [
      { name: "Oma tarina, omille lukijoille", summary: "Kirjasi voi olla henkilökohtainen saavutus tai lahja läheisille. Tärkeintä on saattaa teksti muotoon, jossa juuri sinun lukijasi pääsevät nauttimaan siitä. Laajaa myyntiä ei tarvitse tavoitella." },
      { name: "Tarinasi etsii lukijoitaan", summary: "Haluat tarinasi myös oman lähipiirisi ulkopuolelle. Seuraava askel on tunnistaa teoksesi lukijat ja suunnitella, miten kirja päätyy heidän saatavilleen." },
    ],
    life: [
      { name: "Muistot talteen läheisille", summary: "Kirjasi säilyttää elämänvaiheita ja suvun tarinoita niille, joille ne merkitsevät eniten. Rakenna kokonaisuus, jonka ääreen läheiset ja tulevat sukupolvet voivat palata." },
      { name: "Elämästäsi tarina muillekin", summary: "Tavoitteesi on tuoda elämästä tai suvusta kertova teos myös laajemman yleisön ulottuville. Mieti, mikä kokemuksissa puhuttelee lukijaa, joka ei vielä tunne tarinan ihmisiä." },
    ],
    children: [
      { name: "Oma kirja pienelle lukijalle", summary: "Lastenkirjasi voi antaa yhteisiä lukuhetkiä juuri sinulle tärkeille lapsille. Sovita kieli, tarinan pituus ja mahdolliset kuvat lukijan ikään, ja kokeile tarinaa ääneen ennen viimeistelyä." },
      { name: "Lasten tarina maailmalle", summary: "Haluat lastenkirjasi löytävän uusia lapsiperheitä ja lukijoita. Rajaa kohdeikä ja varmista tekstin sekä mahdollisen kuvituksen toimivuus yhdessä ennen julkaisun ja jakelun suunnittelua." },
    ],
    expert: [
      { name: "Tietosi talteen ja käyttöön", summary: "Kirjasi kokoaa tiedon selkeäksi kokonaisuudeksi itsellesi tai rajatulle lukijajoukolle. Valitse, mitä lukijan pitää ymmärtää tai osata kirjan luettuaan, ja rakenna sisältö sen ympärille." },
      { name: "Osaamisesi kirjaksi ja näkyviin", summary: "Haluat tiedollesi lukijoita tai tukea asiantuntijuudellesi. Keskity lukijan kysymyksiin: selkeä lupaus, luotettavat lähteet ja käytännön hyöty auttavat teosta erottumaan." },
    ],
  };
  return { direction: `${genre}-${publicAudience ? "public" : "personal"}`, ...directions[genre][publicAudience ? 1 : 0] };
}
export function quizResult(a: QuizAnswers) {
  // Readiness never increases a sale score. Genre/expertise alone never upsell Premium.
  const profile: QuizProfile =
    a.launch === "support"
      ? "premium"
      : a.format === "digital" && a.copies !== "small" && a.copies !== "many"
        ? "digi"
        : a.format === "print" ||
            a.format === "both" ||
            a.copies === "small" ||
            a.copies === "many" ||
            a.goal === "family"
          ? "printti"
          : "digi";
  const ready = a.readiness === "ready";
  const steps = [
    a.readiness === "idea" || a.readiness === "draft"
      ? "Kirjoita ensin teokselle rakenne ja kokonainen käsikirjoitus. Tuotantopakettia ei tarvitse ostaa vielä."
      : a.readiness === "revision"
        ? "Viimeistele teksti ja pyydä siitä koelukijan palaute. Oikoluku ja sisällön muokkaus eivät sisälly julkaisupakettiin."
        : "Tarkista lopullinen teksti, kuvien käyttöluvat ja lähdetiedot ennen tuotannon aloittamista.",
    a.goal === "family"
      ? "Arvioi, kenelle haluat antaa kirjan. Laske tarvittavat kappaleet ennen painosmäärän valintaa."
      : a.goal === "expert"
        ? "Nimeä kirjasi tärkein lukija ja yksi ongelma, jonka kirjasi auttaa häntä ratkaisemaan."
        : "Kirjoita yhdellä lauseella, kenelle kirja on ja miksi juuri hän haluaisi lukea sen.",
    a.timeline === "urgent"
      ? "Alle kuukauden valmistumista ei voi luvata. Selvitä toteutuskelpoinen aikataulu julkaisupuhelussa ennen tilausta."
      : "Varaa valmiin aineiston tuotantoon tavoitteen mukaan noin 4–8 viikkoa. Painotalon aikataulu ja toimitukset vaikuttavat kestoon.",
  ];
  return {
    profile,
    ready,
    ...profiles[profile],
    ...personalDirection(a),
    steps,
    caveat:
      "Suositus perustuu vastauksiisi, ei käsikirjoituksen lukemiseen tai myyntiennusteeseen. Pakettihinnat sisältävät ALV:n 25,5 % ja koskevat valmiita, alle 250-sivuisia käsikirjoituksia. Muut laajuudet arvioidaan erikseen.",
    notes: [
      a.copies === "many" && a.launch !== "support"
        ? "Yli 50 kappaleen painos kannattaa hinnoitella erikseen. Suurempi painos ei yksin edellytä Premium-pakettia."
        : "",
      a.audio === "no"
        ? "Paketteihin kuuluu äänikirja, mutta se ei ole sinulle välttämätön. Pyydä tarvittaessa erillinen tarjous haluamistasi formaateista."
        : "",
    ].filter(Boolean),
  };
}
export function answerSummary(a: QuizAnswers) {
  return questions
    .map(q => `${q.title} ${q.key === "genre" && a.genre === "family" ? "Suku- tai historiakirja" : q.choices.find(c => c[0] === a[q.key])?.[1]}`)
    .join("\n");
}
