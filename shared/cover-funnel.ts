export const COVER_CONSENT_VERSION = "cover-news-2026-10-26-v1";
export const COVER_CONSENT_TEXT =
  "Haluan sähköpostitse neuvoja oman kirjan toteuttamiseen sekä Thunder Kustannuksen uutisia ja tarjouksia. Voin perua tilauksen milloin tahansa.";
export const COVER_BOOKING_URL =
  "https://calendar.app.google/3fFXKiKe7dixDnQi8";
export const COVER_WHATSAPP_URL =
  "https://wa.me/358403519546?text=" +
  encodeURIComponent(
    "Hei Santeri! Käytän Thunderin kansisuunnittelijaa. Käsikirjoitukseni on [valmis / työn alla / vasta idea]. Tarvitsisin apua [kannen / taiton / painatuksen / julkaisun] kanssa."
  );
const DAY = 86400000;
export const COVER_TOUCHES = [
  {
    id: "welcome",
    day: 0,
    subject: "Miten etenisit oman kirjasi kanssa?",
  },
  {
    id: "unfinished",
    day: 3,
    subject: "Tarvitsetko apua kannen tai kirjan viimeistelyyn?",
  },
  {
    id: "ready",
    day: 1,
    subject: "Kansi on suunniteltu – tehdään siitä kirja",
  },
  {
    id: "offer",
    day: 7,
    subject: "Haluatko arvion kirjasi toteutuksesta?",
  },
] as const;
export type CoverTouch = (typeof COVER_TOUCHES)[number];
export type CoverAudience = {
  verified: boolean;
  marketing: boolean;
  unsubscribed: boolean;
  blocked: boolean;
  purchased: boolean;
  inPersonalService: boolean;
  suppressionKnown: boolean;
  otherSequenceActive: boolean;
  enrolledAt: number;
  lastMarketingAt: number | null;
  delivered: string[];
  readyAt?: number | null;
};
export function nextCoverTouch(
  a: CoverAudience,
  now: number
): { touch: CoverTouch | null; reason: string } {
  if (!a.suppressionKnown)
    return { touch: null, reason: "Estotietojen tarkistus odottaa" };
  if (!a.verified || !a.marketing)
    return { touch: null, reason: "Ei vahvistettua markkinointilupaa" };
  if (a.unsubscribed || a.blocked || a.purchased || a.inPersonalService)
    return { touch: null, reason: "Sarja pysäytetty" };
  if (a.otherSequenceActive)
    return { touch: null, reason: "Toinen sarja on jo käynnissä" };
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(a.enrolledAt) ||
    a.enrolledAt > now ||
    (a.readyAt != null && (!Number.isFinite(a.readyAt) || a.readyAt > now))
  )
    return { touch: null, reason: "Aloitusaika ei ole kelvollinen" };
  if (
    a.lastMarketingAt !== null &&
    (!Number.isFinite(a.lastMarketingAt) || now - a.lastMarketingAt < DAY)
  )
    return { touch: null, reason: "Viestitahdin raja: vähintään 24 tuntia" };
  const plan =
    a.readyAt != null
      ? [
          { id: "welcome", at: a.enrolledAt },
          { id: "ready", at: a.readyAt + DAY },
          { id: "offer", at: a.readyAt + 7 * DAY },
        ]
      : [
          { id: "welcome", at: a.enrolledAt },
          { id: "unfinished", at: a.enrolledAt + 3 * DAY },
          { id: "offer", at: a.enrolledAt + 7 * DAY },
        ];
  const next = plan.find(t => !a.delivered.includes(t.id));
  if (!next) return { touch: null, reason: "Aloitussarja on valmis" };
  return now >= next.at
    ? {
        touch: COVER_TOUCHES.find(t => t.id === next.id)!,
        reason: "Viesti on vuorossa",
      }
    : { touch: null, reason: "Seuraavan viestin ajankohta odottaa" };
}
const drafts = {
  welcome: {
    day: 0,
    subject: "Miten etenisit oman kirjasi kanssa?",
    body: "Kerro Santerille WhatsAppissa, missä vaiheessa kirjasi on, niin autamme seuraavan askeleen kanssa.\n\nKansisuunnittelija auttaa tekemään kirjallesi etukannen, selän ja takakannen. Voit käyttää omaa kuvaasi ja jatkaa tallennettua projektiasi myöhemmin.\n\nJos jokin vaihe tuntuu hankalalta, emme jätä sinua yksin. Thunderin ammattilaiset auttavat kansisuunnittelussa, sisäsivujen taitossa, painatuksessa sekä kirjan julkaisemisessa kirjakauppoihin. Myös e- ja äänikirjan toteutus onnistuu.\n\nKirjoita meille lyhyesti: onko käsikirjoituksesi valmis, työn alla vai vasta idea, ja mihin kaipaat apua. Santeri ehdottaa tilanteeseesi sopivaa etenemistä. Viesti ei sido tilaukseen.",
    cta: "Kerro tilanteesi WhatsAppissa",
    destination: "whatsapp",
  },
  unfinished: {
    day: 3,
    subject: "Tarvitsetko apua kannen tai kirjan viimeistelyyn?",
    body: "Jäikö kansi kesken — voimme auttaa kannen suunnittelussa tai koko kirjasi toteutuksessa.\n\nOman kirjan ei tarvitse jäädä odottamaan sitä, että osaat itse kaiken. Voit jatkaa kansisuunnittelijassa rauhassa tai antaa ammattilaisemme hoitaa seuraavan vaiheen.\n\nAutamme kannen toteutuksessa, sisäsivujen taitossa ja painatuksen valmistelussa. Jos haluat kirjasi myös kirjakauppoihin tai e- ja äänikirjapalveluihin, katsomme sinulle sopivan julkaisupaketin.\n\nKerro WhatsAppissa, mihin olet jäänyt. Sovimme työn sisällön ja hinnan ennen aloittamista.",
    cta: "Pyydä apua Santerilta",
    destination: "whatsapp",
  },
  ready: {
    day: 1,
    subject: "Kansi on suunniteltu – tehdään siitä kirja",
    body: "Kansi on valmis — seuraavaksi autamme tekemään siitä oikean kirjan.\n\nOlet merkinnyt kansisuunnitelmasi valmiiksi. Seuraavaksi ratkaistaan, haluatko painetut kirjat omaan käyttöön, omaan myyntiin vai myös kirjakauppojen valikoimiin.\n\nPainatushinta näkyy kansisuunnittelijassa valitsemallesi koolle, paperille, sivumäärälle ja painokselle. Kotiintoimitus on 50 € ja sisältyy työkalun näyttämään kokonaishintaan. Yli 200 kappaleesta teemme erillisen tarjouksen.\n\nJos sisus kaipaa vielä taittoa, sen hinta on 217 € sisältäen alv:n. Kirjakauppajakelusta ja muista julkaisupalveluista sovitaan erikseen. Tarkistamme lopullisen aineiston ennen painoon lähettämistä.\n\nKerro WhatsAppissa, millaisen kirjan haluat ja kuinka monta kappaletta tarvitset.",
    cta: "Kysy kirjasi toteutuksesta",
    destination: "whatsapp",
  },
  offer: {
    day: 7,
    subject: "Haluatko arvion kirjasi toteutuksesta?",
    body: "Haluaisitko arvion kirjasi painatuksesta tai julkaisusta kirjakauppoihin?\n\nVoit tehdä kansisuunnittelijassa itse niin paljon kuin haluat. Kun haluat eteenpäin, autamme muuttamaan suunnitelman valmiiksi kirjaksi.\n\nMeiltä saat tarvittaessa kannen suunnittelun, sisäsivujen taiton, painatuksen sekä julkaisun ja jakelun. Katsomme kokonaisuuden käsikirjoituksesi ja tavoitteesi perusteella, jotta maksat tarvitsemastasi työstä.\n\nLähetä Santerille lyhyt WhatsApp-viesti: mitä olet kirjoittamassa, missä vaiheessa käsikirjoitus on ja haluatko kirjat omaan käyttöön vai myös myyntiin. Saat ehdotuksen seuraavasta askeleesta ilman ostopakkoa.\n\nTämä päättää kansisuunnittelijan aloitussarjan.",
    cta: "Kerro kirjaprojektistasi",
    destination: "whatsapp",
  },
} as const;
export function coverTouchDraft(id: CoverTouch["id"], _saved = false) {
  return drafts[id];
}
