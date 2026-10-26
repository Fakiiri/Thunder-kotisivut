import { useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import { useSEO } from "@/hooks/useSEO";
import {
  COVER_TOUCHES,
  COVER_CONSENT_TEXT,
  COVER_BOOKING_URL,
  COVER_WHATSAPP_URL,
  coverTouchDraft,
  nextCoverTouch,
  type CoverAudience,
  type CoverTouch,
} from "@shared/cover-funnel";
import "./Kansisuunnittelija.css";
export default function KansipolkuPreview() {
  useSEO({
    title: "Kansisuunnittelijan asiakaspolku – esikatselu",
    description: "Paikallinen asiakaspolun ja viestien testiversio.",
    canonical: "/kansisuunnittelija-polku",
    noIndex: true,
  });
  const [stage, setStage] = useState<"start" | "link" | "continue">("start"),
    [email, setEmail] = useState(""),
    [marketing, setMarketing] = useState(false),
    [touch, setTouch] = useState<CoverTouch["id"]>("welcome"),
    [saved, setSaved] = useState(false),
    [purchased, setPurchased] = useState(false),
    [unsubscribed, setUnsubscribed] = useState(false),
    [personal, setPersonal] = useState(false);
  const draft = coverTouchDraft(touch, saved),
    now = Date.now(),
    audience: CoverAudience = {
      verified: stage === "continue",
      marketing,
      unsubscribed,
      blocked: false,
      purchased,
      inPersonalService: personal,
      suppressionKnown: true,
      otherSequenceActive: false,
      enrolledAt: now - 15 * 86400000,
      lastMarketingAt: null,
      delivered: [],
    };
  const policy = nextCoverTouch(audience, now);
  return (
    <div className="cover-page">
      <Navbar />
      <main
        style={{ maxWidth: 1100, margin: "auto", padding: "140px 24px 60px" }}
      >
        <p style={{ background: "#fff0c7", padding: 16, borderRadius: 12 }}>
          <strong>PAIKALLINEN ESIKATSELU.</strong> Lomake ei lähetä sähköpostia,
          tallenna osoitetta palvelimelle eikä muuta julkaistua
          kansisuunnittelijaa.
        </p>
        <h1 style={{ fontSize: "clamp(28px,4vw,48px)", margin: "32px 0 20px" }}>
          Kansisuunnittelija
        </h1>
        <ol
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 32,
          }}
        >
          <li>1. Sähköposti</li>
          <li>2. Käyttölinkki</li>
          <li>3. Suunnittele</li>
          <li>4. Toteuta kirja</li>
        </ol>
        <section
          className="cover-next cover-funnel-intro"
          style={{ margin: 0 }}
        >
          <div>
            {stage === "start" ? (
              <>
                <h2>Suunnittele kirjallesi etukansi, selkä ja takakansi.</h2>
                <p>
                  Valitse kansipohja tai oma kuva. Muokkaa tekstit ja katso
                  samalla painatushinta. Maksuton käyttö, ei ostopakkoa.
                </p>
                <ul style={{ lineHeight: 1.9, margin: "16px 0" }}>
                  <li>
                    Suunnittele etukansi, selkä ja takakansi omasta kuvasta tai
                    kansipohjasta.
                  </li>
                  <li>
                    Jatka projektia myöhemmin sähköpostilinkillä, myös toisella
                    laitteella tallennustoiminnon valmistuttua.
                  </li>
                  <li>
                    Pyydä meiltä painatus ja julkaisu tai anna ammattilaisemme
                    hoitaa suunnittelu.
                  </li>
                </ul>
                <p>
                  Työkalun käyttö on maksutonta. Painatus, kirjakauppajakelu ja
                  ammattilaisen tekemät työt ovat erikseen tilattavia palveluja.
                </p>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    setStage("link");
                  }}
                >
                  <label>
                    Sähköpostiosoite projektisi käyttölinkkiä varten
                    <input
                      style={{
                        display: "block",
                        padding: 14,
                        border: "1px solid #aaa",
                        borderRadius: 8,
                        width: "100%",
                        margin: "8px 0 20px",
                      }}
                      type="email"
                      required
                      maxLength={254}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </label>
                  <p>
                    <strong>Miksi sähköpostiosoite?</strong> Sen avulla
                    tunnistamme oman projektisi ja voit palata siihen
                    henkilökohtaisella käyttölinkillä. Tallennustoiminnon
                    valmistuttua säilytämme projektin tätä varten. Emme julkaise
                    kansiluonnostasi tai käytä kuvia ja tekstejä markkinointiin.
                    Ammattilaisemme käsittelee aineistoa pyytämääsi työtä
                    varten, kun pyydät apua tai tilaat palvelun.
                  </p>
                  <label
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={e => setMarketing(e.target.checked)}
                    />
                    <span>{COVER_CONSENT_TEXT}</span>
                  </label>
                  <p>
                    Halutessasi saat tilanteesi mukaan apua ja vinkkejä
                    sähköpostitse. Voit lopettaa viestit milloin tahansa.
                    Suunnittelijan käyttö ei vaadi markkinointilupaa.
                  </p>
                  <button className="cover-primary" type="submit">
                    Esikatsele käyttölinkkiviestiä →
                  </button>
                </form>
              </>
            ) : null}
            {stage === "link" ? (
              <>
                <h2>Avaa kansisuunnittelija käyttölinkistä.</h2>
                <p>
                  Tuotannossa linkki tulisi osoitteeseen{" "}
                  <strong>{email}</strong>. Tässä esikatselussa viestiä ei
                  lähetetty.
                </p>
                <div
                  className="cover-email-preview"
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 24,
                    margin: "20px 0",
                  }}
                >
                  <p>Aihe: Käyttölinkkisi Thunderin kansisuunnittelijaan</p>
                  <p>
                    Avaa maksuton kansisuunnittelija alla olevasta painikkeesta.
                    Linkki on henkilökohtainen. Jos et pyytänyt sitä, voit
                    jättää viestin huomiotta.
                  </p>
                  <button
                    className="cover-primary"
                    onClick={() => setStage("continue")}
                  >
                    Kokeile käyttölinkin avaamista
                  </button>
                </div>
                <button
                  className="cover-secondary"
                  onClick={() => setStage("start")}
                >
                  Korjaa sähköpostiosoite
                </button>
              </>
            ) : null}
            {stage === "continue" ? (
              <>
                <h2>Seuraavaksi oma kansiluonnoksesi.</h2>
                <p>
                  Tässä kohtaa vahvistettu asiakas pääsee nykyiseen
                  suunnittelijaan. Oikea kirjautuminen ja projektin palautus
                  toiselle laitteelle rakennetaan erikseen.
                </p>
                <Link className="cover-primary" href="/kansisuunnittelija">
                  Avaa nykyinen kansisuunnittelija →
                </Link>
                <p>
                  Kun luonnos on tallessa, pääpainike ohjaa oman kirjan
                  toteutukseen ja hintaan. Toinen vaihtoehto on maksuton 15
                  minuutin julkaisupuhelu.
                </p>
                <a className="cover-text-link" href={COVER_BOOKING_URL}>
                  Katso Santerin varauskalenteri →
                </a>
              </>
            ) : null}
          </div>
        </section>
        <details style={{ marginTop: 48 }}>
          <summary>Viestiluonnokset – vain sisäiseen tarkasteluun</summary>
          <section>
            <h2 style={{ fontSize: 28 }}>Markkinointisarjan tarkistus</h2>
            <p>
              Alla olevat ovat viestiluonnoksia. Pysäytysehdot kokeiltavissa,
              mitään ei lähetetä.
            </p>
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                margin: "20px 0",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={saved}
                  onChange={e => setSaved(e.target.checked)}
                />{" "}
                Kansi tallennettu
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={purchased}
                  onChange={e => setPurchased(e.target.checked)}
                />{" "}
                Tilaus tehty
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={unsubscribed}
                  onChange={e => setUnsubscribed(e.target.checked)}
                />{" "}
                Markkinointi peruttu
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={personal}
                  onChange={e => setPersonal(e.target.checked)}
                />{" "}
                Henkilökohtaisessa palvelussa
              </label>
            </div>
            <p
              role="status"
              style={{
                padding: 16,
                background: policy.touch ? "#e6f4ea" : "#fff0c7",
                borderRadius: 8,
              }}
            >
              <strong>{policy.reason}</strong>
              {policy.touch
                ? " · Ensimmäinen toimittamaton viesti: " + policy.touch.subject
                : ""}
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                margin: "24px 0",
              }}
            >
              {COVER_TOUCHES.map(t => (
                <button
                  className={
                    touch === t.id ? "cover-primary" : "cover-secondary"
                  }
                  key={t.id}
                  onClick={() => setTouch(t.id)}
                >
                  Päivä {t.day}
                </button>
              ))}
            </div>
            <article
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderTop: "5px solid #ff620f",
                borderRadius: 12,
                padding: "28px clamp(20px,4vw,48px)",
              }}
            >
              <p>Thunder Kustannus · VIESTILUONNOS</p>
              <h3 style={{ fontSize: 26, margin: "20px 0" }}>
                {draft.subject}
              </h3>
              <div style={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
                {draft.body}
              </div>
              <p
                style={{ fontWeight: 700, color: "#b84200", margin: "28px 0" }}
              >
                Pääpainike: {draft.cta}
              </p>
              <p>
                Santeri Sandberg
                <br />
                Thunder Kustannus
              </p>
              <p style={{ fontSize: 13 }}>
                Viestit vain luvan antaneille. Jokaisessa myyntiviestissä
                toimiva peruutuslinkki ennen käyttöönottoa.
              </p>
            </article>
          </section>
        </details>
      </main>
    </div>
  );
}
