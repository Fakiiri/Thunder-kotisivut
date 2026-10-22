# Julkaisutesti – toteutus ja käyttöönotto

## Ennen rakentamista ratkaistut sudenkuopat
- Ei väitettä Suomen ensimmäisestä testistä, paremmasta myynnistä tai julkaisukelpoisuuden toimituksellisesta arvioinnista. Testi on ohjaava itsearvio.
- Keskeneräiselle tekstille ensin viimeistelyohje, ei ostopakkoa. Premium vain näkyvyyden avun tarpeesta, ei tietokirjailijuudesta tai suuresta painosmäärästä.
- Sähköposti pyydetään vasta vastausten jälkeen. Perustulos on saatavilla myös ilman osoitetta; tulos ja henkilökohtainen toimintasuunnitelma voidaan tilata sähköpostiin. Markkinointilupa on erillinen ja vapaaehtoinen.
- Kahdeksan kysymystä, yksi kerrallaan, ei ajastinta, ei automaattista siirtymistä. Takaisin-painike, näppäimistökäyttö ja mobiilin kosketuskohteet.
- Ei uusia maksullisia palveluja: nykyinen MySQL ja Brevo. Lähetykset tietokantajonosta, ei selaimen ajastimista. Brevon virhe ei hävitä liidiä.
- Ostaneet / peruneet / yhteydenottopyynnön jättäneet pois jatkoviesteistä; Brevon estot ja ostajalista tarkistetaan ennen jokaista jatkoviestiä. Epäonnistunut tarkistus estää lähetyksen.
- Analytics vain evästesuostumuksella, ei sähköposteja, nimiä, puhelimia, vastauksia tai tunnisteita GA:han.
- Ajanvaraus: https://calendar.app.google/3fFXKiKe7dixDnQi8. Käyttäjän toimittama linkki tarkistettu: ”15 min / Santeri”, Santeri Sandberg, WhatsApp-puhelu asiakkaan antamaan numeroon. Tiian varaussivua ei muutettu.
- Kalenteriin siirtyminen pysäyttää jatkoviestit varmuuden vuoksi. Tapahtumaa ei kutsuta vahvistetuksi ajanvaraukseksi. Google huolehtii varsinaisesta varauksesta ja vahvistuksesta.

## Sarja
Heti: pyydetty tulos, kolme konkreettista askelta ja mahdollisuus pyytää puhelua. Päivä 2: käsikirjoituksen valmistelu, päivä 5: vaihtoehtojen vertailu ja puhelupyyntö. Kaksi jälkimmäistä vain erikseen luvan antaneille. Ei liittymistä yleiseen uutiskirjeeseen.

## Julkaisuraja
Paikallinen esikatselu ja testit ensin. Ei tuotantojulkaisua eikä oikeita testiviestejä asiakkaiden osoitteisiin ilman käyttäjän julkaisuhyväksyntää.

## Toteutettu kokonaisuus
- `/julkaisutesti`: kahdeksan kysymystä, kahdeksan henkilökohtaista tulostekstiä ja kolme pakettisuositusta, oma kolmen askeleen suunnitelma, sähköpostitilaus ja ajanvarausohjaus.
- CTA etusivulla heti kampanjabannerin jälkeen, oppaissa, Oppaat-näkymässä ja hinnastosivulla. Sivukartta ja palvelinrenderöinti mukana.
- Sähköpostilomake profiilin jälkeen. Halutessaan kävijä voi lukea toimintasuunnitelman ilman osoitetta. Tämä vähentää epäluottamusta; sähköpostin arvo on suunnitelman säilyttäminen ja varauslinkki.
- Vastaukset ja suostumuksen tarkka sanamuoto tallennetaan nykyiseen MySQL:ään. Nimi vapaaehtoinen. Käsikirjoitusta ei kerätä.
- Brevoon muodostetaan käyttöönotossa oma kansio `Thunder – julkaisutesti` ja viisi listaa: tuloksen pyytäneet, jatkoviestiluvan antaneet sekä Digi/Printti/Premium. Muut uutiskirjelistat eivät muutu eikä niiden sarjoihin lisätä ketään.
- Jokaisesta uudesta tulosviestin tilaajasta ilmoitus osoitteeseen info@thunderkustannus.fi. Ilmoituksessa profiili, vastaukset, lähde ja markkinointilupa. Vastaa asiakkaalle samasta osoitteesta.
- MySQL-lähetysjono jatkaa palvelimen uudelleenkäynnistyksen jälkeen. Brevon lähetyksen idempotenssiavain ehkäisee tuplia. Epäselvät toimitukset siirretään tarkistettaviksi; niitä ei lähetetä loputtomasti uudelleen.
- Enintään yksi tulosviesti / osoite / UTC-vuorokausi. Sama alkuperäinen pyyntö voi yrittää tallennusta uudelleen. Toisen samalla osoitteella tehdyn pyynnön kautta ei palauteta aiempaa yksityistä tuloslinkkiä.
- Testin peruutuslinkki näyttää vahvistuksen ennen peruutusta; sähköpostin linkkiskannerin GET ei yksin peruuta tilausta. List-Unsubscribe-POST tukee yhden napsautuksen peruutusta.
- Brevon markkinointiestot ja ostajalista #10 tarkistetaan ennen jatkoviestejä. Nykyisten neljän paketin ostot tarkistetaan myös suoraan `payment_orders`-taulusta ennen Brevo-synkronointia. Muut lasku-/erikoistilaukset on lisättävä ostajalistalle #10 käsin. Tunnetut neljä poissuljettua osoitetta on lisäksi estetty koodissa.
- Oma tietosuojaseloste. 180 päivän säilytys ja Brevon testilistojen siivous. Muiden listojen tilaajia tai ostajia ei poisteta Brevosta kokonaan.

