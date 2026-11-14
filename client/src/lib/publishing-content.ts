// Thunder Kustannus — julkaisun selkokieliset faktat (UKK, Näin julkaiset, julkaisuopas).
// Kaikki luvut ja ehdot perustuvat sivuston paketteihin, PACKAGE_TERMS-ehtoihin ja sopimusehtoihin.
// Älä lisää tänne lupauksia, joita Santeri ei ole vahvistanut.
import { PACKAGE_TERMS } from "./sales-content";

type L = { fi: string; en: string };
export type FaqEntry = { q: L; a: L };
export type FaqCategory = { id: string; title: L; items: FaqEntry[] };

export const AI_PROMISE: L = {
  fi: "Kirjasi tehdään tekoälyavusteisesti. Jokaisen kirjan tarkistaa ja editoi oikea ihminen.",
  en: "Your book is produced with the help of AI. Every book is checked and edited by a real person.",
};

export const FAQ: FaqCategory[] = [
  {
    id: "yleista",
    title: { fi: "Yleistä", en: "General" },
    items: [
      {
        q: { fi: "Onko Thunder kustantamo?", en: "Is Thunder a publisher?" },
        a: {
          fi: "Thunder Kustannus on suomalainen julkaisualusta. Maksat julkaisupaketista kerran, ja me hoidamme taiton, kannen, ISBN-tunnukset, äänikirjan, e-kirjan ja jakelun. Kirjan oikeudet pysyvät sinulla.",
          en: "Thunder Kustannus is a Finnish publishing platform. You pay once for a publishing package, and we handle layout, cover, ISBNs, audiobook, e-book and distribution. You keep the rights to your book.",
        },
      },
      {
        q: { fi: "Mikä ero on kustantamolla, omakustanteella ja Thunderilla?", en: "What is the difference between a traditional publisher, self-publishing and Thunder?" },
        a: {
          fi: "Perinteinen kustantamo valitsee kirjat, maksaa julkaisun ja saa oikeudet. Itse tehdyssä omakustanteessa teet ja kilpailutat kaiken itse. Thunderilla maksat yhden kiinteän hinnan, oikeudet pysyvät sinulla, ja ammattilaiset tekevät työn puolestasi.",
          en: "A traditional publisher selects books, pays for publication and takes the rights. In DIY self-publishing you do and source everything yourself. With Thunder you pay one fixed price, keep the rights, and professionals do the work for you.",
        },
      },
      {
        q: { fi: "Kenelle Thunder sopii, ja kenelle ei?", en: "Who is Thunder for, and who is it not for?" },
        a: {
          fi: "Thunder sopii, kun käsikirjoitus on valmis ja haluat kirjan kauppoihin, kirjastoihin ja äänikirjapalveluihin ilman, että opettelet taiton ja jakelun itse. Jos tavoittelet ensisijaisesti perinteisen kustantamon hyväksyntää, tai haluat tehdä kaiken itse mahdollisimman halvalla, Thunder ei ole sinulle paras valinta.",
          en: "Thunder suits you when your manuscript is finished and you want the book in shops, libraries and audiobook services without learning layout and distribution yourself. If you mainly want a traditional publisher's acceptance, or want to do everything yourself as cheaply as possible, Thunder is not your best choice.",
        },
      },
      {
        q: { fi: "Käytättekö tekoälyä?", en: "Do you use AI?" },
        a: {
          fi: AI_PROMISE.fi + " Tekoäly nopeuttaa tuotantoa, mutta ihminen hyväksyy lopputuloksen ennen julkaisua.",
          en: AI_PROMISE.en + " AI speeds up production, but a person approves the result before publication.",
        },
      },
    ],
  },
  {
    id: "oikeudet",
    title: { fi: "Oikeudet ja sopimus", en: "Rights and contract" },
    items: [
      {
        q: { fi: "Kuka omistaa kirjan oikeudet?", en: "Who owns the rights to the book?" },
        a: {
          fi: "Sinä. Kirjailija omistaa kaikki teoksen tekijänoikeudet. Thunder saa vain rajoitetun luvan julkaista ja jaella kirjaa sovituissa kanavissa sopimuksen ajan.",
          en: "You do. The author owns all copyright in the work. Thunder only receives a limited licence to publish and distribute the book in the agreed channels while the contract is in force.",
        },
      },
      {
        q: { fi: "Kauanko sopimus kestää ja miten sen voi lopettaa?", en: "How long does the contract last and how can I end it?" },
        a: {
          fi: "Sopimus on voimassa toistaiseksi. Kumpi tahansa voi irtisanoa sen kolmen kuukauden kirjallisella ilmoituksella. Kirja poistetaan jakelusta, ja kaikki oikeudet palautuvat sinulle.",
          en: "The contract is open-ended. Either party can end it with three months' written notice. The book is removed from distribution and all rights return to you.",
        },
      },
      {
        q: { fi: "Saanko julkaista salanimellä?", en: "Can I publish under a pen name?" },
        a: {
          fi: "Kyllä. Kerro salanimestä hinta-arviossa, niin käytämme sitä kannessa ja jakelussa.",
          en: "Yes. Mention the pen name in your estimate request and we use it on the cover and in distribution.",
        },
      },
      {
        q: { fi: "Mistä sisällöstä kirjailija vastaa?", en: "What content is the author responsible for?" },
        a: {
          fi: "Kirjailija vastaa siitä, ettei teos loukkaa kenenkään yksityisyyttä, mainetta tai tekijänoikeuksia. Lue tarkemmin sopimusehdoista.",
          en: "The author is responsible for ensuring the work does not infringe anyone's privacy, reputation or copyright. See the terms for details.",
        },
      },
    ],
  },
  {
    id: "kasikirjoitus",
    title: { fi: "Käsikirjoitus", en: "Manuscript" },
    items: [
      {
        q: { fi: "Missä muodossa lähetän käsikirjoituksen?", en: "In what format do I send the manuscript?" },
        a: {
          fi: "Word-tiedostona (.docx). Ilmaista ääninäytettä varten riittää yksi Word-sivu.",
          en: "As a Word file (.docx). For the free audio sample, a single Word page is enough.",
        },
      },
      {
        q: { fi: "Tarkistaako ja editoiko joku tekstini?", en: "Will someone check and edit my text?" },
        a: {
          fi: "Kyllä. Jokaisen kirjan tarkistaa ja editoi oikea ihminen ennen julkaisua. Pakettihinnat koskevat valmista käsikirjoitusta: laaja kustannustoimitus, kuten rakenteen tai sisällön uudelleenkirjoitus, ei sisälly pakettiin. Kysy siitä hinta-arviossa.",
          en: "Yes. Every book is checked and edited by a real person before publication. Package prices apply to a finished manuscript: extensive developmental editing, such as restructuring or rewriting content, is not included. Ask about it in your estimate request.",
        },
      },
      {
        q: { fi: "Entä jos kirjani on yli 250 sivua?", en: "What if my book is over 250 pages?" },
        a: {
          fi: "Pakettihinnat koskevat alle 250-sivuisia teoksia. Pidemmästä kirjasta saat hinta-arvion 24 tunnin sisällä.",
          en: "Package prices apply to books under 250 pages. For a longer book you get an estimate within 24 hours.",
        },
      },
      {
        q: { fi: "Voiko kirjassa olla valokuvia?", en: "Can the book include photos?" },
        a: {
          fi: "Kyllä. Skannaa kuvat vähintään 300 dpi:n tarkkuudella, niin taitossa niistä saadaan paras laatu. Kerro kuvien määrä hinta-arviossa.",
          en: "Yes. Scan photos at 300 dpi or more for the best print quality. Tell us the number of photos in your estimate request.",
        },
      },
    ],
  },
  {
    id: "tuotanto",
    title: { fi: "Tuotanto ja äänikirja", en: "Production and audiobook" },
    items: [
      {
        q: { fi: "Miltä kirjani kuulostaisi äänikirjana?", en: "What would my book sound like as an audiobook?" },
        a: {
          fi: "Lähetä yksi Word-sivu etusivun lomakkeella tai WhatsAppissa. Saat ilmaisen ääninäytteen yhden arkipäivän kuluessa.",
          en: "Send one Word page with the form on the home page or on WhatsApp. You get a free audio sample within one business day.",
        },
      },
      {
        q: { fi: "Tekoäly- vai studioääni?", en: "AI or studio narration?" },
        a: {
          fi: "Äänikirja tehdään tekoäly- tai studioäänityksenä. Sovimme vaihtoehdon kirjakohtaisesti, ja ihminen tarkistaa äänen ennen julkaisua.",
          en: "The audiobook is produced with AI or studio narration. We agree the option for each book, and a person checks the audio before publication.",
        },
      },
      {
        q: { fi: "Kuka tekee kannen ja taiton?", en: "Who makes the cover and layout?" },
        a: {
          fi: "Ammattimainen taitto ja kansisuunnittelu sisältyvät kaikkiin paketteihin. Voit myös kokeilla omaa kantta kansisuunnittelijassa.",
          en: "Professional layout and cover design are included in every package. You can also try your own cover in the cover designer.",
        },
      },
    ],
  },
  {
    id: "jakelu",
    title: { fi: "Jakelu", en: "Distribution" },
    items: [
      {
        q: { fi: "Mihin kauppoihin kirjani menee?", en: "Which shops will my book be in?" },
        a: {
          fi: "Digi: Storytel, BookBeat, Nextory, Spotify ja Suomen kirjastot. Printti ja Premium lisäksi: Suomalainen Kirjakauppa, Adlibris, Amazon, Kobo ja Google Play Books.",
          en: "Digi: Storytel, BookBeat, Nextory, Spotify and Finnish libraries. Printti and Premium also: Suomalainen Kirjakauppa, Adlibris, Amazon, Kobo and Google Play Books.",
        },
      },
      {
        q: { fi: "Saanko painettuja kirjoja itselleni?", en: "Do I get printed copies for myself?" },
        a: {
          fi: "Kyllä. Printissä saat 50 ja Premiumissa 100 painettua kirjaa. Lisää kappaleita voit tilata painolaskurin hinnalla.",
          en: "Yes. Printti includes 50 and Premium 100 printed copies. You can order more at the print calculator price.",
        },
      },
      {
        q: { fi: "Saako kirjan ISBN-tunnuksen?", en: "Does the book get an ISBN?" },
        a: {
          fi: "Kyllä. Hoidamme ISBN-tunnukset puolestasi kaikissa paketeissa.",
          en: "Yes. We handle the ISBNs for you in every package.",
        },
      },
    ],
  },
  {
    id: "raha",
    title: { fi: "Hinta ja tekijänpalkkio", en: "Price and royalties" },
    items: [
      {
        q: { fi: "Paljonko saan myydystä kirjasta?", en: "How much do I earn per sale?" },
        a: {
          fi: "Saat 60–70 % myyntituloista kanavan mukaan. Perinteisessä kustantamossa osuus on tyypillisesti 8–26 %.",
          en: "You receive 60–70% of sales revenue depending on the channel. With a traditional publisher the share is typically 8–26%.",
        },
      },
      {
        q: { fi: "Milloin tekijänpalkkio maksetaan?", en: "When are royalties paid?" },
        a: {
          fi: "Neljännesvuosittain: maaliskuussa, kesäkuussa, syyskuussa ja joulukuussa. Saat myyntiraportit kaikista jakelukanavista.",
          en: "Quarterly: in March, June, September and December. You receive sales reports from all distribution channels.",
        },
      },
      {
        q: { fi: "Voinko maksaa paketin osissa?", en: "Can I pay in instalments?" },
        a: {
          fi: "Kyllä. Voit maksaa kerralla tai osissa Klarnalla.",
          en: "Yes. You can pay at once or in instalments with Klarna.",
        },
      },
      {
        q: { fi: "Voinko muuttaa kirjan hintaa myöhemmin?", en: "Can I change the book's price later?" },
        a: {
          fi: "Kyllä. Päivitämme uuden hinnan kaikkiin jakelukanaviin.",
          en: "Yes. We update the new price in all distribution channels.",
        },
      },
      {
        q: { fi: "Kauanko julkaisu kestää?", en: "How long does publication take?" },
        a: { fi: PACKAGE_TERMS.fi, en: PACKAGE_TERMS.en },
      },
    ],
  },
];

