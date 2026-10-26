# Kansisuunnittelijan automaatio – tilanne 26.10.2026

## Mitä on tehty
- Paikallinen toteutus: henkilökohtainen käyttölinkki, suojattu istunto ja yksityiset kansiprojektit.
- Painovienti: CMYK, upotetut fontit, 5 mm leikkuuvarat, hinnaston selkämitat, saman tallennetun version tarkistus ja hyväksyntä.
- Brevossa kaksi oikeaa automaatioluonnosta. Molemmat INACTIVE; mitään sähköpostia ei lähetetty eikä verkkosivua julkaistu.
- Projektin muuttuminen synnyttää pysyvään tietokantajonoon synkronointityön. Brevolle siirtyy sähköposti ja tarvittava listajäsenyys, ei kansitekstejä, kuvia, käsikirjoitusta eikä käyttölinkkiä.
- Häiriöitä yritetään uudelleen; pysyvä virhe tai kahdeksan epäonnistumista vaatii ylläpitäjän tarkistuksen.
- Hinnat ja mitoitus käyttävät olemassa olevaa hinnastoa. Painotalojen nimiä ei lisätty asiakasviesteihin.

## Brevon ylläpidettävät kohteet
| Kohde | Tunniste |
|---|---|
| Tervetuloa ja apu | automaatio 3 |
| Valmis kansi | automaatio 4 |
| Keskeneräinen / vahvistettu asiakas | lista 21 |
| Valmiiksi merkitty kansiversio | lista 22 |
| Henkilökohtaisessa palvelussa, keskeyttää sarjat | lista 23 |
| Ostanut, ei myyntisarjaa (olemassa oleva) | lista 10 |
| Tervetuloviesti | viesti 22 |
| Keskeneräisen kannen viesti | viesti 23 |
| Ensimmäisen polun viimeinen viesti | viesti 24 |
| Valmiin kannen viesti | viesti 26 |

Automaatiot: https://app.brevo.com/automation/edit/3 ja https://app.brevo.com/automation/edit/4
Listat: https://app.brevo.com/contact/list-listing

## Viestien ajankohta ja alku
| Milloin | Ensimmäinen lause |
|---|---|
| Heti käyttölinkkipyynnöstä, palveluviesti | Avaa oma kansiprojektisi henkilökohtaisesta käyttölinkistä. |
| Vahvistetulle vinkkien tilaajalle, tervetuloa | Kerro Santerille WhatsAppissa, missä vaiheessa kirjasi on, niin autamme seuraavan askeleen kanssa. |
| Kolme päivää aloituksesta, vain keskeneräinen | Jäikö kansi kesken — voimme auttaa kannen suunnittelussa tai koko kirjasi toteutuksessa. |
| Seitsemän päivää aloituksesta, edelleen keskeneräinen | Haluaisitko arvion kirjasi painatuksesta tai julkaisusta kirjakauppoihin? |
| Vuorokausi valmiiksi merkitsemisestä, ei tilausta | Kansi on valmis — seuraavaksi autamme tekemään siitä oikean kirjan. |
| Seitsemän päivää valmiiksi merkitsemisestä, ei tilausta | Haluaisitko arvion kirjasi painatuksesta tai julkaisusta kirjakauppoihin? |

Tervetulon käynnistää lisäys listaan 21 tai 22, joten myös heti valmistunut kansi huomioidaan. Kolmannen päivän haarassa vain listan 21 jäsen jatkaa; muu poistuu. Kun asiakas siirtyy 21:stä 22:een, ensimmäinen polku keskeytyy ja valmiin kannen polku alkaa. Kannen muokkaus mitätöi vanhan valmiusmerkinnän. Molempien polkujen uudelleenkäynnistys on pois päältä. Jos kansi valmistuu vasta ensimmäisen aloitussarjan päätyttyä, myös valmis-polku voi vielä alkaa: kokonaistavoitettavuus ei ole aina vain kolme viestiä.

Palvelin tarkistaa jonon 30 sekunnin välein. Tervetulon viiveeseen tulee lisäksi Brevon käsittelyaika. Osoite ja vinkkitilaus vahvistetaan ennen markkinointisarjaa. Pelkkä osoitteen kirjoittaminen ei käynnistä sitä.

