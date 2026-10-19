# Oppaiden julkaisuehdotus — 19.10.2026

Santeri hyväksyi kuusi opasta ja niiden tuotantojulkaisun 19.10.2026. Julkaisu säilyttää alla olevan päiväkohtaisen aikataulun. Sivuston jo hyväksyttyä Premium-, Klarna- tai palautesisältöä ei palauteta vanhaan versioon.

## Julkaisupäivät Suomen aikaa

| Päivä klo 00.00 | Osoite | Tekstin alkuperä |
|---|---|---|
| 22.10.2026 | /oppaat/kirja-lahjaksi | Santerin liite, palvelulupaukset tarkennettu |
| 29.10.2026 | /oppaat/muistelmakirjan-julkaiseminen | Uusi luonnos Santerin pyynnöstä |
| 5.11.2026 | /oppaat/asiantuntijakirja | Santerin liite, palvelulupaukset tarkennettu |
| 12.11.2026 | /oppaat/sukukirjan-tekeminen | Uusi luonnos Santerin pyynnöstä |
| 19.11.2026 | /oppaat/hylatty-kasikirjoitus | Uusi luonnos Santerin pyynnöstä |
| 29.12.2026 | /oppaat/kirja-valmiiksi-2027 | Uusi luonnos Santerin pyynnöstä |

Julkaisupäivät astuvat käyttöön vasta, kun tämä muutos hyväksytään ja julkaistaan tuotantoon. Jos jonkin oppaan päivämäärä on silloin jo mennyt, se tulee näkyviin heti. Myös neljä itse kirjoitettua luonnosta on hyväksytty.

## Tekstit ja rajaukset

- Lähteet: `content/guides/*.md`. Julkaisupäivä ja sivukohtaiset hakutiedot luetaan frontmatterista. Segmentit ja myyntitavoitteet ovat yksityisiä toimituksellisia tietoja, eivät julkisen API:n kenttiä.
- Lahjakorttia ei luvata myytäväksi. Lahjaksi annettavasta julkaisusta ohjataan sopimaan tarjouspyynnöllä.
- Julkaisuaikataulu on tavoite noin 4–8 viikkoa valmiista aineistosta, teoskohtaisesti sovittuna. Painotalon, toimitusten ja sesongin vaikutus mainitaan.
- Pakettien hinnat, alle 250 sivun raja ja valmiin käsikirjoituksen vaatimus säilyvät. Oikolukua, sisällön muokkausta, asiakkaan oman äänen tallennusta tai maksettua mainontaa ei luvata pakettien sisällöksi.
- Asiantuntijakirjaoppaan varmat myynti-, media- ja takaisinmaksuväitteet on muutettu mahdollisuuksiksi, joita kirjailija voi tavoitella.

## Ajastuksen toteutus

Julkaisu tapahtuu nykyisessä Express-palvelimessa pyynnön hetkellä Europe/Helsinki-aikavyöhykkeen mukaan. Erillistä maksullista palvelua, ajastettua uudelleenbuildia tai cron-tehtävää ei tarvita. Myös avoin sivusto tarkistaa uuden päivän julkaisut API:sta minuutin välein ja välilehdelle palattaessa.

Tulevien oppaiden lähteet ovat palvelimen puolella. Niitä ei sisällytetä selaimen JavaScript-pakettiin. Ennen julkaisua:

- opas ei ole listauksessa, etusivun nostoissa tai Lue myös -korteissa;
- julkinen API, HTML:n alustustieto ja sivukartta eivät sisällä sen tekstiä;
- suora osoite palauttaa 404;
- linkit vielä julkaisemattomiin oppaisiin näkyvät tekstinä, eivät toimimattomina linkkeinä;
- päiväkohtaiset vastaukset ovat no-store, jotta vanha 404 tai sivukartta ei jää välimuistiin.

Sama HTML palvelee kävijöitä ja hakurobotteja. Ajastusta ei ohjata URL-parametrilla tai selaimen kellolla.

## Vanhojen oppaiden parannukset

- Jokaisen oppaan keskellä tarkistuslista ja yhteydenotto, lopussa aiheeseen sopiva yhteydenottokehote sekä Klarna-maininta.
- Äänikirjaoppaassa 890 € Digi-paketin nosto; kustannusoppaassa kaikki kolme hintaa ja Klarna.
- Kustannusoppaan linkki asiantuntijakirjaoppaaseen ilmestyy vasta sen julkaisupäivänä. Linkki olemassa olevaan /asiantuntijakirja-myyntisivuun toimii heti.
- Miten julkaisen oman kirjan -oppaan kirjoitusvirhe ja lähteetön kolmen sekunnin tutkimusväite korjattu.
- /arvio ohjautuu HTTP 301:llä /tarjouspyynto-osoitteeseen; laskurin kyselyparametrit säilyvät. Sisäiset linkit päivitetty. Lomakkeen lähetykseen ei tehdä muutoksia.

## Paikallinen esikatselu

Normaali esikatselu käyttää oikeaa päivää. Vain paikalliseen tarkastukseen tarkoitettu `server/guide-preview.ts` näyttää kaikki kuusi opasta (tarkastelupäivä 29.12.2026), kuuntelee vain 127.0.0.1-osoitetta portissa 5190, estää indeksoinnin ja näyttää toimituksellisen esikatselumerkinnän. Se ei ole tuotannon käynnistyspiste eikä rekisteröi sähköpostien lähetysreittejä.

Rakennuksen jälkeen apupalvelimen voi kääntää komennolla `esbuild server/guide-preview.ts --platform=node --packages=external --bundle --format=esm --outdir=dist` ja käynnistää `node dist/guide-preview.js`.

## Tarkistuslistan sähköpostit

Nykyinen sivustokoodi lisää lataajan Brevon listalle ja lähettää oppaan sähköpostitse. Tähän muutokseen ei lisätty eikä käynnistetty viiden viestin sähköpostisarjaa. Brevon mahdollisia erikseen tehtyjä automaatioita ei ole tässä tarkastettu tai muutettu.

## Julkaisua edeltävä linkkitarkistus

19.10.2026: kaikki 17 opasta ja Oppaat-listaus tarkistettu paikallisessa esikatselussa. Tarkistettu 530 sisäistä linkkiä, 28 eri kohdetta ja listauksen kaikkien opaskorttien kohteet. Virheellisiä reittejä tai puuttuvia ankkurikohteita ei löytynyt. Ajastuksen ja reitityksen testit: 31 läpi; TypeScript-tarkistus läpi.
