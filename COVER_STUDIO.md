AJANTASAINEN TILANNE 26.10.2026: Katso outputs/Kansistudio/AUTOMAATIO-TILANNE.md. Uudet Brevo-polut 3 ja 4 on tallennettu INACTIVE-tilaan, listat 21/22/23 luotu. CMYK on vahvistettu vaatimus; erillistä painotalon hyväksyntälippua ei enää edellytetä. 126 testiä, tyyppitarkistus ja tuotantokäännös läpäisty. Ei julkaistu eikä lähetetty sähköposteja. Aidon MySQL:n ja sähköpostitoimituksen läpimeno yhä testaamatta. Alla oleva aiempi teksti on työvaiheiden historiaa.

# Kansisuunnittelija – korjattu paikallinen esikatselu
Tila: JULKAISTU 26.10.2026, commit 073bf0d, Railway-julkaisu 331e6e83-b02c-4a87-8624-14b6dd447ff7. HTTP 200 ja oikea julkinen sisältö varmennettu. Osoite https://www.thunderkustannus.fi/kansisuunnittelija
Osoite: http://localhost:5197/kansisuunnittelija

## Kannen taitto
Pehmeäkantisen ulkokansi on yksi yhtenäinen arkki: takakansi + selkä + etukansi. Leikkuuvara on aina 5 mm kaikilla ulkoreunoilla. Sen lisäksi tekstien turva-alue on 5 mm leikkuulinjan sisäpuolella; selkätekstille vähintään 1,5 mm kummallakin sivulla.
Kannen taittoon kuuluvat oikeat mitat, tekstien ja kuvien sijoittelu, selkä, takakansi, viivakoodivaraus, leikkuuvara ja lopullisen painoaineiston tarkistus. Kirjasimet, kuvat ja värit kuuluvat painotarkistukseen.
Tämä työkalu käyttää pehmeäkantisten hinnastoa. Kovakantisen taive-, lauta- ja ylivetomittoja ei arvata.

## Yksi lähde hinnalle ja selälle
- Hinnastodata on siirretty muuttamattomana shared/print-pricing-data.ts-tiedostoon. Vanha pricingData.ts vain vie samat tiedot eteenpäin. Hintoja ja selkämittoja ei muutettu.
- shared/print-production.ts on yhteinen laskentakerros. Ei sivumäärien pyöristystä tai selkämittojen interpolointia.
- Hinta lasketaan sentteinä: hinnaston kappalehinta × painos, tarvittaessa sisäsivutaitto 217 €, kotiintoimitus 50 €. Kaikki asiakkaalle näkyvät summat sisältävät alvin; ei uutta verotulkintaa.
- Yli 200 kirjan erät ohjataan tarjouspyyntöön. Hinnaston ulkopuolista tilausta ei voi muodostaa.
- Etusivun laskurin Jatka kansisuunnittelijaan -linkki siirtää koon, paperin, sivut ja painosmäärän. Linkki julkaistaan laskurin yhteydessä.
- Käsikirjoituksen ollessa vielä taittamatta sivumäärä, hinta ja selkä merkitään alustaviksi. Sisällön muokkaus/oikoluku ei kuulu 217 €:n taittoon.

## Suunnittelu ja vienti
- Otsikko on Kansisuunnittelija.
- Kahdeksan pohjaa, etu- ja takakansitekstit, oma selkäteksti, omat kuvat, värit, fontti, muokkaushistoria.
- Oletuksena koko kansi ja apuviivat näkyvät. Mitat päivittyvät suoraan hinnastosta. Kuvien DPI ja tekstien turva-alueet tarkistetaan.
- Sininen ulkoalue on 5 mm leikkuuvara, punainen leikkuu-/taivelinja, oranssi tekstin turva-alue. Näitä ei viedä PDF:ään.
- Alle 6 mm:n selkään ei viedä selkätekstiä. Muut ylivuodot varoitetaan.
- Kirjasinkoko näytetään todellisina pisteinä valitun koon mukaan.
- PNG-esikatselu ja muokattava työtiedosto (kansitiedot, painatustiedot ja oma kuva) ovat ladattavissa.
- Uusi PDF-vienti: koko kansi, todellinen millimetrisivukoko, TrimBox/BleedBox, 300 dpi:n JPEG-upotus. Tekstit ovat rasteroituja, joten PDF ei tarvitse ulkoisia fontteja. Vienti ei sisällä apuviivoja.
- PDF on RGB-aineisto, EI luvattu PDF/X- tai CMYK-painovalmis tiedosto. Väriprofiili, alkuperäisten kuvien tarkkuus ja ISBN on vielä tarkistettava painoa varten.
- Esimerkki: 148 × 210 mm, 80 g, 160 sivua: selkä 9 mm, kansi 315 × 220 mm, TrimBox 5/5/310/215 mm. PDF avattu pypdf:llä ja renderöity pypdfium2:lla; visuaalinen tarkistus tehty.

