// ============================================================
// Thunder Kustannus — Sivuston data
// Muokkaa tätä tiedostoa päivittääksesi hinnat, paketit ja sisällön
// ============================================================

export const PACKAGES = [
  {
    id: "digi",
    name: "Digi",
    price: "890",
    priceNote: " sis. ALV 25,5 %",
    tagline: "Digitaalinen julkaisu",
    highlight: false,
    description: "Täydellinen digitaalinen julkaisupaketti kirjallesi — e-kirja, äänikirja ja jakelu kaikkiin suomalaisiin suoratoistopalveluihin.",
    features: [
      "Ammattimainen taitto",
      "Kansisuunnittelu",
      "E-kirja (EPUB3)",
      "Äänikirjatuotanto",
      "Jakelu: Storytel, BookBeat, Nextory",
      "Jakelu: Spotify äänikirjat",
      "Jakelu: Suomen kirjastot",
      "ISBN-tunnus",
      "Myyntiraportit",
    ],
    notIncluded: ["Painettu kirja", "Jakelu fyysisiin kirjakauppoihin", "Markkinointipaketti"],
    cta: "Pyydä hinta-arvio",
  },
  {
    id: "printti",
    name: "Printti",
    price: "1 690",
    priceNote: " sis. ALV 25,5 %",
    tagline: "Suosituin valinta",
    highlight: true,
    description: "Kaikki digitaaliset palvelut ja lisäksi painettu kirja. Kirjasi myyntiin kirjakauppoihin ympäri Suomen.",
    features: [
      "Kaikki Digi-paketin sisältö",
      "50 kpl painettuja kirjoja",
      "Jakelu: Suomalainen Kirjakauppa, Adlibris, Kirjastot, Storytel, BookBeat, Nextory, Spotify, Amazon, Kobo, Google Play Books",
      "Jakelusopimus edellä mainittuihin kirjakauppoihin",
      "1 vuoden varastointi",
    ],
    notIncluded: ["Markkinointipaketti", "Lehdistötiedote"],
    cta: "Pyydä hinta-arvio",
  },
  {
    id: "premium",
    name: "Premium",
    price: "2 990",
    priceNote: " sis. ALV 25,5 %",
    tagline: "Täyden palvelun paketti",
    highlight: false,
    description: "Täyden palvelun paketti kirjailijalle, joka haluaa maksimaalisen näkyvyyden ja ammattimaisen lanseerauksen.",
    features: [
      "Kaikki Printti-paketin sisältö",
      "100 kpl painettuja kirjoja",
      "Markkinointipaketti",
      "Lehdistötiedote (media)",
      "Sosiaalisen median lanseerauspaketti",
      "Kirjailijan mediakoulutus",
      "Prioriteettituki 12 kk",
    ],
    notIncluded: [],
    cta: "Pyydä hinta-arvio",
  },
];

