# Maksut ja tilauksen jälkeiset viestit

Toteutus on paikallisessa haarassa `payment-order-automation`. Ei julkaistu, eikä oikeita maksuja tai sähköposteja ole tehty. Ostopainikkeet käyttävät edelleen tarjouspyyntöä, kun oikeaa maksulinkkiä ei ole annettu. Maksuautomaatio on oletuksena pois käytöstä.

## Ehdotettu asiakkaan polku

1. Asiakas valitsee Digi-, Printti- tai Premium-paketin etusivulta tai hinnastosta.
2. Oikea Stripe Payment Link avaa maksusivun. Klarna näkyy siellä vain, jos se on käytettävissä kyseiselle tilaukselle.
3. Stripe ilmoittaa palvelimelle onnistuneesta maksusta. Sivulle palaamista ei käytetä maksun todisteena.
4. Tilaus ja kolme erillistä tehtävää tallennetaan MySQL:ään: ostajan lisääminen Brevon Tilanneet-listalle #10, ilmoitus Santerille sekä asiakkaan kiitosviesti.
5. Työntekijä käsittelee tehtävät viiden sekunnin välein. Uudelleen toimitettu Stripe-ilmoitus ei luo samaa tilausta tai viestitehtäviä uudelleen.
6. Asiakas saa pakettikohtaisen ohjeen ja yhteydenottolupauksen. Santeri ottaa asiakkaaseen yhteyttä ja kertoo aineiston toimittamisesta.

Vahvistettu: ilmoitukset osoitteeseen info@thunderkustannus.fi. Yhteydenotto yhden arkipäivän kuluessa maksun vahvistumisesta. ORDER_RESPONSE_WINDOW=business-day.

## Tarvitaan maksulinkkien tekijältä

- Jokaisen paketin nimi, julkinen `https://buy.stripe.com/...` maksulinkki ja Payment Linkin `plink_...` tunniste.
- Veloitettava loppusumma sentteinä ja valuutta EUR. Summan pitää sisältää samat verot ja toimitukset kuin sivulla ilmoitettu hinta. Pakettien hintoja ei ole muutettu tässä toteutuksessa.
- Maksulinkit kertamaksuina (`mode=payment`), kiinteä määrä 1. Mahdolliset alennuskoodit ja muuttuvat toimitus-/verohinnat pitää huomioida palvelimen hintatarkistuksessa erikseen ennen niiden sallimista.
- Asiakkaan sähköpostiosoite kerätään kassalla. Paluuosoitteeksi voi asettaa `https://thunderkustannus.fi/tilaus-kiitos` vasta sivuston julkaisun jälkeen.
- Klarna aktivoidaan Stripe-tilillä ja tarkistetaan jokaiselle tuotannossa käytettävälle maksulinkille. Sivuston maininta ei itsessään ota Klarnaa käyttöön.
- Webhook-osoite: `https://thunderkustannus.fi/api/payments/stripe/webhook`.
- Webhookin tapahtumat: `checkout.session.completed` ja `checkout.session.async_payment_succeeded`. Jälkimmäinen hoitaa viivästyneesti vahvistuvat maksut. `unpaid`-tilassa ei lähetetä kiitosviestiä.
- Webhookin allekirjoitussalaisuus asetetaan hosting-palvelun `STRIPE_WEBHOOK_SECRET` muuttujaan. Ei chattiin, lähdekoodiin tai `VITE_*` muuttujiin. Stripe-salaista API-avainta ei tarvita tähän vastaanottavaan toteutukseen.
- Stripen omat onnistuneen maksun sähköposti-ilmoitukset Santerille sekä asiakkaan maksukuitti kannattaa ottaa käyttöön lisäksi. Brevon kiitosviesti ei korvaa maksukuittia.

## Käyttöönotto