export const INCLUDED = {
  free: {
    title: { fi: "Ilmaista, ennen kuin maksat mitään", en: "Free, before you pay anything" },
    items: [
      { fi: "Ääninäyte omasta tekstistäsi (1 Word-sivu)", en: "Audio sample of your own text (1 Word page)" },
      { fi: "Hinta-arvio 24 tunnin sisällä", en: "Price estimate within 24 hours" },
      { fi: "2 minuutin julkaisutesti", en: "2-minute publishing quiz" },
      { fi: "Julkaisuopas 2027 (PDF)", en: "Publishing guide 2027 (PDF)" },
      { fi: "Kansisuunnittelijan kokeilu", en: "Trying the cover designer" },
    ],
  },
  paid: {
    title: { fi: "Sisältyy pakettiin", en: "Included in the package" },
    items: [
      { fi: "Oikean ihmisen tekemä tarkistus ja editointi", en: "Checking and editing by a real person" },
      { fi: "Ammattimainen taitto ja kansisuunnittelu", en: "Professional layout and cover design" },
      { fi: "Äänikirja ja e-kirja (EPUB3)", en: "Audiobook and e-book (EPUB3)" },
      { fi: "ISBN-tunnukset", en: "ISBNs" },
      { fi: "Jakelu ja myyntiraportit", en: "Distribution and sales reports" },
      { fi: "Printissä 50 ja Premiumissa 100 painettua kirjaa", en: "50 printed copies in Printti, 100 in Premium" },
    ],
  },
  notIncluded: {
    title: { fi: "Ei sisälly pakettiin", en: "Not included" },
    items: [
      { fi: "Laaja kustannustoimitus (rakenteen tai sisällön uudelleenkirjoitus)", en: "Developmental editing (restructuring or rewriting content)" },
      { fi: "Yli 250-sivuiset teokset (hinta-arvio erikseen)", en: "Books over 250 pages (separate estimate)" },
      { fi: "Markkinointipaketti Digissä ja Printissä (sisältyy Premiumiin)", en: "Marketing package in Digi and Printti (included in Premium)" },
    ],
  },
};