## Myyntisarjan pysäyttäminen
- Maksutiedon tai listan 10 perusteella ostanut poistetaan myyntivaiheista.
- Kun WhatsApp-keskustelu tai henkilökohtainen tarjous alkaa: lisää henkilö listaan 23. Pelkkä WhatsApp-linkin avaus ei todista keskustelun alkaneen.
- Tavallisella laskulla tai eri osoitteella ostanut: lisää oikea osoite listaan 10 käsin.
- Brevon sähköpostiperuutus keskeyttää sarjat; vanhaa viestikieltoa ei kumota kirjautumisella.
- Aiemmin poissuljetut neljä osoitetta on huomioitu palvelimen säännöissä.
- Julkaisutestin myyntijatkot tauotetaan, kun asiakas on kansistudion aktiivisessa vaiheessa tai henkilökohtaisessa palvelussa. Asiakkaan pyytämä testitulos ei esty.
- Muissa uutiskirjekampanjoissa nämä aktiiviset listat pitää vielä rajata vastaanottajista. Kaikille kampanjoille yhteistä tilitason vuorokausikattoa ei ole tässä toteutettu.

## Käyttöönotto erikseen, ei tehty tässä työssä
1. Tarkista uuden toteutuksen toiminta oikealla MySQL-yhteydellä testiympäristössä: projektin tallennus + jonotyö samassa transaktiossa, uudelleenkäynnistys, kaksi työntekijää, ostotietojen kysely.
2. Ota yksityinen tallennus käyttöön nykyisellä palvelimella. Salausavain tallennetaan vain palvelimen ympäristömuuttujaan. Avain ei saa kadota tai vaihtua vahingossa, koska vanhat projektit eivät muuten avaudu.
3. Todenna aidon käyttölinkin toimitus erikseen hyväksytyllä testillä. Sen jälkeinen tuotanto-Brevo-polun läpimeno, peruutus ja ostajan keskeytys on yhä testaamatta.
4. Tarkista Brevon viestien esikatselu, erityisesti peruutuslinkki oikeassa toimituksessa. Molemmat polut säilytetään pois päältä tähän asti.
5. Julkaisu ja aktivointi vasta erikseen. Tämänhetkinen tuotantosivu ei saa näitä muutoksia paikallisesta koodista.

Palvelimen asetukset:
- COVER_ENABLED=true: yksityinen projektipalvelu
- COVER_VAULT_KEY: 64 heksamerkin salaisuus, ei keskusteluun
- DATABASE_URL: nykyinen MySQL
- COVER_ACCESS_EMAIL_ENABLED=true: oikeiden käyttölinkkiviestien lähetys
- COVER_SYNC_ENABLED=true: kontaktien ja vaiheiden synkronointi Brevoon
- COVER_BREVO_LISTS={"start":21,"ready":22,"personal":23,"buyers":10}
- BREVO_API_KEY: nykyinen palvelinavain
- CMYK-muunnos käyttää oletuksena cmyk-profiilia; erillistä painotalon hyväksyntälippua ei vaadita.

Oletuksena lähetys ja synkronointi ovat pois päältä. Aktiiviseen Brevo-automaatioon lisääminen voi lähettää viestejä, joten myöskään synkronointia ei kytketä huomaamatta päälle.

## Ylläpito
- Viestien sisältö ja viiveet muutetaan Brevossa, ei palvelimen ajastimessa.
- Paikallinen, vain lukeva jonotarkistus: node --import tsx server/cover/queue-status.ts, olemassa oleva DATABASE_URL ympäristössä.
- Tarkistus näyttää määrät: odottavat, varatut, ylläpitoa tarvitsevat ja vanhimman odottavan työn ikä. Ei asiakastietoja eikä avaimia.
- Paluuarvo 2 = tarkistettavaa tai yli 5 minuuttia odottanut työ. Pysyvä virhe korjataan ensin; pelkkä jatkuva uudelleenyritys ei korjaa API-avainta tai IP-estettä.
- Ei uusia maksullisia palveluja. Uusien projektien tallennus käyttää nykyistä tietokantaa, joten käyttö kasvattaa sen tavanomaista resurssikulutusta.

## Testauksen rajat
Kaikki 126 paikallista ohjelmatestiä, TypeScript-tarkistus ja tuotantokäännös läpäistiin. Selaimessa testattiin keksityllä osoitteella linkin vahvistus, projektin tallennus, mallitekstien estäminen ja korjatun version merkitseminen valmiiksi. Tämä ei ole todistus aidon sähköpostin perillemenosta, oikean MySQL:n integraatiosta tai painotalon hyväksynnästä.

Käsikirjoituksen suojattu verkkotoimitus ja vaihtuvaan painatushintaan sidottu suora maksu ovat edelleen erillistä jatkotyötä. Nykyinen paikallinen EML-tilausesikatselu ei ole toimiva verkkokauppatilauksen vastaanotto.