## Käsikirjoitus ja tilauksen esikatselu
- Asiakkaan nimi, sähköposti, puhelin (vapaaehtoinen) ja kotiintoimitusosoite.
- Yksi PDF tai DOCX, enintään 8 MiB. Sisällön tunniste tarkistetaan. PDF:n salasana-/aktiivisisältömerkit torjutaan; DOCX:n keskushakemisto ja puretut kokorajat tarkistetaan, makrot hylätään. Tämä ei ole täydellinen haittaohjelmatarkistus.
- Käsikirjoitusta ei renderöidä eikä pureta; sitä ei tallenneta IndexedDB:hen tai palvelimelle. Sivumäärää ei automaattisesti varmenneta liitteestä: asiakas vahvistaa painovalmiin PDF:n koon ja sivumäärän.
- Esikatselu muodostaa .eml-sähköpostiluonnoksen osoitteeseen info@thunderkustannus.fi. Mukana erittely, kansiluonnos-RGB.pdf, käsikirjoitus ja kansiprojekti.json. Enintään 20 MiB:n MIME-luonnos.
- Mitään ei lähetetä eikä veloiteta. Maksulinkkeihin, Stripeen tai sähköpostitiliin ei koskettu.
- Ei uutiskirjetilausta tai automaattista yhteystietojen siirtoa.
- Painatuspaketti ei lupaa verkkokauppajakeluja. Julkaisupalvelut ovat erillinen linkki.
- Ennen livekäyttöä tarvitaan tunnistettu, kiintiöity ja virustarkistettu yksityinen aineistovastaanotto, luotettava tilaustallennus ja omistajailmoitus sekä tähän dynaamiseen hintaan sidottu maksuvaihe. Näitä ei korvata avoimella anonyymillä tiedostolähettimellä.

## Tallennus ja suojaus
- IndexedDB-automaattitallennus yhdelle nykyiselle kansiluonnokselle (650 ms). Työtiedostolla siirto toiselle laitteelle. Asiakastiedot ja käsikirjoitus eivät sisälly automaattitallennukseen.
- Kuvat: JPG/PNG, 12 MiB, enintään 24 MP / 12 000 px. Uudelleenkoodataan enintään 3600 px:n JPEG-kuvaksi, dataURL enintään 12 miljoonaa merkkiä. Alkuperäistä tiedostoa ei muuteta.
- Työtiedosto enintään 16 MiB. Zod tarkistaa version, tuotantoyhdistelmän, tekstipituudet, mitoituksen, kuvat ja värit; vanhat luonnokset saavat uudet oletuskentät.
- Ei ulkoisia kuva-URL:eja, SVG:tä, uutta julkista API:a tai maksullisia palveluja. Editorin sisältö on manus-no-record-alueella. Ei sisältöä analytiikkaan.
- Ei julkaisemista ennen käyttäjän erillistä hyväksyntää.

## Tarkistettu
17 tarkoituksenmukaista testiä läpäisty. Kaikki hinnaston selkämitat ja määrähinnat tarkistettu yhteistä lähdettä vasten; 5 mm joka reunalla, toimitus kerran, taiton lisäys, virheelliset tuotantotiedot ja tiedostot hylätään.
Selaimessa todennettu hinnan ja selän muutos, laskurista tulevien tietojen siirtyminen, selkätekstin sijoittelu, PDF-lataus, lomake/aineistoliite sekä .eml:n kolme liitettä ja täydellinen erittely. Testitiedoissa käytettiin vain keksittyä asiakasta.


## Painotalojen tekninen auditointi 26.10.2026
Katso COVER_TECHNICAL_AUDIT.md. Selkätekstin raja 6 mm ja sivuturva 1,5 mm; erillinen RGB-luonnoksen tuotantotaitto vaaditaan aina. Kuvan leikkuuvara jatkaa nyt oikeaa kuvaa, ei venytettyjä reunapikseleitä. Julkaisua ei tehty.

## Julkinen vaihe
Kuvat ja luonnokset käsitellään paikallisesti. Uusia tiedostovastaanotto- tai sähköpostipäätepisteitä ei avata. Tilauslomakkeen EML-esikatselu on vain kehitysympäristössä; julkinen käyttäjä ohjataan nykyiseen tarjouspyyntölomakkeeseen, johon siirtyvät vain validoidut painatustiedot, eivät tiedostot tai yksityiset kansitekstit. Myyntisuppilo rakennetaan julkaisun jälkeen erikseen.