export const EXAMPLES = [
  {
    title: { fi: "Muistelma, 180 sivua", en: "Memoir, 180 pages" },
    pkg: "Printti",
    price: "1 690 €",
    gets: {
      fi: "Painettu kirja, e-kirja ja äänikirja. 50 kirjaa käteen perheelle ja suvulle. Kirja Suomalaisessa Kirjakaupassa, Adlibriksessa, kirjastoissa ja äänikirjapalveluissa.",
      en: "Printed book, e-book and audiobook. 50 copies for family. In Suomalainen Kirjakauppa, Adlibris, libraries and audiobook services.",
    },
  },
  {
    title: { fi: "Romaani, 220 sivua, vain digitaalisena", en: "Novel, 220 pages, digital only" },
    pkg: "Digi",
    price: "890 €",
    gets: {
      fi: "E-kirja ja äänikirja Storyteliin, BookBeatiin, Nextoryyn, Spotifyhin ja kirjastoihin. Painetun kirjan voi lisätä myöhemmin.",
      en: "E-book and audiobook in Storytel, BookBeat, Nextory, Spotify and libraries. A printed edition can be added later.",
    },
  },
  {
    title: { fi: "Asiantuntijakirja, 160 sivua", en: "Expert book, 160 pages" },
    pkg: "Premium",
    price: "2 990 €",
    gets: {
      fi: "Kaikki Printin sisältö, 100 kirjaa asiakkaille ja tapahtumiin, markkinointimateriaalit, lehdistötiedote ja kirjan markkinoinnin verkkovalmennus.",
      en: "Everything in Printti, 100 copies for clients and events, marketing assets, a press release and the book marketing online course.",
    },
  },
];