1. Käytä `.env.payments.example` muuttujaluetteloa. Sivuston julkiset linkit ovat `VITE_STRIPE_DIGI_PAYMENT_LINK`, `VITE_STRIPE_PRINTTI_PAYMENT_LINK`, `VITE_STRIPE_PREMIUM_PAYMENT_LINK` ja tarvittaessa `VITE_STRIPE_JOULU990_PAYMENT_LINK`.
2. Syötä `STRIPE_PAYMENT_LINK_MAP`, esimerkiksi `{"plink_OIKEA_TUNNISTE":{"packageId":"digi","amountCents":89000}}`. Tämä on muotoesimerkki, ei valmis linkki tai hintavahvistus. Pakettiavaimet: digi, printti, premium, joulu990.
3. Varmista nykyisen MySQL:n `DATABASE_URL`. Aja `drizzle/payment-orders.sql` kerran tätä varten; muutokset eivät poista vanhoja tauluja. Määritä tilausdatan säilytysaika käyttöönotossa.
4. Aseta palvelimelle `BREVO_API_KEY`, vahvistettu `ORDER_SENDER_EMAIL`, `ORDER_NOTIFY_EMAIL` sekä `BREVO_BUYER_LIST_ID=10`. Listan #10 pitää olla tämän tilin oikea Tilanneet-poissulkulista, kuten nykyisissä kampanjoissa #17–21. Asiakasta ei lisätä uutiskirjelistoille eikä hänen markkinointikieltoaan poisteta.
5. Aseta `ORDER_RESPONSE_WINDOW=business-day`. Aseta testissä `STRIPE_MODE=test` ja testi-webhookin salaisuus.
6. Aktivoi `PAYMENTS_ENABLED=true` vasta, kun muuttujat ja tietokantataulut ovat kunnossa. Testaa Stripe-testimaksulla. Ympäristömuuttujaan tehty frontend-linkkimuutos edellyttää uutta sivustokoontia.
7. Testaa viivästynyt maksu, sama webhook kahdesti, samasta Checkout Sessionista tulevat kaksi onnistumistapahtumaa, väärä allekirjoitus sekä tilanne, jossa Brevo on hetken poissa käytöstä. Varmista tietokannasta yksi tilaus ja kolme yksilöllistä tehtävää, oikea sähköposti molemmille vastaanottajille sekä Tilanneet-listan jäsenyys.
8. Testaa, että Tilanneet-listalle lisätty testikontakti puuttuu seuraavan myyntiviestin vastaanottajista. Jos asiakas käyttää maksussa eri osoitetta kuin uutiskirjeessä, myös alkuperäinen osoite pitää lisätä listalle käsin.
9. Vaihda tuotantoon `STRIPE_MODE=live`, tuotannon webhook-salaisuus ja tuotannon maksulinkit. Kytke `VITE_KLARNA_ENABLED=true` vasta Klarna-tarkistuksen jälkeen. Älä tee testimaksua oikealla rahalla ilman erillistä lupaa.

## Viestit ja virheiden käsittely

Asiakkaan viestin otsikko on ”Kiitos tilauksestasi – Digi-paketti” (tai ostettu paketti). Teksti: ”Kiitos ostostasi! Olemme vastaanottaneet maksusi. Otamme sinuun yhteyttä yhden arkipäivän kuluessa ja annamme ohjeet aineiston toimittamista varten.” Arkipäiväversio on toteutettu vaihtoehdoksi. Pakettikohtainen valmistautumisohje tulee tämän jälkeen; asiakkaan ei tarvitse lähettää tiedostoja vielä.

Santerin erillisessä viestissä ovat paketti, asiakkaan nimi, sähköposti, oikeasti maksettu summa ja tilaustunnus. Asiakas ja Santeri eivät ole toistensa kopiona.

Lähetykset käyttävät tietokantaan tallennettua pysyvää tehtävätunnusta ja Brevon idempotenssiavainta. Brevon deduplikointiaika on rajallinen: toistoja yritetään vain lyhyen aikaikkunan sisällä. Viiden epäonnistuneen yrityksen jälkeen tai epäselvän lähetyksen vanhennuttua tehtävä jää `review`-tilaan eikä sitä lähetetä automaattisesti uudelleen. Näin vältetään pitkän katkon jälkeinen sokkona tehtävä tuplalähetys. Tarkistus edellyttää lokien/Brevon tapahtumien ja tietokantajonon läpikäyntiä; automaattista häiriöpäivystystä ei ole asennettu.

