// Thunder Kustannus — Server-side prerendering hakukonebotteja varten
// Kun Google/Bing crawlaa sivua, palautetaan HTML jossa on meta-tagit jo valmiina
// Tämä ratkaisee SPA-sivustojen SEO-ongelman

import { type Express } from "express";

const SITE_NAME = "Thunder Kustannus";
const BASE_URL = "https://thunderkustannus.fi";
const DEFAULT_DESC = "Thunder Kustannus auttaa sinua julkaisemaan oman kirjasi — painettu kirja, e-kirja ja äänikirja. Jakelu kirjakauppoihin, Storyteliin, BookBeatiin ja Spotifyhin.";

// Oppaiden meta-tiedot (synkronoitu data.ts:n kanssa)
const GUIDE_META: Record<string, { title: string; description: string; keywords: string }> = {
  "miten-julkaisen-oman-kirjan": {
    title: "Miten julkaisen oman kirjan? — Täydellinen opas 2026",
    description: "Haaveiletko oman kirjan julkaisemisesta mutta et tiedä mistä aloittaa? Täydellinen opas käsikirjoituksesta valmiiseen kirjaan — vaihe vaiheelta.",
    keywords: "kirjan julkaiseminen, omakustanne, miten julkaista kirja, kirjan kirjoittaminen, palvelukustantamo",
  },
  "omakustanne-vai-perinteinen-kustantamo": {
    title: "Omakustannekirja vai perinteinen kustantamo — kumpi sopii sinulle?",
    description: "Perinteinen kustantamo vai omakustantaminen? Vertailemme molemmat vaihtoehdot rehellisesti, jotta voit tehdä parhaan päätöksen kirjallesi.",
    keywords: "omakustanne, kustantamo, perinteinen kustantamo, kirjan julkaiseminen, self-publishing",
  },
  "aanikirjan-tekeminen": {
    title: "Äänikirjan tekeminen — näin muutat kirjasi äänikirjaksi",
    description: "Äänikirjojen suosio on räjähtänyt Suomessa. Miten kirjastasi tehdään äänikirja ja miten se jaellaan Storyteliin, BookBeatiin ja Spotifyhin?",
    keywords: "äänikirja, äänikirjan tekeminen, Storytel, BookBeat, Spotify äänikirja, äänikirjan tuotanto",
  },
  "kirjan-markkinointi": {
    title: "Kirjan markkinointi — 10 tapaa myydä omakustannekirjaasi",
    description: "Kirja on julkaistu — mitä seuraavaksi? 10 konkreettista tapaa markkinoida omakustannekirjaasi ja saada se lukijoiden käsiin.",
    keywords: "kirjan markkinointi, kirjan myynti, omakustanne markkinointi, kirjailija some, kirjan lanseeraus",
  },
  "isbn-tunnus": {
    title: "ISBN-tunnus — mitä se on ja miten se haetaan?",
    description: "ISBN-tunnus on kirjan kansainvälinen tunniste. Ilman sitä kirjaasi ei voi myydä kirjakaupoissa. Kaikki mitä sinun täytyy tietää.",
    keywords: "ISBN-tunnus, ISBN haku, kirjan tunniste, ISBN Suomi, kirjan rekisteröinti",
  },
  "kirjan-taitto-ja-kansisuunnittelu": {
    title: "Kirjan taitto ja kansisuunnittelu — mitä kannattaa tietää?",
    description: "Kirjan ulkoasu ratkaisee ensivaikutelman. Ammattimainen taitto ja kansisuunnittelu ovat investointi, joka maksaa itsensä takaisin myynnissä.",
    keywords: "kirjan taitto, kansisuunnittelu, kirjan ulkoasu, kirjan kansikuva, taitto hinta",
  },
  "kirjan-kustannukset": {
    title: "Kirjan julkaisemisen kustannukset — mitä omakustanne oikeasti maksaa?",
    description: "Paljonko kirjan julkaiseminen oikeasti maksaa? Vertailemme eri vaihtoehdot rehellisesti: itse tekeminen, palvelukustantamo ja perinteinen kustantamo.",
    keywords: "kirjan julkaiseminen hinta, omakustanne kustannukset, kirjan painaminen hinta, palvelukustantamo hinta",
  },
  "kirjailijan-tulot": {
    title: "Kirjailijan tulot — paljonko kirjailija tienaa omakustanteella?",
    description: "Paljonko omakustannekirjailija oikeasti tienaa? Vertailemme rojaltit, myyntimäärät ja realistiset tulot eri julkaisumalleissa.",
    keywords: "kirjailijan tulot, kirjailija palkka, rojalti, kirjan myyntitulot, omakustanne tulot",
  },
  "e-kirjan-julkaiseminen": {
    title: "E-kirjan julkaiseminen Suomessa — täydellinen opas 2026",
    description: "Miten julkaistaan e-kirja Suomessa? Koko prosessi EPUB-tiedostosta suoratoistopalvelujakeluun saakka.",
    keywords: "e-kirja, e-kirjan julkaiseminen, EPUB, e-kirja Suomi, digitaalinen kirja",
  },
  "kirjan-kirjoittaminen-aloittelijalle": {
    title: "Kirjan kirjoittaminen aloittelijalle — miten aloitan?",
    description: "Haaveiletko kirjan kirjoittamisesta mutta et tiedä mistä aloittaa? Käytännön opas kirjan kirjoittamiseen aloittelijalle — vaihe vaiheelta.",
    keywords: "kirjan kirjoittaminen, miten kirjoittaa kirja, kirjoittaminen aloittelijalle, kirjailija aloittelija",
  },
};