export const GUIDES = [
  {
    id: "miten-julkaisen-oman-kirjan",
    title: "Miten julkaisen oman kirjan? Täydellinen opas 2026",
    slug: "miten-julkaisen-oman-kirjan",
    excerpt: "Haaveiletko oman kirjan julkaisemisesta mutta et tiedä mistä aloittaa? Tässä oppaassa käymme läpi koko prosessin käsikirjoituksesta valmiiseen kirjaan — vaihe vaiheelta.",
    category: "Aloittelijalle",
    readTime: "6 min",
    date: "2026-01-15",
    content: `
Oman kirjan julkaiseminen on helpompaa kuin koskaan ennen. Omakustantaminen on kasvanut räjähdysmäisesti viime vuosina, ja nykyään kirjailijalla on enemmän vaihtoehtoja ja välineitä kuin missään aiemmassa vaiheessa kirjallisuuden historiaa. Tässä oppaassa käymme läpi koko prosessin, käsikirjoituksesta valmiiseen, myyvään kirjaan.

## Mitä omakustantaminen tarkoittaa?

Omakustantaminen (self-publishing) tarkoittaa, että kirjailija itse vastaa kirjan saattamisesta jakeluun. Toisin kuin perinteisessä kustantamisessa, kirjailija säilyttää täyden kontrollin sisältöön, hintaan ja tekijänoikeuksiin. Tämä tarkoittaa myös, että suurempi osa myyntituloista jää kirjailijalle itselleen: tyypillisesti 60–70 % verrattuna perinteisen kustantamon 8–15 prosenttiin.

Thunder Kustannuksella kirjailija maksaa julkaisuprosessista, mutta saa halutessaan ammattilaisten avun taittoon, kansisuunnitteluun, ISBN-tunnukseen ja jakeluun ilman, että luovuttaa oikeuksiaan tai kontrolliaan.

## Vaihe 1: Käsikirjoituksen viimeistely

Ennen kuin aloitat julkaisuprosessin, käsikirjoituksen tulee olla mahdollisimman valmis. Tämä tarkoittaa:

**Sisällön tarkistus:** Onko rakenne looginen? Eteneekö tarina tai argumentaatio johdonmukaisesti? Onko kaikki oleellinen mukana ja turha karsittu?

**Oikoluku:** Kielioppivirheet, kirjoitusvirheet ja toistot heikentävät kirjan uskottavuutta. Suosittele käyttämään ammattimaista oikolukijaa tai vähintään luettamaan teksti useammalla henkilöllä.

**Ulkopuolinen palaute:** Kirjailija sokeutuu helposti omalle tekstilleen. Koelukijat, ystävät, kirjoitusryhmät tai ammattitoimittaja antavat arvokasta palautetta ennen julkaisua.

Älä kiirehdi tätä vaihetta. Huonosti viimeistelty käsikirjoitus on yleisimpiä syitä siihen, miksi omakustannekirja ei menesty.

## Vaihe 2: Kansi ja taitto

Kirjan kansi on tärkein markkinointivälineesi. Tutkimusten mukaan lukijat tekevät ostopäätöksen alle 3 sekunnissa kannen perusteella. Erityisesti verkkokaupassa, jossa kansi näkyy pienenä kuvakkeena. Ammattimainen kansisuunnittelu ei ole ylellisyys, vaan investointi.

Taitto tarkoittaa kirjan sisäsivujen visuaalista suunnittelua: fonttivalinnat, rivivälit, marginaalit, otsikoiden hierarkia ja kuvien sijoittelu. Huono taitto tekee kirjasta vaikealukuisen ja epäammattimaisen näköisen. Vaikka sisältö olisi kuinka hyvä tahansa.

E-kirjaa varten tarvitaan erillinen EPUB3-taitto, joka skaalautuu eri laitteille ja näyttökoille. Äänikirjaa varten tarvitaan neliön muotoinen (1:1) kansi, joka toimii pienessä koossa suoratoistopalveluissa.

## Vaihe 3: ISBN-tunnus

Jokainen kirja tarvitsee oman ISBN-tunnuksen (International Standard Book Number). Ilman ISBN:ää kirjaasi ei voi myydä kirjakaupoissa tai tilata kirjastoihin. Suomessa ISBN-tunnukset myöntää Kansalliskirjasto maksutta.

Muista: jokaisella julkaisumuodolla on oma ISBN:nsä. Painettu kirja, e-kirja ja äänikirja tarvitsevat kukin oman tunnuksensa. Kun käytät Thunder Kustannusta, ISBN haetaan kustantamon nimissä tämä tekee kirjastasi ammattimaisemman näköisen kirjakaupoissa.

## Vaihe 4: Jakelu, miten kirja päätyy lukijalle

Kirjasi pitää saada lukijoiden käsiin. Jakelu kattaa useita kanavia:

**Fyysiset kirjakaupat:** Suomalainen Kirjakauppa ja Adlibris ovat Suomen suurimmat. Storia (entinen Kirjavälitys) toimii välikätenä fyysisten kirjakauppojen ja kustantamoiden välillä.

**Verkkokaupat:** Amazon, Adlibris verkkokauppa, Suomalainen Kirjakauppa verkkokauppa.

**Kirjastot:** Kirjastot tilaavat kirjoja Storian kautta. Kirjastojakelu on tärkeää näkyvyyden kannalta.

**Digitaaliset suoratoistopalvelut:** Storytel, BookBeat, Nextory, Spotify, Kobo ja Google Play Books. Nämä palvelut maksavat tekijänoikeuskorvauksia kuunteltujen minuuttien perusteella.

## Vaihe 5: Markkinointi, kirja löytyy vain, jos se löydetään

Kirjan julkaiseminen on vasta alku. Markkinointi ratkaisee, kuinka moni lukija löytää kirjasi. Tärkeimmät markkinointikanavat omakustannekirjailijalle ovat sosiaalinen media (erityisesti Instagram ja LinkedIn asiantuntijakirjoille), sähköpostilista, lehdistötiedotteet paikallismedialle ja podcast-vierailut.

Aloita markkinointi jo ennen julkaisua. Jaa kirjoitusprosessia, kerro miksi kirjoitat tätä kirjaa ja rakenna odotusta. Julkaisupäivän jälkeen ensimmäiset viikot ovat kriittisimpiä. Myyntipiikki alussa parantaa kirjan sijoitusta verkkokauppojen listoilla.

## Thunder Kustannus auttaa kaikissa vaiheissa

Thunder Kustannus hoitaa puolestasi taiton, kansisuunnittelun, ISBN-tunnuksen, jakelun kaikkiin kanaviin ja äänikirjatuotannon. Sinulle jää se tärkein: kirjoittaminen ja oman tarinasi kertominen.

[Pyydä hinta-arvio](/tarjouspyynto) ja kerro meille kirjastasi. Vastaamme 24 tunnin sisällä.
    `,
  },
  {
    id: "omakustanne-vai-perinteinen-kustantamo",
    title: "Omakustannekirja vai perinteinen kustantamo: Kumpi sopii sinulle?",
    slug: "omakustanne-vai-perinteinen-kustantamo",
    excerpt: "Perinteinen kustantamo vai omakustantaminen? Vertailemme molemmat vaihtoehdot rehellisesti, jotta voit tehdä parhaan päätöksen kirjallesi.",
    category: "Strategia",
    readTime: "5 min",
    date: "2026-02-01",
    content: `
Kirjailijan yksi tärkeimmistä päätöksistä on valita, miten kirja julkaistaan. Perinteinen kustantamo vai omakustantaminen? Tässä rehellinen, faktoihin perustuva vertailu ilman kaunistelua.

## Perinteinen kustantamo, miten se toimii?

Perinteisessä kustantamismallissa kirjailija lähettää käsikirjoituksen kustantamolle. Jos kustantamo kiinnostuu, se ostaa oikeuden julkaista kirjan ja maksaa kirjailijalle ennakkopalkkion sekä myöhemmin rojalteja myynneistä.

Kuulostaa hyvältä. Mutta todellisuus on monimutkaisempi.

**Hyväksymisprosentti on n. 2 %.** Suuret suomalaiset kustantamot, kuten WSOY, Otava ja Tammi, saavat tuhansia käsikirjoituksia vuosittain. Vain murto-osa päätyy julkaistavaksi. Useimmiten kustantamot suosivat tunnettuja nimiä tai aiheita, joille on jo valmiiksi laaja yleisö.

**Prosessi kestää 1–3 vuotta.** Käsikirjoituksen lähettämisestä kirjan julkaisemiseen voi kulua useita vuosia. Jos se ylipäätään hyväksytään. Tänä aikana kirjailija ei voi julkaista kirjaa muualla.

**Kirjailija saa 8–26 % myyntituloista.** Perinteinen rojaltimalli tarkoittaa, että kustantamo pitää suurimman osan tuloista. Ennakkopalkkio vähennetään rojalteista, joten kirjailija alkaa saada lisätuloja vasta kun ennakko on "ansaittu takaisin" myynneillä.

**Kustantamo omistaa oikeudet.** Sopimuksen myötä kustantamo saa laajat oikeudet kirjaan usein kymmeniksi vuosiksi. Tämä voi rajoittaa kirjailijan mahdollisuuksia myöhemmin.

## Omakustantamon kautta julkaiseminen

Thunder Kustannus tarjoaa parhaan yhdistelmän: kirjailija säilyttää kontrollin ja oikeudet, mutta saa ammattilaisten avun julkaisuprosessiin.

**Julkaisu 4–8 viikossa.** Kun käsikirjoitus on valmis, prosessi etenee nopeasti. Ei odottelua, ei hylkäyskirjeitä.

**Kirjailija saa 60–70 % myyntituloista.** Hybridikustantamon mallissa kirjailija maksaa julkaisuprosessista kerran ja saa sen jälkeen suurimman osan myyntituloista itselleen.

**Täysi kontrolli sisältöön ja hintaan.** Sinä päätät, mitä kirjassasi sanotaan, miltä se näyttää ja mihin hintaan sitä myydään. Kustantamo ei voi vaatia muutoksia sisältöön.

**Oikeudet pysyvät kirjailijalla.** Tekijänoikeudet ovat aina sinun. Voit myöhemmin myydä käännösoikeudet, tehdä uuden painoksen tai julkaista kirjan muussa muodossa.

## Kenelle perinteinen kustantamo sopii?

Perinteinen kustantamo sopii parhaiten, jos tavoittelet kirjallisuuspalkintoja tai akateemista arvostusta, sinulla on jo laaja yleisö tai mediaprofiili, tai kirjasi aihe on laajalle yleisölle suunnattu viihde tai kaunokirjallisuus.

## Kenelle omakustantaminen sopii?

Omakustantaminen sopii erityisesti asiantuntijoille, yrittäjille ja ammattilaisille, jotka haluavat käyttää kirjaa osana omaa brändiään tai liiketoimintaansa. Se sopii myös kirjailijoille, joilla on jo valmis yleisö (esimerkiksi sosiaalisen median kautta), ja kaikille, jotka haluavat julkaista nopeasti ilman vuosien odottelua.

Asiantuntijakirja on yksi tehokkaimmista markkinointivälineistä. Se rakentaa uskottavuutta, avaa ovia puhujakeikoille ja konsultointiin, ja toimii käyntikorttina, joka ei vanhene.

## Vertailutaulukko

| Kriteeri | Perinteinen kustantamo | Hybridikustantamo |
|---|---|---|
| Hyväksymisprosentti | n. 2 % | 100 % |
| Aika julkaisuun | 1–3 vuotta | 4–8 viikkoa |
| Kirjailijan rojaltit | 8–26 % | 60–70 % |
| Oikeudet | Kustantamolla | Kirjailijalla |
| Kontrolli sisältöön | Rajattu | Täysi |
| Kustannus kirjailijalle | 0 € (ennakko) | Palvelupaketti |

## Yhteenveto

Perinteinen kustantamo on oikea valinta harvoille. Omakustantaminen hybridikustantamon avulla on oikea valinta suurimmalle osalle kirjailijoista. Erityisesti asiantuntijoille ja yrittäjille, jotka haluavat kirjan osaksi omaa brändiään.

[Katso Thunder Kustannuksen paketit](/hinnat) ja Pyydä hinta-arvio.
    `,
  },
  {
    id: "aanikirjan-tekeminen",
    title: "Äänikirjan tekeminen: Näin muutat kirjasi äänikirjaksi",
    slug: "aanikirjan-tekeminen",
    excerpt: "Äänikirjojen suosio on räjähtänyt Suomessa. Tässä oppaassa kerromme, miten kirjastasi tehdään äänikirja ja miten se jaellaan Storyteliin, BookBeatiin ja Spotifyhin.",
    category: "Äänikirjat",
    readTime: "5 min",
    date: "2026-02-15",
    content: `
Äänikirjat ovat Suomen nopeimmin kasvava kirjaformaatti. Storytel, BookBeat ja Spotify ovat tuoneet äänikirjat kaikkien saataville ja samalla avanneet kirjailijoille uuden tulonlähteen. Jos sinulla on jo kirja tai käsikirjoitus, äänikirja on luonnollinen seuraava askel.

## Miksi tehdä äänikirja?

Äänikirjamarkkina kasvaa Suomessa noin 20–30 % vuodessa. Spotify avasi äänikirjat Suomessa marraskuussa 2025, ja palvelulla on jo yli 300 000 äänikirjan valikoima. Tämä tarkoittaa, että äänikirjan potentiaalinen yleisö on kasvanut dramaattisesti.

Äänikirja tavoittaa uuden yleisön: ihmiset, jotka kuuntelevat kirjoja työmatkalla, lenkkeillessä tai kotitöitä tehdessä. Monet kuuntelijat eivät lue painettuja kirjoja lainkaan. Äänikirja on heidän ainoa tapansa kuluttaa kirjallisuutta.

Lisäksi äänikirja tuo lisätuloja samasta sisällöstä. Suoratoistopalvelut maksavat tekijänoikeuskorvauksia kuunteltujen minuuttien perusteella. Mitä enemmän kuuntelijoita, sitä enemmän tuloja.

## Äänikirjan tuotantoprosessi vaihe vaiheelta

### Vaihe 1: Käsikirjoituksen valmistelu

Äänikirjaa varten käsikirjoitus muokataan kuuntelukokemukseen sopivaksi. Tämä tarkoittaa:

- Luvut merkitään selkeästi kuuntelijan orientoimiseksi
- Visuaaliset elementit (taulukot, kuvat, kaaviot) muutetaan sanallisiksi kuvauksiksi
- Pitkät lauseet ja monimutkaiset rakenteet yksinkertaistetaan kuuntelua varten
- Lyhenteet ja erikoismerkit kirjoitetaan auki

### Vaihe 2: Lukijan valinta

Ammattilukija on äänikirjan tärkein elementti. Hyvä lukija tuo kirjan eloon, pitää kuuntelijan otteessaan ja välittää kirjailijan äänen uskottavasti. Lukijan valinnassa kannattaa ottaa huomioon:

- Kirjan genre ja sävy (asiantuntijakirja vs. romaani)
- Lukijan ääni ja tyyli
- Kokemus vastaavista projekteista

Jotkut kirjailijat lukevat kirjansa itse. Tämä sopii erityisesti asiantuntijakirjoihin, joissa kirjailijan oma ääni ja auktoriteetti ovat tärkeitä.

### Vaihe 3: Äänitys ammattistudiossa

Äänitys tapahtuu ammattistudiossa, jossa on hiljainen ympäristö, laadukas mikrofoni ja äänitekniikan ammattilainen. Tyypillinen äänikirja (200–300 sivua) vie 8–15 tuntia äänitysaikaa.

### Vaihe 4: Editointi ja masterointi

Editoinnissa poistetaan virheet, tauot ja häiriöäänet. Äänentaso tasataan koko teoksen läpi, ja lopputulos masteroidaan vastaamaan suoratoistopalveluiden teknisiä vaatimuksia (tyypillisesti -16 LUFS).

### Vaihe 5: Jakelu suoratoistopalveluihin

Valmis äänikirja jaellaan aggregaattorin kautta kaikkiin palveluihin yhdellä kertaa:

- **Storytel** — Suomen suurin äänikirjapalvelu, saatavilla myös e-kirjoja
- **BookBeat** — kasvava kilpailija, erityisesti nuoret aikuiset
- **Nextory** — pohjoismainen palvelu
- **Spotify** — 600 miljoonaa käyttäjää maailmanlaajuisesti
- **Suomen kirjastot** — Celia-kirjasto ja yleisten kirjastojen kokoelmat

## Äänikirjan kustannukset ja tulot

Äänikirjan tuotantokustannukset vaihtelevat kirjan pituuden ja tuotantotavan mukaan. Ammattilukijan ja studion kustannukset ovat tyypillisesti 500–2 000 € kirjan pituudesta riippuen. Tekoälyn lukemana kustannukset vähenevät dramaattisesti.

Tulot kertyvät kuunteltujen minuuttien perusteella. Tyypillinen korvaus on 0,003–0,008 € per kuunneltu minuutti palvelusta riippuen. Suosittu äänikirja voi tuoda satoja tai tuhansia euroja kuukaudessa.

## Thunder Kustannus hoitaa äänikirjan puolestasi

Thunder Kustannus hoitaa koko äänikirjaprosessin puolestasi: käsikirjoituksen valmistelun, lukijan valinnan, äänityksen, editoinnin ja jakelun kaikkiin palveluihin. Sinulle jää se tärkein: kirjasi sisältö.

[Pyydä hinta-arvio äänikirjatuotannosta](/tarjouspyynto) Kerro meille kirjastasi ja saat arvion 24 tunnin sisällä.
    `,
  },
  {
    id: "kirjan-markkinointi",
    title: "Kirjan markkinointi: 10 tapaa myydä omakustannekirjaasi",
    slug: "kirjan-markkinointi",
    excerpt: "Kirja on julkaistu — mitä seuraavaksi? Tässä 10 konkreettista tapaa markkinoida omakustannekirjaasi ja saada se lukijoiden käsiin.",
    category: "Markkinointi",
    readTime: "6 min",
    date: "2026-03-01",
    content: `
Kirjan julkaiseminen on vasta puoliväli. Markkinointi ratkaisee, kuinka moni lukija löytää kirjasi ja kuinka paljon myyt. Tässä 10 konkreettista tapaa markkinoida omakustannekirjaasi tehokkaasti.

## 1. Sosiaalinen media: Rakenna yleisö ennen julkaisua

Instagram, Facebook ja LinkedIn ovat tehokkaita kanavia kirjan markkinointiin. Avain menestykseen on aloittaa markkinointi jo ennen julkaisua. Ideaalisesti 3–6 kuukautta etukäteen.

Jaa kirjoitusprosessia: kuvia kirjoituspöydältä, behind-the-scenes -sisältöä ja lainauksia käsikirjoituksesta. Kerro miksi kirjoitat tätä kirjaa ja kenelle se on tarkoitettu. Rakenna odotusta julkaisupäivää kohti.

LinkedIn on erityisen tehokas asiantuntijakirjoille. Asiantuntijasisältö leviää LinkedInissä orgaanisesti, ja kirja toimii uskottavuuden rakentajana.

## 2. Sähköpostilista: Sitoutuneimmat lukijasi

Sähköpostilista on kirjailijan arvokkain markkinointityökalu. Sähköpostilistalla olevat ihmiset ovat valinneet saada viestejä sinulta. He ovat sitoutuneimpia lukijoitasi.

Rakenna lista jo ennen julkaisua. Tarjoa jotain arvokasta vastineeksi sähköpostiosoitteesta: ensimmäinen luku ilmaiseksi, tiivistelmä kirjan tärkeimmistä opeista tai eksklusiivista sisältöä.

Julkaisupäivänä lähetä tieto julkaisusta listalla olijoille ensimmäisenä. Ensimmäiset myyntipiikkipäivät ovat kriittisiä verkkokauppojen algoritmien kannalta.

## 3. Lehdistötiedote: Ilmaista medianäkyvyyttä

Lehdistötiedote on ilmainen tapa saada medianäkyvyyttä. Lähetä tiedote:
- Paikallisille sanomalehdille (erityisesti jos kirja liittyy paikalliseen aiheeseen)
- Alan julkaisuille ja verkkolehdille
- Kirja-arvostelusivustoille
- Bloggaajille, jotka kirjoittavat kirjasi aiheesta

Hyvä lehdistötiedote kertoo tarinan: miksi tämä kirja, miksi nyt, miksi juuri sinä olet oikea henkilö kirjoittamaan sen.

## 4. Kirjaesittelyt ja tapahtumat

Kirjamessut (Helsinki Book Fair, Turku kirjamessut), kirjastotapahtumat ja yritysten tilaisuudet ovat erinomaisia paikkoja esitellä kirjaasi. Henkilökohtainen kohtaaminen on tehokkain myyntitapa.

Tarjoudu puhujaksi konferensseihin ja seminaareihin kirjasi aiheesta. Puhujaesiintyminen rakentaa uskottavuutta ja johtaa usein kirjamyyntiin.

## 5. Podcast-vierailut: Tavoita sitoutunut yleisö

Podcastit tavoittavat erittäin sitoutuneen yleisön. Podcast-kuuntelijat ovat aktiivisia tiedonhakijoita, jotka ovat valmiita ostamaan kirjoja.

Etsi podcasteja, jotka käsittelevät kirjasi aihetta. Tarjoudu vieraaksi ja valmistele mielenkiintoinen tarina kerrottavaksi. Mainitse kirja luontevasti, mutta älä tee jaksosta myyntipuhetta.

## 6. Blogiyhteistyö ja kirja-arvostelut

Kirja-arvostelut blogeissa ja verkkolehdissä lisäävät näkyvyyttä ja uskottavuutta. Lähetä arvostelukappale (tai e-kirja) aktiivisille kirjabloggaajille ja pyydä rehellistä arviota.

Hyvä arvostelu on arvokkaampi kuin maksettu mainos. Lukijat luottavat vertaisarvosteluihin.

## 7. Amazon ja verkkokauppojen optimointi

Verkkokaupan tuotesivun optimointi on yksi tehokkaimmista ja edullisimmista markkinointitavoista. Kiinnitä huomiota:

- **Kirjan kuvaus:** Kirjoita myyvä, kiinnostava kuvaus, joka kertoo lukijalle mitä hän hyötyy kirjasta
- **Avainsanat:** Valitse oikeat avainsanat, joilla potentiaaliset lukijat etsivät kirjasi aiheesta
- **Kategoria:** Valitse oikea kategoria, jossa kirjasi voi nousta listojen kärkeen
- **Arvostelut:** Pyydä ensimmäisiä lukijoita jättämään arvostelu

## 8. Yritysasiakkaat: Kirja henkilöstölahjaksi

Jos kirjasi sopii yrityksille, tarjoa sitä henkilöstölahjaksi tai koulutusmateriaaleiksi. Yritykset ostavat kirjoja kymmenissä tai sadoissa kappaleissa. Yksi tällainen iso kauppa voi vastata kuukausien yksittäismyyntiä.

Asiantuntijakirja sopii erityisesti yritysmyyntiin. Tarjoa räätälöityä versiota yrityksen logolla tai omistuskirjoituksella.

## 9. Kirjakerho ja lukupiiri

Tarjoudu kirjakerhon tai lukupiirin vieraaksi, joko paikan päällä tai etänä. Kirjakerhot ovat aktiivisia kirjojen ostajia, ja henkilökohtainen kohtaaminen kirjailijan kanssa tekee kirjasta erityisen.

Monet kirjastot järjestävät kirjakerhoja. Ota yhteyttä paikalliseen kirjastoon.

## 10. Jatkuva sisällöntuotanto

Kirjoita artikkeleita, pidä blogia tai tee videoita kirjasi aiheesta. Sisältömarkkinointi rakentaa pitkäaikaista näkyvyyttä hakukoneissa ja sosiaalisessa mediassa.

Hyvä sisältö houkuttelee lukijoita, jotka etsivät tietoa kirjasi aiheesta ja ohjaa heidät kirjasi pariin luonnollisesti.

## Yhteenveto: Markkinointi on jatkuvaa työtä

Kirjan markkinointi ei lopu julkaisupäivään. Menestyneet kirjailijat markkinoivat kirjaansa jatkuvasti, kuukausia ja vuosia vielä julkaisun jälkeenkin. Pitkäjänteisyys palkitaan.

Thunder Kustannuksen Premium-paketti sisältää markkinointipaketin, lehdistötiedotteen ja sosiaalisen median lanseerauspaketin. [Katso paketit](/hinnat) tai [Pyydä hinta-arvio](/tarjouspyynto).
    `,
  },
  {
    id: "isbn-tunnus",
    title: "ISBN-tunnus: Mikä se on ja miten se haetaan?",
    slug: "isbn-tunnus",
    excerpt: "ISBN-tunnus on kirjan kansainvälinen tunniste. Ilman sitä kirjaasi ei voi myydä kirjakaupoissa. Tässä kaikki mitä sinun täytyy tietää.",
    category: "Käytännön asiat",
    readTime: "3 min",
    date: "2026-03-15",
    content: `
ISBN (International Standard Book Number) on kirjan kansainvälinen tunnistenumero. Se on pakollinen, jos haluat myydä kirjaasi kirjakaupoissa, tilata kirjastoihin tai saada kirjasi mukaan kansainvälisiin tietokantoihin. Tässä oppaassa kerromme kaiken, mitä sinun täytyy tietää ISBN-tunnuksesta.

## Mikä ISBN-tunnus on?

ISBN on 13-numeroinen tunniste, joka yksilöi jokaisen kirjan julkaisumuodon. Tunnus koostuu viidestä osasta:
- Etuliite (978 tai 979)
- Maatunnus (Suomessa 951 tai 952)
- Kustantajatunnus
- Nimiketunnus
- Tarkistusnumero

Esimerkki: ISBN 978-952-12345-0-1

## Miksi ISBN tarvitaan?

ISBN on kirjakauppojen ja kirjastojen perustyökalu. Ilman ISBN:ää:
- Kirjakaupat eivät voi tilata kirjaasi
- Kirjastot eivät voi luetteloida kirjaasi
- Kirjasi ei näy kansainvälisissä kirjatietokannoissa
- Verkkokaupat (Amazon, Adlibris) eivät voi listata kirjaasi

## Yksi kirja, useita ISBN-tunnuksia

Tärkeä asia, jonka monet unohtavat: jokaisella julkaisumuodolla on oma ISBN:nsä. Sama kirja tarvitsee erilliset tunnukset:

| Julkaisumuoto | ISBN tarvitaan? |
|---|---|
| Painettu kirja (pehmeäkantinen) | Kyllä |
| Painettu kirja (kovakantinen) | Kyllä, oma tunnus |
| E-kirja (EPUB) | Kyllä |
| Äänikirja | Kyllä |
| PDF-versio | Suositeltavaa |

## Kuka myöntää ISBN:n Suomessa?

Suomessa ISBN-tunnuksia myöntää **Kansalliskirjasto**. Haku tapahtuu Kansalliskirjaston ISBN-palvelussa verkossa. Haku on maksuton.

Hakemuksessa tarvitaan:
- Kirjan nimi
- Tekijän nimi
- Julkaisuvuosi
- Julkaisumuoto
- Kustantajan tiedot

## Kustantajan nimissä vai omissa nimissä?

Tässä on tärkeä ero, jota monet eivät tiedä:

**Oma ISBN (omissa nimissä):** Voit hakea ISBN:n omissa nimissäsi. Tällöin sinusta tulee virallisesti kustantaja. Tämä on mahdollista, mutta vaatii enemmän byrokratiaa ja kirjasi saattaa näyttää "kotikutoisemmalta" kirjakaupoissa.

**Kustantamon ISBN:** Kun käytät Thunder Kustannusta, ISBN haetaan kustantamon nimissä. Tämä tekee kirjastasi ammattimaisemman näköisen. Kirjakaupat näkevät kustantamona Thunder Kustannuksen eikä yksityishenkilö.

## Thunder Kustannus hoitaa ISBN:n puolestasi

Kaikki Thunder Kustannuksen paketit sisältävät ISBN-tunnuksen hakemisen. Me hoidamme byrokratian, rekisteröinnin ja varmistamme, että kirjasi tiedot ovat oikein kansainvälisissä tietokannoissa.

Sinun ei tarvitse huolehtia teknisistä yksityiskohdista. Me hoidamme ne, jotta voit keskittyä kirjoittamiseen.

[Katso paketit ja hinnat](/hinnat) tai [Pyydä hinta-arvio](/tarjouspyynto).
    `,
  },
  {
    id: "kirjan-taitto-ja-kansisuunnittelu",
    title: "Kirjan taitto ja kansisuunnittelu: Mitä kannattaa tietää?",
    slug: "kirjan-taitto-ja-kansisuunnittelu",
    excerpt: "Kirjan ulkoasu ratkaisee ensivaikutelman. Ammattimainen taitto ja kansisuunnittelu ovat investointi, joka maksaa itsensä takaisin myynnissä.",
    category: "Tuotanto",
    readTime: "4 min",
    date: "2026-04-01",
    content: `
Kirjan ulkoasu on ensimmäinen asia, jonka lukija näkee. Tutkimusten mukaan ostopäätös tehdään alle 3 sekunnissa kannen perusteella, erityisesti verkkokaupassa, jossa kirja näkyy pienessä kuvakkeessa muiden kirjojen joukossa. Ammattimainen taitto ja kansisuunnittelu eivät ole ylellisyys, vaan välttämättömyys.

## Mitä taitto tarkoittaa?

Taitto (layout) tarkoittaa kirjan sisäsivujen visuaalista suunnittelua. Se kattaa:

**Typografia:** Fonttivalinnat vaikuttavat suuresti luettavuuteen. Hyvä kirjafontti on selkeä, miellyttävä lukea pitkissä teksteissä ja sopii kirjan genreen. Otsikkofontti voi olla persoonallisempi.

**Riviväli ja marginaalit:** Liian tiivis taitto väsyttää silmät. Liian väljä taitto näyttää epäammattimaiselta. Oikea tasapaino on tärkeää.

**Otsikoiden hierarkia:** Pää- ja alaotsikoiden visuaalinen hierarkia auttaa lukijaa navigoimaan tekstissä.

**Kuvien sijoittelu:** Jos kirjassa on kuvia, kaavioita tai taulukoita, niiden sijoittelu ja koko vaikuttavat sekä ulkoasuun että luettavuuteen.

Huono taitto tekee kirjasta vaikealukuisen ja epäammattimaisen näköisen, vaikka sisältö olisi kuinka hyvä tahansa. Lukijat huomaavat huonon taiton, vaikka he eivät osaisi nimetä mikä on pielessä.

## Kansisuunnittelu: Kirjasi tärkein markkinointiväline

Kansi myy kirjan. Hyvässä kannessa on:

**Selkeä, luettava otsikko:** Otsikon täytyy olla luettavissa pienessäkin koossa, verkkokaupan kuvakkeessa tai puhelimen näytöllä.

**Ammattimainen kuva tai grafiikka:** Kuvan laatu ja tyyli kertovat kirjan laadusta. Ilmaiskuvapankit näyttävät usein amatöörimäisiltä. Ammattimainen kuvitus tai valokuva tekee eron.

**Kirjailijan nimi sopivassa koossa:** Tuntemattomalle kirjailijalle nimi on pienemmässä koossa kuin otsikko. Tunnetulle kirjailijalle nimi voi olla suurempi kuin otsikko.

**Genreen sopiva tyyli:** Kannen täytyy viestiä oikealle lukijakunnalle. Jännitysromaanin kansi näyttää erilaiselta kuin liiketalouskirjan kansi.

## E-kirjan erityisvaatimukset

E-kirja (EPUB3) vaatii erityisen taiton, joka skaalautuu eri laitteille ja näyttökoille. Reflowable-formaatti tarkoittaa, että teksti mukautuu lukijan fonttikoon mukaan. Taitto ei voi olla yhtä tarkka kuin painetussa kirjassa.

E-kirjan taitto vaatii:
- EPUB3-standardin mukainen rakenne
- Toimivat sisällysluettelot ja navigaatio
- Kuvien optimointi eri näyttökoille
- Testaus useilla laitteilla (Kindle, iPad, Android)

## Äänikirjan kansi

Äänikirjalla on oma kansi, joka näkyy suoratoistopalveluissa (Storytel, Spotify, BookBeat). Se on neliön muotoinen (1:1) ja sen täytyy toimia pienessä koossa, jopa 50 × 50 pikseliä. Tämä tarkoittaa, että äänikirjan kansi on usein yksinkertaisempi ja selkeämpi kuin painetun kirjan kansi.

## Painetun kirjan erityispiirteet

Painettu kirja vaatii takakannen ja selkämyksen suunnittelun lisäksi etukannen. Selkämykseen mahtuu otsikko ja kirjailijan nimi. Tämä on tärkeää, koska kirjahyllyssä kirja näkyy useimmiten selkämys edellä.

Painolaatu vaihtelee: pehmeäkantinen (paperback) on edullisempi, kovakantinen (hardcover) arvokkaamman näköinen. Paperin laatu, kiiltävyys ja painomenetelmä vaikuttavat lopputulokseen.

## Ammattilainen vai itse?

Canva ja muut suunnittelutyökalut houkuttelevat tekemään kannen itse. Tulos näyttää usein amatöörimäiseltä — erityisesti verrattuna ammattilaisen tekemään kanteen. Kansisuunnitteluun käytetty raha on yksi parhaista investoinneista, joita kirjailija voi tehdä.

## Thunder Kustannus hoitaa kaiken

Kaikki Thunder Kustannuksen paketit sisältävät ammattimaisen taiton ja kansisuunnittelun. Yhteistyössä sinun kanssasi luomme kirjallesi ulkoasun, joka erottuu joukosta ja houkuttelee oikean lukijakunnan.

[Pyydä hinta-arvio](/tarjouspyynto) ja kerro meille kirjastasi — vastaamme 24 tunnin sisällä.
    `,
  },
  {
    id: "kirjan-kustannukset",
    title: "Kirjan julkaisemisen kustannukset: Mitä omakustanne oikeasti maksaa?",
    slug: "kirjan-kustannukset",
    excerpt: "Paljonko kirjan julkaiseminen oikeasti maksaa? Vertailemme eri vaihtoehdot rehellisesti: itse tekeminen, hybridikustantamo ja perinteinen kustantamo.",
    category: "Käytännön asiat",
    readTime: "5 min",
    date: "2026-04-10",
    content: `
Yksi yleisimmistä kysymyksistä, joita kirjailijat esittävät, on: "Paljonko kirjan julkaiseminen maksaa?" Vastaus riippuu siitä, mitä valitset ja mitä jätät tekemättä. Tässä rehellinen katsaus kustannuksiin.

## Vaihtoehto 1: Kaikki itse

Teknisesti kirjan voi julkaista lähes ilmaiseksi: kirjoita Word-tiedostoon, lataa Amazon KDP:hen, valmis. Mutta todellisuus on monimutkaisempi.

**Taitto:** Voit opetella taiton itse käyttämällä Affinity Publisher- tai InDesign-ohjelmaa. Oppimiskäyrä on jyrkkä, laadukkaan taiton oppiminen vie kuukausia.

**Kansisuunnittelu:** Canvalla voi tehdä kannen, mutta ammattimainen lopputulos vaatii graafisen suunnittelun osaamista.

**ISBN:** Maksuton Kansalliskirjastosta, mutta vaatii rekisteröitymisen kustantajaksi.

**Jakelu:** Amazon KDP on ilmainen, mutta kattaa vain Amazonin. Laajempi jakelu (Suomalainen Kirjakauppa, Storytel jne.) vaatii aggregaattorin, joka maksaa tyypillisesti 10–15 % myyntituloista tai kiinteän vuosimaksun.

**Todelliset kustannukset itse tekemiseen:**
- Aika: 100–300 tuntia opetteluun ja tekemiseen
- Ohjelmistot: 50–200 €/vuosi
- Mahdolliset virheet: vaikea arvioida

## Vaihtoehto 2: Ostetaan palvelut erikseen

Toinen vaihtoehto on ostaa palvelut erikseen ammattilaisilta.

| Palvelu | Hinta-arvio |
|---|---|
| Ammattimainen taitto (200 sivua) | 500–1 500 € |
| Kansisuunnittelu | 300–800 € |
| Oikoluku | 200–600 € |
| ISBN-rekisteröinti | 0 € (Kansalliskirjasto) |
| Äänikirjatuotanto | 500–2 000 € |
| Jakelusopimukset | 200–500 € + provisiot |
| **Yhteensä** | **1 700–5 400 €** |

Lisäksi jokainen palveluntarjoaja on eri toimija. Koordinointi vie aikaa ja energiaa.

## Vaihtoehto 3: Omakustantamo

Omakustantamot, tai julkaisualustat, kuten tykkäämme Thunder Kustannuksella sanoa, tarjoaa kaikki palvelut yhtenä pakettina. Tämä tarkoittaa:
- Yksi sopimus, yksi yhteyshenkilö
- Kaikki palvelut koordinoitu yhteen prosessiin
- Selkeä kokonaishinta ilman yllätyksiä

Thunder Kustannuksen paketit alkavat 890 eurosta (Digi-paketti,  sis. ALV 25,5 %).

## Mitä kannattaa ottaa huomioon?

**Laatu maksaa.** Halvimmat vaihtoehdot tuottavat usein heikoimman lopputuloksen. Kirja, joka näyttää amatöörimäiseltä tai ei myy, riippumatta siitä, kuinka hyvä sisältö on.

**Aika on rahaa.** Jos käytät 200 tuntia opetteluun ja tekemiseen, se on 200 tuntia pois kirjoittamisesta, markkinoinnista tai muusta liiketoiminnasta.

**Jakelu ratkaisee.** Kirja, jota ei löydy kirjakaupoista tai suoratoistopalveluista, ei myy. Laaja jakelu on kriittinen osa julkaisuprosessia.

**ROI-näkökulma:** Asiantuntijakirja on markkinointiväline, joka voi tuoda kymmeniä tai satoja tuhansia euroja konsultointi-, puhujapalkkio- tai koulutustuloina. Tässä kontekstissa 1 000–3 000 euron julkaisukustannus on pieni investointi.

## Yhteenveto

Kirjan julkaiseminen maksaa 0–5 000 euroa riippuen valituista palveluista ja laadusta. Thunder Kustannus tarjoaa selkeimmän ja usein kustannustehokkaimman tavan julkaista kirja ammattimaisesti.

[Katso Thunder Kustannuksen paketit ja hinnat](/hinnat) tai [Pyydä hinta-arvio](/tarjouspyynto).
    `,
  },
  {
    id: "kirjailijan-tulot",
    title: "Kirjailijan tulot: Paljonko kirjailija tienaa omakustanteella?",
    slug: "kirjailijan-tulot",
    excerpt: "Paljonko omakustannekirjailija oikeasti tienaa? Vertailemme rojaltit, myyntimäärät ja realistiset tulot eri julkaisumalleissa.",
    category: "Strategia",
    readTime: "11 min",
    date: "2026-04-20",
    content: `
Yksi tärkeimmistä kysymyksistä kirjailijalle on: "Paljonko voin tienata kirjallani?" Vastaus riippuu julkaisumallista, hinnoittelusta, myyntimääristä ja markkinoinnista. Tässä rehellinen katsaus kirjailijan tuloihin.

## Rojaltit eri julkaisumalleissa

Julkaisumalli vaikuttaa suoraan siihen, kuinka suuren osan myyntituloista kirjailija saa.

| Julkaisumalli | Kirjailijan osuus |
|---|---|
| Perinteinen kustantamo | 8–15 % |
| Hybridikustantamo (painettu) | 50–70 % |
| Hybridikustantamo (e-kirja) | 60–70 % |
| Amazon KDP (e-kirja, hinta 2,99–9,99 €) | 70 % |
| Suoratoistopalvelut (äänikirja) | 25–40 % |

## Esimerkkilaskelma: 500 kappaleen myynti

Oletetaan, että kirjasi myy 500 kappaletta painettuna (hinta 25 €) ja 200 kappaletta e-kirjana (hinta 12 €).

**Perinteinen kustantamo (12 % rojaltit):**
- Painettu: 500 × 25 € × 12 % = 1 500 €
- E-kirja: 200 × 12 € × 12 % = 288 €
- Yhteensä: 1 788 €

**Hybridikustantamo (60 % painettu, 75 % e-kirja):**
- Painettu: 500 × 25 € × 60 % = 7 500 €
- E-kirja: 200 × 12 € × 75 % = 1 800 €
- Yhteensä: 9 300 €

Ero on merkittävä: 9 300 € vs. 1 788 €.

## Äänikirjan tulot

Suoratoistopalvelut maksavat tekijänoikeuskorvauksia kuunteltujen minuuttien perusteella. Tyypillinen korvaus on 0,003–0,008 € per kuunneltu minuutti.

Esimerkki: 6 tunnin äänikirja (360 minuuttia), 1 000 kuuntelijaa kuuntelee koko kirjan:
- 1 000 × 360 min × 0,005 €/min = 1 800 €

Suosittu äänikirja voi tuoda satoja tai tuhansia euroja kuukaudessa pitkään julkaisun jälkeen.

## Realistiset myyntimäärät

Ollaan rehellisiä: useimmat omakustannekirjat myyvät 50–500 kappaletta. Menestyneet kirjat myyvät tuhansia. Bestseller-kirjat myyvät kymmeniä tuhansia.

Myyntimääriin vaikuttavat:
- Markkinointi ja näkyvyys
- Kirjan aihe ja kohdeyleisö
- Kirjailijan olemassa oleva yleisö
- Kirjan laatu (sisältö ja ulkoasu)
- Hinnoittelu

## Kirja osana liiketoimintaa — epäsuorat tulot

Monille kirjailijoille, erityisesti asiantuntijoille ja yrittäjille, kirjan suorat myyntitulot ovat vain osa kokonaisuudesta. Kirja tuo epäsuoria tuloja:

**Puhujapalkkiot:** Kirjailija, jolla on kirja, saa helpommin puhujakutsuja ja korkeampia palkkioita. Ammattipuhujat saavat tyypillisesti 1 500–3 000 € per esiintyminen — kirja tuo auktoriteettia, joka mahdollistaa korkeamman hinnoittelun.

**Konsultointi ja valmennus:** Kirja rakentaa asiantuntijastatusta, joka mahdollistaa korkeammat konsultointihinnat.

**Koulutukset ja kurssit:** Kirja toimii markkinointimateriaalina koulutuksille ja verkkokursseille.

**Medianäkyvyys:** Kirjailija saa enemmän mediakutsuja, jotka rakentavat brändiä ja tuovat epäsuoria tuloja.

Asiantuntijakirja voi tuoda kymmeniä tai satoja tuhansia euroja epäsuoria tuloja — vaikka kirjan suorat myyntitulot olisivat vaatimattomat.

## Miten maksimoida kirjailijan tulot?

**1. Julkaise kaikissa formaateissa.** Painettu kirja, e-kirja ja äänikirja tavoittavat eri lukijakunnat ja tuovat tuloja eri kanavista.

**2. Hinnoittele oikein.** Liian halpa kirja viestii heikosta laadusta. Asiantuntijakirjat voivat olla kalliimpia kuin viihdekirjat.

**3. Markkinoi aktiivisesti.** Kirja ei myy itsestään. Aktiivinen markkinointi on edellytys myynnille.

**4. Rakenna yleisö ennen julkaisua.** Sähköpostilista ja sosiaalisen median seuraajakunta ovat kirjailijan arvokkaimmat varat.

**5. Käytä kirjaa osana liiketoimintaa.** Kirja on investointi, jonka tuotto mitataan kokonaisuutena — ei vain suorina myyntituloina.

## Yhteenveto

Omakustannekirjailija voi tienata merkittävästi enemmän kuin perinteisen kustantamon kirjailija — jos markkinoi aktiivisesti ja julkaisee kaikissa formaateissa. Realistiset odotukset ja pitkäjänteinen työ ovat avain menestykseen.

[Pyydä hinta-arvio](/tarjouspyynto) ja aloita kirjasi julkaisuprosessi tänään.
    `,
  },
  {
    id: "e-kirjan-julkaiseminen",
    title: "E-kirjan julkaiseminen Suomessa: Täydellinen opas 2026",
    slug: "e-kirjan-julkaiseminen",
    excerpt: "Miten julkaistaan e-kirja Suomessa? Tässä oppaassa käymme läpi koko prosessin EPUB-tiedostosta suoratoistopalvelujakeluun.",
    category: "E-kirjat",
    readTime: "10 min",
    date: "2026-05-01",
    content: `
E-kirja on nopein ja edullisin tapa julkaista kirja. Se ei vaadi painatusta, varastointia tai fyysistä jakelua — ja se on saatavilla lukijalle välittömästi ostoksen jälkeen. Tässä oppaassa käymme läpi kaiken, mitä sinun täytyy tietää e-kirjan julkaisemisesta Suomessa.

## Mikä on e-kirja?

E-kirja (elektroninen kirja) on digitaalinen julkaisu, jota luetaan tietokoneella, tabletilla, e-lukulaitteella (Kindle, Kobo) tai älypuhelimella. Yleisin e-kirjaformaatti on EPUB3, joka skaalautuu eri laitteille ja näyttökoille.

PDF on myös e-kirjaformaatti, mutta se ei skaalaudu hyvin eri laitteille — siksi kirjakaupat ja suoratoistopalvelut käyttävät EPUB3-formaattia.

## E-kirjan tuotantoprosessi

### Vaihe 1: Käsikirjoituksesta EPUB3-tiedostoksi

E-kirjan taitto eroaa painetun kirjan taitosta. EPUB3-formaatti on "reflowable" — teksti mukautuu lukijan fonttikoon ja laitteen näyttökoon mukaan. Tämä tarkoittaa, että taittaja ei voi määrittää tarkkoja sivunvaihtoja tai tekstin sijoittelua samalla tavalla kuin painetussa kirjassa.

Hyvä e-kirjataitto sisältää:
- Toimivan sisällysluettelon ja navigaation
- Oikeat otsikkotasot (H1, H2, H3)
- Optimoidut kuvat
- Toimivat linkit
- Metatiedot (tekijä, otsikko, ISBN, kustantaja)

### Vaihe 2: ISBN-tunnus e-kirjalle

E-kirja tarvitsee oman ISBN-tunnuksen — eri kuin painetun kirjan ISBN. Suomessa ISBN-tunnukset myöntää Kansalliskirjasto maksutta.

### Vaihe 3: Jakelu — miten e-kirja päätyy lukijalle?

E-kirjan jakelu tapahtuu aggregaattorin kautta. Aggregaattori toimittaa e-kirjan kaikkiin jakelukanaviin yhdellä kertaa:

**Suomalaiset kirjakaupat:**
- Suomalainen Kirjakauppa
- Adlibris

**Kansainväliset alustat:**
- Amazon Kindle
- Kobo
- Google Play Books
- Apple Books

**Suoratoistopalvelut (e-kirjat):**
- Storytel (myös e-kirjoja)
- Nextory

## E-kirjan hinnoittelu

E-kirjan hinnoittelu on tasapainoilu: liian halpa viestii heikosta laadusta, liian kallis karkottaa ostajia.

Suomalaiset e-kirjat maksavat tyypillisesti 8–18 €. Asiantuntijakirjat voivat olla kalliimpia (15–25 €), viihdekirjat edullisempia (7–12 €).

Amazon KDP:ssä e-kirjan hinta 2,99–9,99 € tuo 70 % rojaltit; alle 2,99 € tai yli 9,99 € tuo vain 35 % rojaltit.

## E-kirjan edut painettuun kirjaan verrattuna

| Ominaisuus | E-kirja | Painettu kirja |
|---|---|---|
| Tuotantokustannus | Matala | Korkea |
| Varastointi | Ei tarvita | Tarvitaan |
| Jakelu | Välitön | 2–4 viikkoa |
| Rojaltit kirjailijalle | 60–70 % | 50–60 % |
| Lukijakokemus | Skaalautuva | Fyysinen |
| Kirjastojakelu | Mahdollinen | Mahdollinen |

## E-kirja osana julkaisupakettia

Useimmille kirjailijoille e-kirja on osa laajempaa julkaisupakettia — ei ainoa julkaisumuoto. Painettu kirja, e-kirja ja äänikirja tavoittavat eri lukijakunnat ja tuovat tuloja eri kanavista.

Thunder Kustannuksen Digi-paketti sisältää e-kirjan ja äänikirjan tuotannon sekä jakelun kaikkiin suomalaisiin suoratoistopalveluihin. Printti-paketti lisää painetun kirjan ja laajemman jakeluverkoston.

[Katso paketit ja hinnat](/hinnat) tai [Pyydä hinta-arvio](/tarjouspyynto).
    `,
  },
  {
    id: "kirjan-kirjoittaminen-aloittelijalle",
    title: "Kirjan kirjoittaminen aloittelijalle: Miten aloitan?",
    slug: "kirjan-kirjoittaminen-aloittelijalle",
    excerpt: "Haaveiletko kirjan kirjoittamisesta mutta et tiedä mistä aloittaa? Tässä käytännön opas kirjan kirjoittamiseen aloittelijalle — vaihe vaiheelta.",
    category: "Aloittelijalle",
    readTime: "11 min",
    date: "2026-05-15",
    content: `
Lähes jokaisella on kirja sisällään. Idea, tarina tai asiantuntemus, joka ansaitsee tulla jaetuksi. Mutta miten aloittaa? Kirjan kirjoittaminen tuntuu usein ylivoimaiselta tehtävältä, kunnes sen pilkkoo pienempiin osiin. Tässä oppaassa käymme läpi kirjan kirjoittamisen vaihe vaiheelta.

## Miksi kirjoittaa kirja?

Ennen kuin aloitat, on tärkeää tietää miksi kirjoitat. Motivaatio vaikuttaa kaikkeen: aihevalintaan, kirjoitustyyliin ja siihen, miten jaksat viedä projektin loppuun.

**Asiantuntijakirja:** Haluatko jakaa osaamistasi ja rakentaa asiantuntijastatusta? Asiantuntijakirja on tehokkain tapa erottautua alallasi.

**Omaelämäkerta tai muistelmat:** Haluatko tallentaa elämäntarinasi tai tärkeän kokemuksen? Omaelämäkerrat koskettavat lukijoita syvällisesti.

**Romaani tai novelli:** Haluatko kertoa tarinan? Kaunokirjallisuus on vaativaa mutta palkitsevaa.

**Opaskirja:** Haluatko auttaa muita oppimaan jonkin taidon? Opaskirjat myyvät hyvin, koska niillä on selkeä kohdeyleisö.

## Vaihe 1: Aihe ja kohderyhmä

Hyvä kirja vastaa kysymykseen: "Kenelle tämä kirja on kirjoitettu ja mitä he saavat siitä?"

Mitä tarkemmin voit määritellä kohderyhmäsi, sitä paremmin voit kirjoittaa heille. "Kaikille" ei ole kohderyhmä: "40–55-vuotiaille naisyrittäjille, jotka haluavat skaalata liiketoimintaansa" on kohderyhmä.

Aihevalinnassa kannattaa ottaa huomioon:
- Mitä osaat paremmin kuin useimmat ihmiset?
- Mistä aiheesta voisit puhua tuntikausia väsymättä?
- Kenelle tämä tieto olisi arvokasta?
- Onko aiheesta jo kirjoja? (Kilpailu on hyvä merkki — se tarkoittaa, että aiheelle on kysyntää)

## Vaihe 2: Rakenne ja sisällysluettelo

Ennen kuin kirjoitat sanaakaan, tee sisällysluettelo. Rakenne on kirjan selkäranka — ilman sitä kirjoittaminen on kuin rakentaisi taloa ilman pohjapiirustusta.

Hyvä sisällysluettelo:
- Alkaa lukijan ongelmasta tai tarpeesta
- Etenee loogisesti ratkaisua kohti
- Päättyy selkeään johtopäätökseen tai toimintakehotukseen
- Jakautuu 5–12 lukuun (useimmat kirjat)

Kirjoita jokaiselle luvulle lyhyt kuvaus: mitä lukija oppii tässä luvussa? Tämä auttaa sinua pysymään fokuksessa kirjoittaessa.

## Vaihe 3: Kirjoitusrutiini — avain valmistumiseen

Kirja ei synny yhdessä istumassa. Se syntyy päivittäisestä, johdonmukaisesta kirjoittamisesta.

**Aseta tavoite:** 500–1 000 sanaa päivässä on realistinen tavoite useimmille. 200-sivuinen kirja (noin 50 000 sanaa) valmistuu tällä tahdilla 50–100 päivässä.

**Varaa aika:** Kirjoita samaan aikaan joka päivä — aamulla ennen töitä, lounaalla tai illalla. Rutiini poistaa päätöksenteon taakan.

**Kirjoita ensin, editoi myöhemmin:** Ensimmäinen versio ei tarvitse olla täydellinen. Kirjoita ensin, editoi sitten. Perfektionismi on kirjoittajan suurin vihollinen.

**Käytä Pomodoro-tekniikkaa:** 25 minuuttia kirjoittamista, 5 minuuttia taukoa. Tämä pitää fokuksen terävänä ja estää uupumusta.

## Vaihe 4: Ensimmäinen versio — "vain kirjoita"

Ensimmäinen versio on vain sinulle. Sen tarkoitus on saada ajatukset paperille — ei tuottaa täydellistä tekstiä.

Älä editoi kirjoittaessa. Älä lue aiemmin kirjoittamaasi. Kirjoita eteenpäin. Voit aina palata ja korjata myöhemmin — mutta tyhjää sivua ei voi editoida.

Kun ensimmäinen versio on valmis, pidä tauko. Muutama päivä tai viikko etäisyyttä auttaa näkemään tekstin tuorein silmin.

## Vaihe 5: Editointi ja viimeistely

Editointi on kirjoittamisen tärkein vaihe. Ensimmäinen versio on raaka-aine — editointi muokkaa siitä valmiin tuotteen.

**Rakenteen tarkistus:** Eteneekö kirja loogisesti? Onko jotain turhaa? Puuttuuko jotain tärkeää?

**Kappaleiden ja lauseiden hiominen:** Onko teksti selkeää ja ymmärrettävää? Onko lauseet liian pitkiä? Onko toistoa?

**Oikoluku:** Kielioppivirheet, kirjoitusvirheet ja välimerkit. Suosittele ammattimaista oikolukijaa.

**Betälukijat:** Anna teksti luettavaksi 2–3 henkilölle, jotka kuuluvat kohderyhmääsi. Heidän palautteensa on arvokkaampaa kuin ystävien kohteliaat kommentit.

## Vaihe 6: Julkaiseminen

Kun käsikirjoitus on valmis, alkaa julkaisuprosessi: taitto, kansisuunnittelu, ISBN-tunnus ja jakelu. Thunder Kustannus hoitaa nämä kaikki puolestasi.

[Lue lisää julkaisuprosessista](/oppaat/miten-julkaisen-oman-kirjan) tai [Pyydä hinta-arvio](/tarjouspyynto).

## Yhteenveto: Kirja syntyy kirjoittamalla

Kirjan kirjoittaminen ei vaadi erityistä lahjakkuutta — se vaatii päätöksen aloittaa ja sitoutumisen jatkaa. Jokainen kirja alkaa ensimmäisestä lauseesta.

Aloita tänään. Kirjoita ensimmäinen luku. Kirjasi odottaa.
    `,
  },
  {
    id: "kirjan-myynti-rohkeus",
    title: "Kirjan myynti alkaa rohkeudesta, ei täydellisyydestä",
    slug: "kirjan-myynti-rohkeus",
    excerpt: "Kirjallisuusala kärsii yhdestä yhteisestä ongelmasta: liiasta odottamisesta. Kirja, jota ei ole julkaistu, ei myy. Tässä oppaassa käymme läpi, miksi tekeminen on täydellisyyttä tärkeämpää — ja miten se käytännössä näkyy kirjan myynnissä.",
    category: "Strategia",
    readTime: "4 min",
    date: "2026-05-08",
    content: `
Kirjallisuusalalla on pitkä perinne täydellisyyden tavoittelusta. Se on ymmärrettävää — kirja on tekijänsä näköinen, ja sen päästäminen maailmalle tuntuu henkilökohtaiselta. Mutta tämä sama perinne on myös yksi suurimmista syistä siihen, miksi niin moni kirja jää kirjoittamatta, julkaisematta ja myymättä.

## Odottamisen hinta

Kirja, jota ei ole julkaistu, ei myy. Tämä on yksinkertainen tosiasia, mutta sen seuraukset ovat laajat. Jokainen kuukausi, jonka käytät hiomiseen, on kuukausi ilman lukijoita, ilman palautetta ja ilman myyntiä. Täydellisyyttä tavoitteleva kirjailija ei suojele teostaan — hän suojelee itseään epäonnistumisen pelolta.

Todellisuus on tämä: lukija ei odota täydellisyyttä. Hän odottaa rehellisyyttä, hyödyllisyyttä ja aitoa ääntä. Nämä eivät synny loputtomasta hiomisesta — ne ovat joko tekstissä tai eivät ole.

## Ensimmäinen versio on lähtölaukaus, ei maaliviiva

Ammattikirjailijat tietävät asian, jota aloittelijat pelkäävät myöntää: ensimmäinen julkaistu kirja on harvoin paras kirja. Se on kuitenkin tärkein kirja — koska se on se, josta kaikki alkaa.

Julkaiseminen opettaa asioita, joita ei voi oppia kirjoittamalla. Se opettaa, miten lukijat reagoivat, mitkä aiheet resonoivat, miten markkinointi toimii ja miten myynti rakentuu. Nämä opit tekevät seuraavasta kirjasta paremman.

Kirjailija, joka on julkaissut yhden epätäydellisen kirjan, on pidemmällä kuin kirjailija, joka on kirjoittanut kymmenen täydellistä käsikirjoitusta, jotka odottavat pöytälaatikossa.

## Myynti ei löydä sinua — sinä löydät myynnin

Toinen yleinen harhaluulo on, että hyvä kirja myy itsensä. Se ei myy. Lukijat eivät taikaisukusta löydä sinua — sinun täytyy mennä heidän luokseen.

Tämä tarkoittaa käytännössä kolmea asiaa:

**Näkyvyys ennen julkaisua.** Kirjan myynti alkaa ennen kuin kirja on valmis. Kerro kirjastasi somessa, puhu siitä ääneen, rakenna odotusta. Lukija, joka on kuullut kirjastasi ennen julkaisua, on todennäköisempi ostaja kuin lukija, joka törmää siihen sattumalta.

**Aktiivinen myynti julkaisun jälkeen.** Julkaisupäivä ei ole maaliviiva — se on lähtölaukaus. Ensimmäiset viikot ratkaisevat, saako kirja näkyvyyttä vai jääkö se hyllyyn. Tee julkaisuviikolla enemmän kuin koskaan muulloin: postaa, lähetä sähköposteja, pyydä arvosteluja, esiinny podcasteissa.

**Pitkäjänteisyys.** Useimmat kirjat myyvät parhaiten kuukausien tai vuosien kuluttua julkaisusta — ei julkaisuviikolla. Kirja, josta puhutaan aktiivisesti vielä vuoden päästä, myy enemmän kuin kirja, joka räjähtää hetkeksi ja unohtuu.

## Täydellisyys on kilpailijasi etu

Jos sinä odotat täydellisyyttä, joku muu julkaisee. Hän saa lukijat, palautteet ja kokemuksen. Sinä saat lisää aikaa hioa — mutta et lukijoita.

Tämä ei tarkoita, että laatu ei merkitse. Se merkitsee. Mutta laatu ei synny odottamalla — se syntyy tekemisestä, palautteesta ja kehittymisestä. Ensimmäinen kirja ei ole viimeinen kirja. Se on ensimmäinen askel.

## Käytännön ohjeet: miten aloitat myynnin tänään

Jos kirjasi on jo valmis tai lähes valmis, tässä on kolme asiaa joita voit tehdä heti:

**Aseta julkaisupäivä.** Ei "joskus keväällä" — vaan tarkka päivämäärä. Päivämäärä luo paineen, joka saa asiat tapahtumaan.

**Kerro kirjastasi yhdelle ihmiselle tänään.** Ei somessa, vaan henkilökohtaisesti. Lähetä viesti yhdelle ihmiselle, jota kirjasi aihe koskettaa. Pyydä häntä lukemaan se. Ensimmäinen lukija on tärkeämpi kuin tuhat seuraajaa.

**Lopeta editoiminen ja aloita julkaisuprosessi.** Jos olet editoinut kirjaasi yli kolme kertaa, se on todennäköisesti jo tarpeeksi hyvä. Seuraava askel ei ole neljäs editointikierros — se on taitto, kansi ja jakelu.

Kirja ei tule koskaan täydelliseksi. Mutta se voi tulla julkaistuksi ja se on ainoa versio, joka voi muuttaa jonkun elämän.

[Pyydä hinta-arvio](/tarjouspyynto) ja aloita julkaisuprosessi tänään.
    `,
  },
];

export const COMPANY = {
  name: "Thunder Kustannus",
  legalName: "Thunder Media Oy",
  tagline: "Sinun kirjasi. Sinun oikeutesi. Ammattimainen julkaisu.",
  description: "Thunder Kustannus on suomalainen kirjailijoiden julkaisualusta, jossa yhdistyvät ammattimainen kustannustoiminta ja kirjailijan täysi kontrolli. Painettu kirja, e-kirja ja äänikirja. Jakelu kaikkiin suomalaisiin kirjakauppoihin ja suoratoistopalveluihin. Oikeudet pysyvät sinulla.",
  email: "info@thunderkustannus.fi",
  phone: "",
  address: "",
  businessId: "",
  founded: "2026",
  distribution: ["Suomalainen Kirjakauppa", "Adlibris", "Storytel", "BookBeat", "Nextory", "Spotify", "Suomen kirjastot"],
};