## Seuranta
GA4-tapahtumat: `quiz_cta_click`, `quiz_start`, `quiz_step`, `quiz_complete`, `quiz_lead_saved`, `quiz_booking_click`, `quiz_package_click`.
Ulottuvuudet: `profile`, `step`, `cta_location`. Ei yhteystietoja tai vastausten sisältöä. Yksityiset tulostunnisteet poistetaan selaimen osoitteesta ennen ulkopuolisia seurantaskriptejä. Meta Pixel latautuu nyt vasta markkinointievästeiden hyväksymisen jälkeen; vanha rikkinäinen Umami-paikkamerkkiskripti poistettiin.
GA4:n raportti käyttöönotossa: aloitus → valmistuminen → tallennettu liidi → kalenterin avaus. Merkitse `quiz_lead_saved` avaintapahtumaksi; `quiz_booking_click` on vain klikkaus, ei varaus eikä kauppa. Vahvistettu kauppa tulee maksujärjestelmästä. Elävää GA-vastaanottoa ei ole vielä todennettu.

## Käyttöönotto julkaisuhyväksynnän jälkeen
1. Santerin maksuton 15 minuutin varauskalenteri on tarkistettu. Asiakas antaa puhelinnumeron varauksen yhteydessä; Santeri soittaa WhatsApp-puhelun, ellei muuta sovita.
2. Railwayn nykyiselle sivustopalvelulle `QUIZ_ENABLED=true` (varauslinkki on koodin oletusarvona; `QUIZ_BOOKING_URL` mahdollistaa tarvittaessa korvaamisen). Nykyiset `DATABASE_URL`, `BREVO_API_KEY`, `ORDER_NOTIFY_EMAIL`, `ORDER_SENDER_EMAIL` ja `BREVO_BUYER_LIST_ID` käytetään uudelleen. Avaimia ei tulosteta.
3. Sovellus luo omat kolme quiz-taulua nykyiseen MySQL:ään. Epäonnistunut quiz-käynnistys ei estä muuta sivustoa. Ilman vahvistettua varauslinkkiä sähköpostikeruu jää pois päältä ja näyttää rehellisen ilmoituksen.
4. Tarkistetaan Brevon oma kansio/listat, yhden testi-ilmoituksen ja tulosviestin toimitus vain Santerin hyväksymään testiosoitteeseen sekä peruutus. Käyttö tapahtuu nykyisen Brevo-tilauksen lähetysrajojen puitteissa.
5. Todennetaan GA4 DebugView, mobiili, ajanvaraus ja tunnetun ostajan poissulku. Julkaisu ei ole valmis ennen näitä käyttöönoton tarkistuksia.

## Ylläpito / poikkeamat
Railwayn lokeihin kirjoitetaan vain toimituksen tila ja viestin tyyppi, ei osoitteita tai avaimia. `quiz_outbox.status='review'` vaatii tarkistuksen Brevon lähetyslokista ennen mahdollista uutta lähettämistä. Esimerkkitarkistus:
```sql
SELECT kind,status,COUNT(*) FROM quiz_outbox GROUP BY kind,status;
```
Manuaalinen pysäytys asiakkaalle: lisää sähköposti Brevon ostajalistalle #10 (tai pyydetty peruutus testin omasta linkistä). Henkilökohtainen vastaus yksin ei pysäytä sarjaa, ellei asiakas siirry kalenteriin tai tieto kirjata erikseen. Ostoksi kirjattu sähköposti on oltava sama kuin testissä; poikkeava osoite vaatii käsin yhdistämisen.
Poiskytkentä: `QUIZ_ENABLED=false` pysäyttää oman työntekijän. CTA-komponentti, reitti ja sivukarttamerkintä ovat erillisiä, joten testin voi ottaa pois ilman pakettisivujen sisällön uudelleenkirjoittamista.

## Tarkistuksen tila
Lopullinen koko testiajo: 51/51 läpi (9 tiedostoa). Tyyppitarkistus ja tuotantokäännös onnistuvat. Kalenterin turvallinen ohjaus ja evästeluvan korjaus mukana testeissä. Tuotannon MySQL-kirjoitusta, Brevon oikeaa viestitoimitusta, Google-varauksen vahvistusta tai GA4-vastaanottoa ei ole vielä todennettu.
Paikallinen esikatselu: http://localhost:5194/julkaisutesti. Sähköpostien esikatselut: `outputs/Julkaisutesti_2026/viestit.html`. Mitään ei ole julkaistu eikä asiakkaiden sähköposteja lähetetty tämän toteutuksen aikana.

Julkaisuhyväksyntä saatu 22.10.2026. Tuotannon käyttöönoton tila kirjataan erikseen tarkistusten jälkeen.