export const TIMELINE = [
  { when: { fi: "Viikko 1", en: "Week 1" }, what: { fi: "Hinta-arvio, sopimus ja käsikirjoitus meille.", en: "Estimate, contract and manuscript to us." } },
  { when: { fi: "Viikot 2–3", en: "Weeks 2–3" }, what: { fi: "Taitto ja kansi. Näet ne ja hyväksyt ennen kuin jatketaan.", en: "Layout and cover. You see and approve them before we continue." } },
  { when: { fi: "Viikot 3–4", en: "Weeks 3–4" }, what: { fi: "Äänikirja ja e-kirja. Ihminen tarkistaa lopputuloksen.", en: "Audiobook and e-book. A person checks the result." } },
  { when: { fi: "Viikot 4–6", en: "Weeks 4–6" }, what: { fi: "Painatus (Printti ja Premium) ja jakelun avaus.", en: "Printing (Printti and Premium) and distribution set-up." } },
  { when: { fi: "Viikot 6–8", en: "Weeks 6–8" }, what: { fi: "Kirja kaupoissa, kirjastoissa ja äänikirjapalveluissa.", en: "Your book in shops, libraries and audiobook services." } },
];

export const NINE_QUESTIONS: FaqEntry[] = [
  { q: { fi: "Kuka omistaa kirjan oikeudet?", en: "Who owns the rights?" }, a: { fi: "Sinä. Aina.", en: "You. Always." } },
  { q: { fi: "Mitä maksan, ja mitä se sisältää?", en: "What do I pay and what does it include?" }, a: { fi: "Kiinteä pakettihinta: Digi 890 €, Printti 1 690 €, Premium 2 990 € (sis. alv). Sisältö on listattu hinnat-sivulla.", en: "A fixed package price: Digi 890 €, Printti 1,690 €, Premium 2,990 € (VAT incl.). Contents are listed on the pricing page." } },
  { q: { fi: "Mitä paketti ei sisällä?", en: "What is not included?" }, a: { fi: "Laaja kustannustoimitus (rakenteen tai sisällön uudelleenkirjoitus) sekä yli 250-sivuiset teokset ilman erillistä hinta-arviota. Ihmisen tekemä tarkistus ja editointi sisältyvät.", en: "Developmental editing (restructuring or rewriting content) and books over 250 pages without a separate estimate. Checking and editing by a real person are included." } },
  { q: { fi: "Pitääkö minun ostaa painos?", en: "Must I buy a print run?" }, a: { fi: "Ei. Painetut kirjat sisältyvät Printtiin (50) ja Premiumiin (100). Digissä painettua kirjaa ei ole.", en: "No. Printed copies are included in Printti (50) and Premium (100). Digi has no printed edition." } },
  { q: { fi: "Paljonko saan myydystä kirjasta?", en: "How much do I earn per sale?" }, a: { fi: "60–70 % myyntituloista kanavan mukaan.", en: "60–70% of sales revenue depending on the channel." } },
  { q: { fi: "Milloin palkkio maksetaan?", en: "When are royalties paid?" }, a: { fi: "Neljännesvuosittain, ja saat myyntiraportit.", en: "Quarterly, with sales reports." } },
  { q: { fi: "Onko vuosimaksuja?", en: "Are there annual fees?" }, a: { fi: "Pakettihinta maksetaan kerran. Printin painettujen kirjojen varastointi sisältyy ensimmäiseksi vuodeksi; kysy jatkosta hinta-arviossa.", en: "The package price is paid once. Storage of Printti copies is included for the first year; ask about later storage in your estimate." } },
  { q: { fi: "Miten pääsen sopimuksesta pois?", en: "How do I leave the contract?" }, a: { fi: "Kolmen kuukauden kirjallisella irtisanomisella. Oikeudet palautuvat sinulle.", en: "With three months' written notice. The rights return to you." } },
  { q: { fi: "Kuka vastaa, kun minulla on kysyttävää?", en: "Who answers when I have questions?" }, a: { fi: "Ihminen. Vastaamme 24 tunnin sisällä, myös WhatsAppissa.", en: "A person. We reply within 24 hours, also on WhatsApp." } },
];
