# Maksupainikkeiden seuranta

Paikallinen toteutus, ei vielä julkaistu. Käytetään sivuston olemassa olevaa GA4-tunnusta `G-CPH1G8WHXE`. Uutta rinnakkaista Google-tagia ei lisätä.

## Mitä mitataan

`package_cta_click`: yksi tapahtuma jokaisesta paketti-/formaattipainikkeen klikkauksesta.

| Parametri | Arvot |
| --- | --- |
| package_id | joulu990, digi, printti, premium, printed, audio, ebook |
| cta_location | home_campaign, home_formats, home_packages, pricing_packages |
| destination_type | stripe_checkout tai enquiry (puuttuva maksulinkki ohjaa nykyiseen tarjouspyyntöön / formaattikortista hinnastoon) |
| page_path | sivun polku, ilman kyselyparametreja |

`begin_checkout`: vain kun painike vie oikeaan Stripe-maksulinkkiin. Sisältää saman sijainnin ja pakettiavaimen sekä items-listan. Ei raportoida klikkausta toteutuneena ostona. Ei keksittyä arvoa tai hintaa puuttuville linkeille.

Mittaus tapahtuu vain, jos käyttäjä on sallinut analytiikan nykyisessä evästebannerissa. Kieltäneet, mainosestot ja muut selaimen estot voivat jäädä mittauksen ulkopuolelle. Henkilötietoja, sähköpostia, tilausnumeroita tai URL-kyselyparametreja ei lisätä tapahtumiin. Ctrl/Cmd-klikkaus ja uusi välilehti säilyvät. Tavallinen siirtyminen odottaa mittausta korkeintaan 400 ms.

## Google Analyticsin hallinnassa vielä tehtävät asiat

1. Varmista oikea GA4-omaisuus ja sivuston datavirta.
2. Hallinta → Mukautetut määritelmät: luo tapahtumakohtaiset ulottuvuudet `package_id`, `cta_location` ja `destination_type`. Niitä ei voi luoda pelkällä sivuston koodilla.
3. Tee vapaamuotoinen raportti: rivit paketti + painikkeen sijainti, sarakkeet kohteen tyyppi, mittarit tapahtumamäärä ja käyttäjät; rajaus event_name = package_cta_click. Tarkastele begin_checkout erikseen, älä summaa sitä saman klikkauksen kanssa.
4. Tarkista testiklikaus DebugView'ssa / reaaliajassa ensin esikatselusta tai erillisestä testiomaisuudesta. Testissä ei makseta. Älä merkitse package_cta_click-tapahtumaa purchase-ostoksi.
5. Julkaisun jälkeen tarkista raportoinnin kertyminen. Tässä vaiheessa Google-hallinnan raportteja ei ole luotu eikä tuotantokeräystä vahvistettu.

Toteutunut kauppa varmistuu Stripe-webhookista ja tilausrekisteristä. GA4:n palvelinpuolista purchase-mittausta tai mainonnan ostokonversiota ei vielä ole toteutettu; se vaatii erillisen suostumuksen ja istunnon yhdistämisen suunnittelun. Kiitossivun avaaminen ei todista maksua.

## Linkkien sijoittelu

- Etusivun kampanja: 990 € linkki valmiina.
- Etusivun hinnat ja /hinnat: Digi, Printti, Premium odottavat omia linkkejä.
- Etusivun kolme formaattikuvaa: painettu, ääni ja e-kirja odottavat niille tarkoitettuja linkkejä. Näitä ei yhdistetä arvauksella eri sisältöisiin paketteihin. Kun samat linkit tarkoittavat myös hinnaston paketteja, vahvista kohdistus.
- Kampanja näkyy heti ja poistuu 26.10.2026 klo 00.00 Suomen aikaa. Muistetaan talviaikaan siirtyminen 25.10.

Viite: https://developers.google.com/tag-platform/gtagjs/reference ja https://developers.google.com/tag-platform/security/guides/consent

## Toteutettu Google-hallinnassa 17.10.2026
- Tili Thunder Kustannus; mittauskokonaisuus thunderkustannus.fi (535218601).
- Kolme tapahtumakohtaista omaa ulottuvuutta tallennettu: Julkaisupaketti / package_id, Ostopainikkeen sijainti / cta_location, Ostopainikkeen kohde / destination_type.
- Tallennettu kartoitus: Thunder – maksupainikkeiden klikkaukset.
- Raportti: https://analytics.google.com/analytics/web/#/analysis/a393119282p535218601/edit/EX0gLkz0RAyCIVcvdRFH5A
- Rivit: Julkaisupaketti + Ostopainikkeen sijainti. Sarakkeet: Ostopainikkeen kohde. Arvo: Tapahtumien määrä. Suodatin: Tapahtuman nimi on sama kuin package_cta_click. Raportin oletusjakso 28 viime päivää.
- Paikallisen esikatselun oikea testiklikkaus varmistettu Google Analyticsin reaaliaikaraportista: package_cta_click = 1, begin_checkout = 1, cta_location = home_campaign. Siirtyminen Stripeen onnistui. Maksua ei tehty eikä mitään asiakkaan tietoja syötetty.
- Testissä hyväksyttiin vain analytiikka, markkinointievästeet jätettiin pois. Raporteissa on tämän vuoksi yksi aito tekninen testiklikkaus, ei asiakkaan osto.
- Todistekuvat: outputs/Maksut/analytics_ulottuvuudet.png, analytics_klikkausraportti.png ja analytics_testiklikkaus.png työtilan juuressa.
- Sivustoa ei julkaistu. Tuotantosivuston seuranta alkaa vasta julkaisun jälkeen; uuden mukautetun raportin tietojen käsittelyssä voi olla viive.

## Neljän maksulinkin kytkentä 17.10.
Digi, Printti ja Premium ovat kytkettyinä hinnastossa ja etusivun pakettikorteissa. Formaattikortit ohjaavat nyt painetusta kirjasta Printtiin sekä äänestä ja e-kirjasta Digiin. Mittaus erottaa nämä kolme korttia sijaintiarvoilla home_printed, home_audio ja home_ebook, vaikka kaksi korttia ohjaa samaan Digi-pakettiin. Aiempi home_formats jää historiallisten tietojen lukemiseen. Aktiiviset cta_location-arvot ovat home_campaign, home_packages, pricing_packages, home_printed, home_audio ja home_ebook. Google Analyticsin olemassa oleva sijaintiulottuvuus ja raportti näyttävät nämä arvot ilman uusia määrityksiä.
