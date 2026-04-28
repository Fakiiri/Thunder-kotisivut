// Thunder Kustannus — Sopimusehdot
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";

export default function Sopimusehdot() {
  const updated = "28.4.2025";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-4xl md:text-5xl text-white mb-4">Sopimusehdot</h1>
            <p className="text-white/40 text-sm">Päivitetty {updated} — {COMPANY.legalName}</p>
          </div>

          <div className="prose-thunder space-y-10 text-white/70 text-base leading-relaxed">
            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">1. Osapuolet ja sopimuksen kohde</h2>
              <p>
                Nämä sopimusehdot koskevat {COMPANY.legalName}:n (jäljempänä "Thunder Kustannus" tai "Kustantamo") ja asiakkaan (jäljempänä "Kirjailija") välistä palvelusopimusta, joka kattaa omakustannekirjojen, e-kirjojen ja äänikirjojen tuotannon, julkaisemisen ja jakelun.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">2. Tekijänoikeudet ja omistajuus</h2>
              <p>
                Kirjailija omistaa kaikki teokseensa liittyvät tekijänoikeudet. Thunder Kustannus ei hanki omistusoikeuksia teokseen. Sopimus antaa Thunder Kustannukselle rajoitetun lisenssin julkaista ja jaella teosta sovituissa kanavissa sopimuksen voimassaoloaikana.
              </p>
              <p className="mt-3">
                Sopimuksen päättyessä kaikki oikeudet palautuvat täysimääräisesti Kirjailijalle. Thunder Kustannus poistaa teoksen jakelukanavista 30 päivän kuluessa sopimuksen päättymisestä.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">3. Kirjailijan vastuu sisällöstä</h2>
              <p>
                <strong className="text-white">Kirjailija on yksin vastuussa teoksen sisällöstä.</strong> Kirjailija vakuuttaa ja takaa, että:
              </p>
              <ul className="mt-3 space-y-2 ml-4">
                {[
                  "Teos ei sisällä vihapuhetta, syrjintää tai rikoslain vastaista materiaalia",
                  "Teos ei loukkaa kenenkään yksityisyyttä tai mainetta (kunnianloukkaus)",
                  "Teos ei sisällä tekijänoikeudella suojattua materiaalia ilman asianmukaista lupaa",
                  "Kaikki teoksessa esitetyt väitteet ovat Kirjailijan parhaan tiedon mukaan totuudenmukaisia",
                  "Teos ei sisällä harhaanjohtavaa tietoa, joka voisi aiheuttaa vahinkoa lukijoille",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="thunder-orange mt-1.5 text-xs flex-shrink-0">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 bg-[oklch(0.15_0.005_240)] border border-orange-400/20 rounded-lg p-4 text-sm">
                <strong className="text-white">Tärkeää:</strong> Jos teos sisältää lainvastaista materiaalia tai sen myynti johtaa oikeudellisiin vaatimuksiin, Thunder Kustannus pidättää oikeuden lopettaa teoksen myynnin välittömästi ilman ennakkoilmoitusta. Kaikki tästä aiheutuvat vahingot, oikeudenkäyntikulut ja korvausvaatimukset kohdistuvat yksinomaan Kirjailijaan.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">4. Myynnin keskeyttäminen</h2>
              <p>Thunder Kustannus voi keskeyttää teoksen myynnin välittömästi, jos:</p>
              <ul className="mt-3 space-y-2 ml-4">
                {[
                  "Teos sisältää tai epäillään sisältävän lainvastaista materiaalia",
                  "Teoksesta on tehty oikeudellinen vaatimus tai valitus",
                  "Jakelukanava (esim. Storytel, kirjakauppa) on keskeyttänyt teoksen myynnin",
                  "Kirjailija on rikkonut näitä sopimusehtoja",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="thunder-orange mt-1.5 text-xs flex-shrink-0">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">5. Tekijänpalkkiot ja maksaminen</h2>
              <p>
                Tekijänpalkkiot maksetaan neljännesvuosittain (maaliskuu, kesäkuu, syyskuu, joulukuu). Kirjailija saa yksityiskohtaiset myyntiraportit kaikista jakelukanavista. Palkkioprosentti sovitaan erikseen kunkin sopimuksen yhteydessä ja kirjataan sopimukseen.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">6. Sopimuksen kesto ja irtisanominen</h2>
              <p>
                Sopimus on voimassa toistaiseksi. Kumpi tahansa osapuoli voi irtisanoa sopimuksen 3 kuukauden kirjallisella irtisanomisilmoituksella. Irtisanomisajan jälkeen teos poistetaan kaikista jakelukanavista 30 päivän kuluessa.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">7. Vastuunrajoitus</h2>
              <p>
                Thunder Kustannus ei vastaa Kirjailijan teoksen sisällöstä aiheutuvista vahingoista, oikeudellisista vaatimuksista tai myyntitulojen menetyksistä, jotka johtuvat teoksen sisällöstä tai Kirjailijan toimista. Thunder Kustannuksen kokonaisvastuu on enintään Kirjailijan maksamien palvelumaksujen suuruinen.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">8. Sovellettava laki</h2>
              <p>
                Tähän sopimukseen sovelletaan Suomen lakia. Mahdolliset riidat ratkaistaan ensisijaisesti neuvottelemalla. Jos neuvottelu ei johda tulokseen, riita ratkaistaan Helsingin käräjäoikeudessa.
              </p>
            </section>

            <section>
              <h2 className="thunder-heading text-2xl text-white mb-3">9. Yhteystiedot</h2>
              <p>
                Sopimusehtoihin liittyvissä kysymyksissä ota yhteyttä: <a href={`mailto:${COMPANY.email}`} className="thunder-orange underline hover:no-underline">{COMPANY.email}</a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
