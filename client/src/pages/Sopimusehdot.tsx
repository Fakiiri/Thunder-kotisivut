// Thunder Kustannus — Sopimusehdot v2 (vaalea)
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/data";

export default function Sopimusehdot() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          <div className="mb-12">
            <span className="orange-line" />
            <h1 className="thunder-heading text-4xl md:text-5xl text-foreground mb-4">Sopimusehdot</h1>
            <p className="text-muted-foreground text-sm">Päivitetty 28.4.2025 — {COMPANY.legalName}</p>
          </div>

          <div className="space-y-10 text-foreground/70 text-base leading-relaxed">
            {[
              {
                n: "1", title: "Osapuolet ja sopimuksen kohde",
                body: `Nämä sopimusehdot koskevat ${COMPANY.legalName}:n (jäljempänä "Thunder Kustannus") ja asiakkaan (jäljempänä "Kirjailija") välistä palvelusopimusta, joka kattaa omakustannekirjojen, e-kirjojen ja äänikirjojen tuotannon, julkaisemisen ja jakelun.`,
              },
              {
                n: "2", title: "Tekijänoikeudet ja omistajuus",
                body: "Kirjailija omistaa kaikki teokseensa liittyvät tekijänoikeudet. Thunder Kustannus ei hanki omistusoikeuksia teokseen. Sopimus antaa Thunder Kustannukselle rajoitetun lisenssin julkaista ja jaella teosta sovituissa kanavissa sopimuksen voimassaoloaikana. Sopimuksen päättyessä kaikki oikeudet palautuvat täysimääräisesti Kirjailijalle.",
              },
              {
                n: "3", title: "Kirjailijan vastuu sisällöstä",
                body: null,
                list: [
                  "Teos ei sisällä vihapuhetta, syrjintää tai rikoslain vastaista materiaalia",
                  "Teos ei loukkaa kenenkään yksityisyyttä tai mainetta (kunnianloukkaus)",
                  "Teos ei sisällä tekijänoikeudella suojattua materiaalia ilman asianmukaista lupaa",
                  "Kaikki teoksessa esitetyt väitteet ovat Kirjailijan parhaan tiedon mukaan totuudenmukaisia",
                ],
                warning: "Jos teos sisältää lainvastaista materiaalia tai sen myynti johtaa oikeudellisiin vaatimuksiin, Thunder Kustannus pidättää oikeuden lopettaa teoksen myynnin välittömästi. Kaikki tästä aiheutuvat vahingot kohdistuvat yksinomaan Kirjailijaan.",
              },
              {
                n: "4", title: "Myynnin keskeyttäminen",
                body: null,
                list: [
                  "Teos sisältää tai epäillään sisältävän lainvastaista materiaalia",
                  "Teoksesta on tehty oikeudellinen vaatimus tai valitus",
                  "Jakelukanava on keskeyttänyt teoksen myynnin",
                  "Kirjailija on rikkonut näitä sopimusehtoja",
                ],
              },
              {
                n: "5", title: "Tekijänpalkkiot ja maksaminen",
                body: "Tekijänpalkkiot maksetaan neljännesvuosittain (maaliskuu, kesäkuu, syyskuu, joulukuu). Kirjailija saa yksityiskohtaiset myyntiraportit kaikista jakelukanavista.",
              },
              {
                n: "6", title: "Sopimuksen kesto ja irtisanominen",
                body: "Sopimus on voimassa toistaiseksi. Kumpi tahansa osapuoli voi irtisanoa sopimuksen 3 kuukauden kirjallisella irtisanomisilmoituksella.",
              },
              {
                n: "7", title: "Vastuunrajoitus",
                body: "Thunder Kustannus ei vastaa Kirjailijan teoksen sisällöstä aiheutuvista vahingoista tai oikeudellisista vaatimuksista. Thunder Kustannuksen kokonaisvastuu on enintään Kirjailijan maksamien palvelumaksujen suuruinen.",
              },
              {
                n: "8", title: "Sovellettava laki",
                body: "Tähän sopimukseen sovelletaan Suomen lakia. Mahdolliset riidat ratkaistaan Helsingin käräjäoikeudessa.",
              },
            ].map((section) => (
              <section key={section.n} className="border-b border-border pb-8 last:border-0">
                <h2 className="thunder-heading text-xl text-foreground mb-3">
                  {section.n}. {section.title}
                </h2>
                {section.body && <p>{section.body}</p>}
                {section.list && (
                  <ul className="mt-3 space-y-2 ml-4">
                    {section.list.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="thunder-orange mt-1.5 text-xs flex-shrink-0">▸</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.warning && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-foreground/70">
                    <strong className="text-foreground">Tärkeää:</strong> {section.warning}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
