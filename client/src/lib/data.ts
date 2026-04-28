// ============================================================
// Thunder Kustannus — Sivuston data
// Muokkaa tätä tiedostoa päivittääksesi hinnat, paketit ja sisällön
// ============================================================

export const PACKAGES = [
  {
    id: "digi",
    name: "Digi",
    price: "890",
    priceNote: "sis. ALV 25,5 %",
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
    cta: "Pyydä tarjous",
  },
  {
    id: "printti",
    name: "Printti",
    price: "1 690",
    priceNote: "sis. ALV 25,5 %",
    tagline: "Suosituin valinta",
    highlight: true,
    description: "Kaikki digitaaliset palvelut ja lisäksi painettu kirja. Kirjasi myyntiin kirjakauppoihin ympäri Suomen.",
    features: [
      "Kaikki Digi-paketin sisältö",
      "50 kpl painettuja kirjoja",
      "Jakelu: Suomalainen Kirjakauppa, Adlibris, Kirjastot, Storytel, BookBeat, Nextory, Spotify, Amazon, Elisa Kirja, Kobo, Google Play Books",
      "Kirjavälitys-sopimus",
      "1 vuoden varastointi",
    ],
    notIncluded: ["Markkinointipaketti", "Lehdistötiedote"],
    cta: "Pyydä tarjous",
  },
  {
    id: "premium",
    name: "Premium",
    price: "2 990",
    priceNote: "sis. ALV 25,5 %",
    tagline: "Markkinajohtajan valinta",
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
    cta: "Pyydä tarjous",
  },
];