// Sivukohtaiset meta-tiedot
const PAGE_META: Record<string, { title: string; description: string; keywords: string }> = {
  "/": {
    title: "Thunder Kustannus — Julkaise kirjasi ammattilaisena",
    description: DEFAULT_DESC,
    keywords: "omakustanne, kirjan julkaiseminen, äänikirja, e-kirja, kustantamo, palvelukustantamo, kirjan kustannukset",
  },
  "/hinnat": {
    title: "Hinnat — Kirjan julkaisemisen paketit | Thunder Kustannus",
    description: "Thunder Kustannuksen julkaisupaketit: Digi 890 €, Printti 1 690 €, Premium 2 990 €. Kaikki sisältävät taiton, kansisuunnittelun, ISBN:n ja jakelun.",
    keywords: "kirjan julkaiseminen hinta, omakustanne hinta, palvelukustantamo hinta, kirjan painaminen hinta",
  },
  "/oppaat": {
    title: "Oppaat kirjailijoille — kirjan julkaiseminen, markkinointi ja enemmän",
    description: "Ilmaiset oppaat kirjailijoille: miten julkaistaan kirja, äänikirja, e-kirja — ja miten kirjaa markkinoidaan tehokkaasti.",
    keywords: "kirjan julkaiseminen opas, kirjailija opas, omakustanne opas, äänikirja opas",
  },
  "/meista": {
    title: "Meistä — Thunder Kustannus | Suomalainen palvelukustantamo",
    description: "Thunder Kustannus on suomalainen palvelukustantamo. Autamme kirjailijoita julkaisemaan kirjansa ammattimaisesti.",
    keywords: "Thunder Kustannus, palvelukustantamo Suomi, kustantamo Helsinki",
  },
  "/tarjouspyynto": {
    title: "Tilaa paketti — Kirjan julkaiseminen | Thunder Kustannus",
    description: "Pyydä ilmainen tarjous kirjasi julkaisemisesta. Vastaamme 24 tunnin sisällä.",
    keywords: "kirjan julkaiseminen tarjous, omakustanne tarjous, kustantamo tarjous",
  },
  "/lataa-opas": {
    title: "Lataa ilmainen opas — Kirjan julkaisemisen tarkistuslista",
    description: "Lataa ilmainen PDF-opas: Kirjan julkaisemisen 10 askeleen tarkistuslista. Kaikki mitä tarvitset kirjasi julkaisemiseen.",
    keywords: "kirjan julkaiseminen opas, ilmainen opas kirjailijalle, kirjan tarkistuslista",
  },
};

function isBot(userAgent: string): boolean {
  const bots = [
    "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
    "yandexbot", "sogou", "exabot", "facebot", "ia_archiver",
    "twitterbot", "linkedinbot", "whatsapp", "telegrambot",
    "applebot", "semrushbot", "ahrefsbot", "mj12bot",
  ];
  const ua = userAgent.toLowerCase();
  return bots.some(bot => ua.includes(bot));
}

function buildPrerenderedHTML(meta: { title: string; description: string; keywords: string }, canonicalPath: string): string {
  const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${fullTitle}</title>
  <meta name="description" content="${meta.description}" />
  <meta name="keywords" content="${meta.keywords}" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="${SITE_NAME}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta property="og:title" content="${fullTitle}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:locale" content="fi_FI" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${fullTitle}" />
  <meta name="twitter:description" content="${meta.description}" />
</head>
<body>
  <h1>${fullTitle}</h1>
  <p>${meta.description}</p>
  <p>Lataa sivu kokonaan nähdäksesi kaiken sisällön.</p>
</body>
</html>`;
}

export function registerPrerender(app: Express) {
  app.use((req, res, next) => {
    const ua = req.headers["user-agent"] || "";
    if (!isBot(ua)) return next();

    const path = req.path;

    // Artikkelisivu: /oppaat/:slug
    const guideMatch = path.match(/^\/oppaat\/([^/]+)$/);
    if (guideMatch) {
      const slug = guideMatch[1];
      const meta = GUIDE_META[slug];
      if (meta) {
        return res.status(200).set("Content-Type", "text/html").end(
          buildPrerenderedHTML(meta, path)
        );
      }
    }

    // Muut sivut
    const pageMeta = PAGE_META[path] || PAGE_META["/"];
    return res.status(200).set("Content-Type", "text/html").end(
      buildPrerenderedHTML(pageMeta, path)
    );
  });
}