Tarkistus tietokannasta: `SELECT id,kind,status,attempts,last_error FROM payment_outbox WHERE status <> 'done';`. `review`-tehtäviä ei saa nollata ennen Brevon lähetyslokien tarkistamista. Korttitietoja, raakaa webhook-sisältöä tai API-avaimia ei tallenneta tilaustauluun.

## Sivuston kuvien ja somelinkkien muutokset

- Paikallinen, 1200 × 630 PNG-jakokuva: `client/public/og-image.png`. Staattiset Open Graph / Twitter -tagit ja sivukohtainen SEO-hook käyttävät samaa tiedostoa.
- Sivuston kuvake `client/public/favicon.svg` on mukana repossa.
- Instagram-linkki on ennestään `https://www.instagram.com/thunderkustannus/`. Näkyvä Facebook-linkki lisättiin osoitteeseen `https://www.facebook.com/thunderkustannus`, joka oli jo sivuston omissa organisaatiotiedoissa. Tilien julkista sisältöä/omistajuutta ei saatu riippumattomasti vahvistettua; tarkista, jos käytössä on eri osoite.
- Klarna-maininta on valmisteltu etusivun pakettiosioon ja hinnastoon. Se näkyy vasta, kun oikea maksulinkki on asetettu ja Klarna-lippu on vahvistetusti päällä.

## Lähteet

- https://docs.stripe.com/payment-links/post-payment
- https://docs.stripe.com/events/manage-webhook-endpoints
- https://docs.stripe.com/payments/klarna
- https://developers.brevo.com/reference/send-transac-email
- https://developers.brevo.com/changelog/2021/11/10


## 16.10.2026: ensimmäinen maksulinkki saatu
- Julkinen linkki: https://buy.stripe.com/00w4gz4px0SV4kz7KH8g000
- Maksusivulta tarkistettu nimi: Kirjan julkaisupaketti; EUR-hinta 990,00 €. Pakettiavain joulu990.
- Santeri vahvisti Klarnan. Kampanjan ostopainike ja sen Klarna-maininta on kytketty tähän linkkiin lähdekoodissa. Muiden pakettien maksulinkkejä ei ole saatu.
- Vanha banneri on piilossa 15.10. päättymisen vuoksi. Uusi näkyvyysaika/ostopainikkeen sijoitus odottaa vahvistusta. Mitään ei ole julkaistu.
- Stripe-hallinnassa asetettava maksun jälkeinen URL https://www.thunderkustannus.fi/tilaus-kiitos vasta sivun julkaisemisen jälkeen.
- Tarvitaan vielä oikea plink_-tunniste (julkinen URL ei ole tämä tunniste), webhookin allekirjoitussalaisuus palvelimelle, Brevo- ja tietokantakytkennän varmennus sekä testaus. Ilmoitukset info@thunderkustannus.fi; yhteydenotto yhden arkipäivän kuluessa.
- Tarkistuksessa Stripe tarjosi myös TRY-valuuttamuunnosta selaimen sijainnin perusteella. Nykyinen maksuvahvistus hyväksyy vain EUR 990,00 €. Poista Adaptive Pricing / valuuttamuunnos tältä linkiltä tai toteuta ja testaa alkuperäisen EUR-hinnan tarkistus ennen automaation aktivointia. Muussa valuutassa onnistunutta maksua ei nykyisellään käsitellä automaattisesti.

## Viimeisin vahvistus: kampanja ja mittaus
Kampanja aktivoitu paikalliseen versioon uudelleen, poistuu 26.10.2026 klo 00.00 Suomen aikaa. Päiväys näkyy 25.10. asti. Sekä formaattikuvat että niiden painikkeet ovat linkkejä; muut maksulinkit odottavat toimitusta. Seurannan toteutus ja Google-hallinnassa tehtävät asetukset: PAYMENT_ANALYTICS.md. Ei julkaistu, ei oikeita maksuja tai sähköpostilähetyksiä. GA-hallinta ja Stripe/Railway-kytkennät odottavat pääsyä.

