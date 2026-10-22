import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
export default function QuizPrivacy() {
  useSEO({
    title: "Julkaisutestin tietosuojaseloste",
    description:
      "Miten Thunder Kustannus käsittelee julkaisutestin vastauksia, yhteystietoja ja sähköpostilupia.",
    canonical: "/tietosuoja",
  });
  return (
    <>
      <Navbar />
      <main className="container max-w-3xl pt-32 pb-20 space-y-7 leading-relaxed">
        <h1 className="thunder-heading text-4xl">
          Julkaisutestin tietosuojaseloste
        </h1>
        <p>Päivitetty 21.10.2026.</p>
        <section>
          <h2 className="font-bold text-xl mb-3">
            Rekisterinpitäjä ja yhteydenotot
          </h2>
          <p>
            Thunder Media Oy / Thunder Kustannus, Y-tunnus 3575834-8.
            Salopääntie 76, 12540 Launonen. info@thunderkustannus.fi.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-xl mb-3">
            Mitä tietoja kerätään ja miksi?
          </h2>
          <p>
            Voit tehdä testin ja nähdä tuloksen antamatta yhteystietojasi. Jos
            pyydät tuloksen sähköpostiin, tallennamme sähköpostiosoitteen,
            mahdollisen etunimen, kahdeksan testivastausta, tuloksen, lähdesivun
            tunnisteen sekä pyynnön ajan ja markkinointiluvan sanamuodon.
            Puhelupyynnössä tallennamme lisäksi puhelinnumeron ja vapaaehtoisen
            aikatoiveen. Älä kirjoita kenttiin terveystietoja tai muita
            arkaluonteisia tietoja.
          </p>
          <p>
            Pyytämäsi tulos ja yhteydenotto käsitellään pyynnöstäsi suostumuksen
            perusteella. Kahteen jatkoviestiin pyydetään erillinen vapaaehtoinen
            suostumus. Emme lisää sinua tämän perusteella yleiseen
            uutiskirjeeseen.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-xl mb-3">
            Testin suositus ja seuranta
          </h2>
          <p>
            Vastauksista muodostetaan sääntöpohjainen julkaisusuositus. Se ei
            arvioi käsikirjoituksen kirjallista laatua, myyntimenestystä tai
            rahoituskelpoisuutta eikä tee sinua sitovaa päätöstä. Verkkosivun
            analytiikkaan lähetetään vain etenemisen ja toimintopainikkeiden
            tapahtumia evästevalintasi mukaisesti. Yhteystietoja tai
            henkilökohtaisen tuloslinkin tunnistetta ei lähetetä analytiikkaan.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-xl mb-3">Kuka tietoja käsittelee?</h2>
          <p>
            Thunder käsittelee pyynnöt ja ottaa tarvittaessa yhteyttä. Käytämme
            Railway-palvelua tietojen säilyttämiseen ja Brevoa yhteystietojen
            hallintaan ja sähköpostien lähettämiseen. Käsittelyssä noudatetaan
            palveluntarjoajien tietojenkäsittelysopimuksia. Palveluntarjoajien
            alihankintaketjuissa tietoja voidaan käsitellä EU/ETA-alueen
            ulkopuolella; siirroissa edellytetään soveltuvia tietosuojatakeita.
            Emme myy yhteystietoja.
          </p>
        </section>
        <section>
          <h2 className="font-bold text-xl mb-3">Säilytysaika ja oikeutesi</h2>
          <p>
            Testin tietokantatiedot ja henkilökohtaiset tuloslinkit poistetaan
            180 päivän jälkeen. Brevon testilistojen tiedot tarkistetaan ja
            poistetaan samassa määräajassa, ellei erillinen asiakkuus tai muu
            käsittelyperuste edellytä säilytystä. Peruutustieto säilytetään
            tarpeellisessa laajuudessa, jotta kieltoa noudatetaan. Mahdolliseen
            asiakkuuteen ja kirjanpitoon sovelletaan niiden omia
            säilytysperusteita.
          </p>
          <p>
            Voit peruuttaa testin jatkoviestit jokaisessa jatkoviestissä
            olevasta linkistä. Voit pyytää tietojesi tarkastusta, korjaamista,
            poistamista tai käsittelyn rajoittamista osoitteesta
            info@thunderkustannus.fi. Suostumuksen peruuttaminen ei vaikuta
            ennen peruuttamista tehdyn käsittelyn lainmukaisuuteen. Voit tehdä
            valituksen tietosuojavaltuutetulle.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