export const GUIDES = [
  {
    id: "miten-julkaisen-oman-kirjan",
    title: "Miten julkaisen oman kirjan? — Täydellinen opas 2025",
    slug: "miten-julkaisen-oman-kirjan",
    excerpt: "Haaveiletko oman kirjan julkaisemisesta mutta et tiedä mistä aloittaa? Tässä oppaassa käymme läpi koko prosessin käsikirjoituksesta valmiiseen kirjaan.",
    category: "Aloittelijalle",
    readTime: "8 min",
    date: "2025-01-15",
    content: `
Oman kirjan julkaiseminen on helpompaa kuin koskaan ennen. Omakustantaminen on kasvanut räjähdysmäisesti, ja nykyään kirjailijalla on enemmän vaihtoehtoja kuin koskaan.

## Mitä omakustantaminen tarkoittaa?

Omakustantaminen (self-publishing) tarkoittaa, että kirjailija itse vastaa kirjan julkaisemisesta — tai käyttää palvelukustantamoa apunaan. Toisin kuin perinteisessä kustantamisessa, kirjailija säilyttää täyden kontrollin sisältöön, hintaan ja oikeuksiin.

## Vaihe 1: Käsikirjoituksen viimeistely

Ennen kuin aloitat julkaisuprosessin, käsikirjoituksen tulee olla valmis. Tämä tarkoittaa:

- Sisällön on oltava valmis ja tarkistettu
- Rakenne on selkeä ja johdonmukainen
- Teksti on oikoluettu

## Vaihe 2: Kansi ja taitto

Kirjan kansi on tärkein markkinointivälineesi. Tutkimusten mukaan lukijat tekevät ostopäätöksen alle 3 sekunnissa kannen perusteella. Ammattimainen taitto varmistaa, että kirjasi näyttää laadukkaalta sekä painettuna että digitaalisena.

## Vaihe 3: ISBN-tunnus

Jokainen kirja tarvitsee oman ISBN-tunnuksen. Suomessa ISBN-tunnukset myöntää Kansalliskirjasto. Tarvitset erillisen ISBN:n painetulle kirjalle, e-kirjalle ja äänikirjalle.

## Vaihe 4: Jakelu

Kirjasi pitää saada lukijoiden käsiin. Jakelu kattaa:
- Fyysiset kirjakaupat (Suomalainen Kirjakauppa, Adlibris)
- Verkkokaupat
- Kirjastot
- Digitaaliset palvelut (Storytel, BookBeat, Spotify)

## Vaihe 5: Markkinointi

Kirjan julkaiseminen on vasta alku. Markkinointi ratkaisee, kuinka moni lukija löytää kirjasi.

Thunder Kustannus auttaa sinua kaikissa näissä vaiheissa — yhdellä sopimuksella.
    `,
  },
  {
    id: "omakustanne-vai-perinteinen-kustantamo",
    title: "Omakustannekirja vai perinteinen kustantamo — kumpi sopii sinulle?",
    slug: "omakustanne-vai-perinteinen-kustantamo",
    excerpt: "Perinteinen kustantamo vai omakustantaminen? Vertailemme molemmat vaihtoehdot rehellisesti, jotta voit tehdä parhaan päätöksen kirjallesi.",
    category: "Strategia",
    readTime: "6 min",
    date: "2025-02-01",
    content: `
Kirjailijan yksi tärkeimmistä päätöksistä on valita, miten kirja julkaistaan. Tässä rehellinen vertailu.

## Perinteinen kustantamo

Perinteinen kustantamo ottaa kirjan julkaistavakseen omalla kustannuksellaan. Kuulostaa hyvältä — mutta todellisuus on monimutkaisempi.

**Edut:**
- Kustantamo maksaa julkaisukustannukset
- Laaja jakeluverkosto valmiina
- Arvostus kirjallisuuspiireissä

**Haitat:**
- Hyväksymisprosentti on alle 1% lähetetyistä käsikirjoituksista
- Prosessi kestää 1–3 vuotta
- Kirjailija saa vain 8–15% myyntituloista
- Kustantamo omistaa oikeudet

## Omakustantaminen palvelukustantamon kautta

Palvelukustantamo (kuten Thunder Kustannus) tarjoaa parhaan yhdistelmän: kirjailija säilyttää kontrollin ja oikeudet, mutta saa ammattilaisten avun.

**Edut:**
- Julkaisu 4–8 viikossa
- Kirjailija saa 70–80% myyntituloista
- Täysi kontrolli sisältöön ja hintaan
- Jakelu kaikkiin kanaviin

**Haitat:**
- Alkusijoitus (palvelupaketti)
- Markkinointivastuu kirjailijalla

## Kenelle omakustantaminen sopii?

Omakustantaminen sopii erityisesti asiantuntijoille, yrittäjille ja ammattilaisille, jotka haluavat käyttää kirjaa osana omaa brändiään tai liiketoimintaansa.
    `,
  },
  {
    id: "aanikirjan-tekeminen",
    title: "Äänikirjan tekeminen — näin muutat kirjasi äänikirjaksi",
    slug: "aanikirjan-tekeminen",
    excerpt: "Äänikirjojen suosio on räjähtänyt Suomessa. Tässä oppaassa kerromme, miten kirjastasi tehdään äänikirja ja miten se jaellaan Storyteliin, BookBeatiin ja Spotifyhin.",
    category: "Äänikirjat",
    readTime: "7 min",
    date: "2025-02-15",
    content: `
Äänikirjat ovat Suomen nopeimmin kasvava kirjaformaatti. Storytel, BookBeat ja Spotify ovat tuoneet äänikirjat kaikkien saataville.

## Miksi tehdä äänikirja?

- Äänikirjamarkkina kasvaa 20–30% vuodessa Suomessa
- Spotify avasi äänikirjat Suomessa marraskuussa 2025 — 300 000 kirjan valikoima
- Äänikirja tavoittaa uuden yleisön: kuuntelijat, jotka eivät lue painettuja kirjoja
- Lisätuloja samasta sisällöstä

## Äänikirjan tuotantoprosessi

### 1. Käsikirjoituksen valmistelu
Äänikirjaa varten käsikirjoitus muokataan kuuntelukokemukseen sopivaksi. Luvut merkitään selkeästi, ja visuaaliset elementit (taulukot, kuvat) muutetaan kuvauksiksi.

### 2. Lukijan valinta
Ammattilukija on äänikirjan tärkein elementti. Hyvä lukija tuo kirjan eloon ja pitää kuuntelijan otteessaan.

### 3. Äänitys ja editointi
Äänitys tapahtuu ammattistudiossa. Editoinnissa poistetaan virheet, tasataan äänentaso ja lisätään tarvittavat tehosteet.

### 4. Jakelu
Valmis äänikirja jaellaan aggregaattorin (kuten Publizon) kautta kaikkiin palveluihin:
- Storytel
- BookBeat
- Nextory
- Spotify
- Suomen kirjastot

Thunder Kustannus hoitaa koko prosessin puolestasi.
    `,
  },
  {
    id: "kirjan-markkinointi",
    title: "Kirjan markkinointi — 10 tapaa myydä omakustannekirjaasi",
    slug: "kirjan-markkinointi",
    excerpt: "Kirja on julkaistu — mitä seuraavaksi? Tässä 10 konkreettista tapaa markkinoida omakustannekirjaasi ja saada se lukijoiden käsiin.",
    category: "Markkinointi",
    readTime: "9 min",
    date: "2025-03-01",
    content: `
Kirjan julkaiseminen on vasta puoliväli. Markkinointi ratkaisee, kuinka moni lukija löytää kirjasi.

## 1. Sosiaalinen media

Instagram, Facebook ja LinkedIn ovat tehokkaita kanavia kirjan markkinointiin. Jaa kirjoitusprosessia, behind-the-scenes -sisältöä ja lainauksia kirjasta.

## 2. Sähköpostilista

Rakenna sähköpostilista jo ennen julkaisua. Ilmoita tilaajille ensin — he ovat sitoutuneimpia lukijoitasi.

## 3. Lehdistötiedote

Lähetä lehdistötiedote paikallisille sanomalehdille, alan julkaisuille ja bloggaajille. Hyvä tarina saa medianäkyvyyttä.

## 4. Kirjaesittelyt ja tapahtumat

Kirjamessut, kirjastotapahtumat ja yritysten tilaisuudet ovat erinomaisia paikkoja esitellä kirjaasi.

## 5. Podcast-vierailut

Podcastit tavoittavat sitoutuneen yleisön. Etsi alasi podcasteja ja tarjoudu vieraaksi.

## 6. Blogiyhteistyö

Kirja-arvostelut blogeissa ja verkkolehdissä lisäävät näkyvyyttä ja uskottavuutta.

## 7. Amazon ja verkkokaupat

Optimoi kirjasi kuvaus, avainsanat ja kategoria verkkokaupassa. Hyvä kuvaus myy.

## 8. Yritysasiakkaat

Jos kirjasi sopii yrityksille, tarjoa sitä henkilöstölahjaksi tai koulutusmateriaaleiksi.

## 9. Kirjakerho

Tarjoudu kirjakerhon vieraaksi — joko paikan päällä tai etänä.

## 10. Jatkuva sisällöntuotanto

Kirjoita artikkeleita, pidä blogia tai tee videoita kirjasi aiheesta. Sisältömarkkinointi rakentaa pitkäaikaista näkyvyyttä.
    `,
  },
  {
    id: "isbn-tunnus",
    title: "ISBN-tunnus — mitä se on ja miten se haetaan?",
    slug: "isbn-tunnus",
    excerpt: "ISBN-tunnus on kirjan kansainvälinen tunniste. Ilman sitä kirjaasi ei voi myydä kirjakaupoissa. Tässä kaikki mitä sinun täytyy tietää.",
    category: "Käytännön asiat",
    readTime: "5 min",
    date: "2025-03-15",
    content: `
ISBN (International Standard Book Number) on kirjan kansainvälinen tunnistenumero. Se on pakollinen, jos haluat myydä kirjaasi kirjakaupoissa tai kirjastoissa.

## Miksi ISBN tarvitaan?

- Kirjakaupat ja kirjastot käyttävät ISBN:ää kirjojen tilaamiseen ja hallintaan
- Ilman ISBN:ää kirjaasi ei voi tilata kirjakaupoista
- ISBN yksilöi jokaisen julkaisumuodon erikseen

## Yksi kirja, useita ISBN-tunnuksia

Jokaisella julkaisumuodolla on oma ISBN:nsä:
- Painettu kirja (pehmeäkantinen)
- Painettu kirja (kovakantinen)
- E-kirja (EPUB)
- Äänikirja

## Kuka hakee ISBN:n?

Suomessa ISBN-tunnukset myöntää **Kansalliskirjasto**. Haku on maksuton.

Kun käytät palvelukustantamoa (kuten Thunder Kustannus), me hoidamme ISBN-hakemuksen puolestasi. ISBN rekisteröidään kustantamon nimiin, mikä tarkoittaa, että kirjasi näkyy ammattimaisesti kirjakaupoissa.

## Thunder Kustannus hoitaa ISBN:n puolestasi

Kaikki pakettimme sisältävät ISBN-tunnuksen hakemisen. Sinun ei tarvitse huolehtia byrokratiasta — me hoidamme sen.
    `,
  },
  {
    id: "kirjan-taitto-ja-kansisuunnittelu",
    title: "Kirjan taitto ja kansisuunnittelu — mitä kannattaa tietää?",
    slug: "kirjan-taitto-ja-kansisuunnittelu",
    excerpt: "Kirjan ulkoasu ratkaisee ensivaikutelman. Ammattimainen taitto ja kansisuunnittelu ovat investointi, joka maksaa itsensä takaisin myynnissä.",
    category: "Tuotanto",
    readTime: "6 min",
    date: "2025-04-01",
    content: `
Kirjan ulkoasu on ensimmäinen asia, jonka lukija näkee. Tutkimusten mukaan ostopäätös tehdään alle 3 sekunnissa kannen perusteella.

## Miksi ammattimainen taitto on tärkeää?

Taitto tarkoittaa kirjan sisäsivujen visuaalista suunnittelua: fonttivalinnat, rivivälit, marginaalit, otsikoiden hierarkia ja kuvien sijoittelu. Huono taitto tekee kirjasta vaikealukuisen ja epäammattimaisen näköisen.

## Kansisuunnittelu — kirjasi tärkein markkinointiväline

Kansi myy kirjan. Hyvässä kannessa on:
- Selkeä, luettava otsikko
- Ammattimainen kuva tai grafiikka
- Kirjailijan nimi sopivassa koossa
- Genreen sopiva tyyli

## E-kirjan erityisvaatimukset

E-kirja (EPUB3) vaatii erityisen taiton, joka skaalautuu eri näyttökokoihin. Reflowable-formaatti tarkoittaa, että teksti mukautuu lukijan fonttikoon mukaan.

## Äänikirjan kansi

Äänikirjalla on oma kansi, joka näkyy suoratoistopalveluissa. Se on neliön muotoinen (1:1) ja sen täytyy toimia pienessä koossa.

## Thunder Kustannus hoitaa kaiken

Kaikki pakettimme sisältävät ammattimaisen taiton ja kansisuunnittelun. Yhteistyössä sinun kanssasi luomme kirjallesi ulkoasun, joka erottuu joukosta.
    `,
  },
];

export const COMPANY = {
  name: "Thunder Kustannus",
  legalName: "Thunder Media Oy",
  tagline: "Julkaise kirjasi ammattilaisena",
  description: "Thunder Kustannus on moderni suomalainen palvelukustantamo. Autamme kirjailijoita julkaisemaan kirjansa ammattimaisesti — painettu kirja, e-kirja ja äänikirja. Jakelu kaikkiin suomalaisiin kirjakauppoihin ja suoratoistopalveluihin.",
  email: "info@thunderkustannus.fi", // Vaihda oikeaksi kun sähköposti on luotu
  phone: "", // Lisää puhelinnumero
  address: "", // Lisää osoite
  businessId: "", // Lisää Y-tunnus
  founded: "2025",
  distribution: ["Suomalainen Kirjakauppa", "Adlibris", "Storytel", "BookBeat", "Nextory", "Spotify", "Suomen kirjastot"],
};