## 17.10.2026: kaikki maksulinkit saatu
- Digi 890 €: https://buy.stripe.com/4gM28rg8f9pr7wL9SP8g001
- Printti 1 690 €: https://buy.stripe.com/eVqcN5e078ln04j5Cz8g002
- Premium 2 990 €: https://buy.stripe.com/bJe8wPg8f0SVbN18OL8g003
- Kampanja 990 €: https://buy.stripe.com/00w4gz4px0SV4kz7KH8g000
- Julkiset linkit tallennettu pysyvästi lähdekoodiin shared/payment-links.ts. Tavalliset painikkeet avaavat Stripen, ei upotettua maksulomaketta.
- Kiitossivu: https://www.thunderkustannus.fi/kiitos (aiempi /tilaus-kiitos toimii myös). Julkaistava ennen kuin Claude vaihtaa Stripen paluuosoitteet.
- Etusivun painettu formaatti ohjaa Printti-pakettiin; ääni ja e-kirja Digi-pakettiin, joka sisältää molemmat. Hinnaston kolme pakettia ohjaavat omiin linkkeihinsä. Kampanja piiloutuu 26.10. klo 00.00.
- Käyttäjä haluaa Stripen muutokset Clauden kautta. Tämän agentin Stripe-kirjautuminen suljettu. Railway-kirjautuminen pyydetty.

### Tarkennus aiempaan valuuttahuomioon
Stripen nykyisessä Checkout Session -tapahtumassa currency ja amount_total ovat alkuperäisessä integraatiovaluutassa. Asiakkaalle esitetty paikallisvaluutta on presentment_details-kentässä. Nykyinen EUR-tarkistus sopii tähän; Adaptive Pricingin poistamista ei siksi edellytetä nykyisellä tapahtumamuodolla. Vanhan Stripe API -version tapahtumamuoto pitää varmistaa oikeasta testitapahtumasta ennen aktivointia. Aiempi vaatimus valuuttamuunnoksen poistamisesta on tämän osalta korvattu.
Lähde: https://docs.stripe.com/payments/currencies/localize-prices/adaptive-pricing?payment-ui=stripe-hosted (Event destinations and reporting).

### Tilauslistat
BREVO_PACKAGE_LIST_MAP määrittää oikeat ostajalistat Digi-, Printti-, Premium- ja kampanjapaketeille. Asiakas lisätään ostamansa paketin listaan sekä yhteiseen poissulkulistaan #10. Ei uutiskirjetilausta eikä markkinointikiellon nollausta. Aktivointi edellyttää jokaiselle käytössä olevalle paketille oikeaa listatunnistetta.

### Brevo-listat luotu ja tarkistettu 17.10.
- #11 Tilaukset – Digi-paketti
- #12 Tilaukset – Printti-paketti
- #13 Tilaukset – Premium-paketti
- #14 Tilaukset – Kirjan julkaisupaketti 990 €
- Yhteinen ostaneiden poissulkulista #10 säilyy käytössä. Uudet listat ovat tyhjiä, eikä listojen luonti käynnistänyt sähköposteja.
- Palvelimen arvo: BREVO_PACKAGE_LIST_MAP={"digi":11,"printti":12,"premium":13,"joulu990":14}
- Railway ohjasi GitHub-kirjautumiseen. Käyttäjä ilmoitti kirjautuvansa; palvelinasetuksia ei ole vielä luettu tai muutettu.
- Julkaisua tai sähköpostiautomaation aktivointia ei ole tehty. Puuttuvat plink-tunnisteet ja webhookin salaisuus tarkistetaan palvelimelta kirjautumisen jälkeen. Niitä ei päätellä julkisten linkkien lyhyistä tunnisteista.
