# Myyntisivujen esikatselu — 19.10.2026

Tämä haara on tarkistettavaksi. Ei yhdistämistä main-haaraan eikä julkaisua ilman Santerin lupaa.

## Muutokset
- Premiumin vahvistettu sisältö yhdessä tiedostossa `client/src/lib/sales-content.ts`, suomeksi ja englanniksi. Hinnat ja pakettien nimet ennallaan.
- Uusi /asiantuntijakirja, linkit Premium-korteista, oppaiden listauksesta ja artikkeleista. Kartoitukset nykyiseen /tarjouspyynto-lomakkeeseen. Lomakkeiden toiminta ennallaan.
- Äänikirjan 890 € nosto, Digi-kortin ensimmäinen lihavoitu ominaisuus ja näkyvät Klarna-maininnat. Maksuvaihtoehtojen saatavuus ja ehdot vahvistetaan maksusivulla.
- Julkaisupakettien alle 250 sivun raja, valmis käsikirjoitus, oikoluvun ja sisällön muokkauksen rajaus sekä 4–8 viikon tavoiteaikataulu näkyviin.
- Palautetekstien kolme ehdotusta, oletuksena piilossa. Ei keksittyjä kirjailijakohtaisia lainauksia tai arviointitähtiä.
- Pyynnön aikainen React-palvelinrenderöinti sivuille /, /hinnat, /meista, /kirjat, /oppaat, /oppaat/* ja /asiantuntijakirja. Sama sisältö kävijöille ja boteille, ei user-agent-haaroja. Olemassa oleva React-sovellus hoitaa interaktiot latauksen jälkeen; lomakkeet ja maksujen webhook ennallaan.
- Sivukohtainen title, description, canonical ja OG-tiedot suoraan HTML:ssä. Sitemap päivitetty. Kampanjan voimassaolo tarkistetaan jokaisella palvelinrenderöinnillä.

## Paikallinen esikatselu
Rakenna sekä selain- että SSR-versio ympäristömuuttujalla `VITE_EDITORIAL_PREVIEW=true`. Käynnistä palvelin `NODE_ENV=production`, `PAYMENTS_ENABLED=false` ja halutulla PORT-arvolla. Palauteluonnoksissa näkyvät varoitusmerkinnät ja esikatselu on noindex.

**Älä aseta VITE_EDITORIAL_PREVIEW=true tuotantoon.** Julkisessa oletusversiossa näkyvät vain hyväksytyt palautteet. `approved` muutetaan true vasta tekstin ja nimettynä julkaisemisen luvan vahvistamisen jälkeen. Lisää silloin myös oikea kansikuva samassa datassa.

## Santerin hyväksyttävät palautetekstit
Nämä ovat kirjoitusehdotuksia, eivät varmennettuja asiakaslainauksia.

1. Julkaiseminen tuntui selkeältä alusta loppuun. Tiesin, mitä seuraavaksi tapahtuu, ja sain apua silloin kun tarvitsin.
   - [TÄYTÄ: palautteen antajan nimi]
   - [TÄYTÄ: teos]
2. Olen todella tyytyväinen lopputulokseen. Kirja näyttää ja tuntuu siltä, miltä toivoinkin.
   - [TÄYTÄ: palautteen antajan nimi]
   - [TÄYTÄ: teos]
3. Yhteistyö sujui mallikkaasti. Teen mielelläni seuraavankin kirjani Thunder Kustannuksen kanssa.
   - [TÄYTÄ: palautteen antajan nimi]
   - [TÄYTÄ: teos]

Harri Lauslahden Leading in the Age of AI on mukana julkaisureferenssinä olemassa olevalla kuvalla. Sen yhteydessä ei ole vahvistamatonta lausuntoa. Janin, Ellimarian tai Harrin nimiin ei ole liitetty ehdotuksia.

## Palvelun toimituksessa muistettava
- Tiia Sandberg Akademin verkkovalmennuspolku kuuluu kuvattuun Premium-palveluun. Se rakennetaan ennen asiakkaan tarvitsemaa käyttöä; sitä ei rakennettu tässä työssä.
- Prioriteettituen 12 kk kesto säilyy, mutta tarkkaa vasteaikaa tai kanavaa ei luvata ilman vahvistusta. Niistä sovitaan asiakkaan kanssa.
- Ei luvata maksettua mainontaa, taattua medianäkyvyyttä, myyntituloja, puhujakeikkoja tai markkinoiden nopeinta toimitusta.

## Hakunäkyvyyden käytännön raja
HTML:n luettavuus paranee, mutta se ei takaa hakusijoitusta tai pääsyä AI-vastauksiin. Tekniset linjaukset: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
