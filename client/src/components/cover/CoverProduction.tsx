import {
  FORMATS,
  papersFor,
  pagesFor,
  quantitiesFor,
  normalizeProduction,
  coverGeometry,
  printQuote,
  formatMoney,
  formatMm,
  type Production,
} from "@shared/print-production";
export default function CoverProduction({
  production: p,
  onChange,
  disabled = false,
}: {
  production: Production;
  onChange: (p: Production) => void;
  disabled?: boolean;
}) {
  const g = coverGeometry(p),
    q = printQuote(p)!;
  const patch = (v: Partial<Production>) => onChange(normalizeProduction(p, v));
  return (
    <section
      className="cover-production"
      aria-labelledby="cover-production-title"
    >
      <div className="cover-production-heading">
        <div>
          <p className="cover-panel-kicker">1. KIRJAN TIEDOT JA HINTA</p>
          <h2 id="cover-production-title">
            Mitoitus tulee samoista tiedoista kuin painatushinta.
          </h2>
        </div>
        <strong>
          {formatMoney(q.totalCents!)}
          <small>
            painatus, toimitus
            {p.interior === "layout" ? " ja sisäsivujen taitto" : ""}, sis. alv
          </small>
        </strong>
      </div>
      <fieldset disabled={disabled} className="cover-production-inputs">
        <label>
          Kirjan koko
          <select
            aria-label="Kirjan koko"
            value={p.format}
            onChange={e => patch({ format: e.target.value })}
          >
            {FORMATS.map(f => (
              <option key={f} value={f}>
                {f.replace("x", " × ")} mm
              </option>
            ))}
          </select>
        </label>
        <label>
          Sisuspaperi
          <select
            aria-label="Sisuspaperi"
            value={p.paper}
            onChange={e => patch({ paper: e.target.value })}
          >
            {papersFor(p.format).map(x => (
              <option key={x} value={x}>
                {x.replace("g Standard", " g/m²")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sisäsivujen määrä
          <select
            aria-label="Sisäsivujen määrä"
            value={p.pages}
            onChange={e => patch({ pages: Number(e.target.value) })}
          >
            {pagesFor(p.format, p.paper).map(x => (
              <option key={x} value={x}>
                {x} sivua{x === 32 ? " (niittisidottu)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Painosmäärä
          <select
            aria-label="Painosmäärä"
            value={p.quantity}
            onChange={e => patch({ quantity: Number(e.target.value) })}
          >
            {quantitiesFor(p).map(x => (
              <option key={x} value={x}>
                {x} kpl
              </option>
            ))}
          </select>
        </label>
        <label className="cover-interior-choice">
          Sisäsivujen taitto
          <select
            aria-label="Sisäsivujen taitto"
            value={p.interior}
            onChange={e =>
              patch({ interior: e.target.value as Production["interior"] })
            }
          >
            <option value="ready">Minulla on painovalmis sisus-PDF</option>
            <option value="layout">
              Tarvitsen sisäsivujen taiton (+217 €, sis. alv)
            </option>
          </select>
        </label>
      </fieldset>
      <dl className="cover-dimensions">
        <div>
          <dt>Takakansi</dt>
          <dd>
            {formatMm(g.widthMm)} × {formatMm(g.heightMm)}
          </dd>
        </div>
        <div>
          <dt>Selkä</dt>
          <dd>
            {formatMm(g.spineMm)}
            {p.interior === "layout" ? " (alustava)" : ""}
          </dd>
        </div>
        <div>
          <dt>Etukansi</dt>
          <dd>
            {formatMm(g.widthMm)} × {formatMm(g.heightMm)}
          </dd>
        </div>
        <div>
          <dt>Leikkuuvara</dt>
          <dd>5 mm joka ulkoreunalla</dd>
        </div>
        <div>
          <dt>Kansitiedoston kokonaiskoko</dt>
          <dd>
            {formatMm(g.sheetWidthMm)} × {formatMm(g.sheetHeightMm)}
          </dd>
        </div>
      </dl>
      <p className="cover-production-note">
        {p.interior === "layout"
          ? "Sisäsivujen taitto voi muuttaa sivumäärää, hintaa ja selän leveyttä. Lopullinen kansi vahvistetaan taiton valmistuttua."
          : "Valitse taitetun sisuksen todellinen sivumäärä, myös tyhjät sivut. Hinnaston väliin osuvia sivumääriä ei pyöristetä eikä selkämittoja arvata."}{" "}
        Tämä hinnasto koskee pehmeäkantisia kirjoja. Kotiintoimitus 50 €
        sisältyy yllä näkyvään kokonaishintaan. Yli 200 kirjan tilauksista pyydä
        tarjous.
      </p>
      <details className="cover-production-note">
        <summary>Tekniset ohjeet ennen painoa</summary>
        <p>
          Mitat ja hinta perustuvat Drukātavan hinnastoon. Paperin, sidonnan tai
          painotalon vaihtuessa selän leveys vahvistetaan uudelleen.
          Kovakantinen kirja tarvitsee oman kansipohjansa.
        </p>
        <p>
          Kannen leikkuuvara on 5 mm. Pidä etu- ja takakannen tekstit vähintään
          5 mm leikkuureunoista ja selästä. Selkätekstiä käytetään vasta
          vähintään 6 mm:n selässä ja sen sivuille jätetään vähintään 1,5 mm
          turvavaraa.
        </p>
        <p>
          Sisus toimitetaan erillisenä PDF:nä, yksittäisinä sivuina
          lukujärjestyksessä, myös tyhjät sivut mukana. Kirjan koko tarkoittaa
          leikattua kokoa (PDF:n TrimBox), ei leikkuuvarat sisältävän arkin
          kokoa. Word-tiedosto on taiton lähtöaineisto, ei painovalmis tiedosto.
        </p>
        <p>
          Tästä ladattava RGB-kansiluonnos tarvitsee vielä tuotantotaiton:
          CMYK-värit, laadukkaat alkuperäiskuvat, terävät tekstit ja painotalon
          aineistotarkistuksen. Näytön värit eivät takaa painoväriä. Kultainen
          väri ei tarkoita kultafoliota.
        </p>
      </details>
      <a href="/tarjouspyynto" className="cover-text-link">
        Tarvitsetko yli 200 kirjaa? Pyydä tarjous →
      </a>
    </section>
  );
}
