import { useEffect, useRef, useState } from "react";
import {
  coverGeometry,
  printQuote,
  formatMoney,
} from "@shared/print-production";
import {
  inspectManuscript,
  orderCustomerSchema,
  orderSummary,
  orderEmailDraft,
  type OrderCustomer,
} from "@/lib/cover/order";
import { downloadBlob } from "@/lib/cover/storage";
import { safeFilename, type CoverProject } from "@/lib/cover/model";
export default function CoverOrder({
  project: p,
  createPdf,
  onInteriorChange,
}: {
  project: CoverProject;
  createPdf: () => Promise<Blob>;
  onInteriorChange: () => void;
}) {
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
  });
  const [file, setFile] = useState<File | null>(null),
    [verified, setVerified] = useState(false),
    [confirmed, setConfirmed] = useState(false),
    [terms, setTerms] = useState(false);
  const [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    working = useRef(false);
  const q = printQuote(p.production)!,
    g = coverGeometry(p.production);
  useEffect(() => {
    setConfirmed(false);
    setNotice("");
  }, [
    p.production.format,
    p.production.paper,
    p.production.pages,
    p.production.quantity,
    p.production.interior,
  ]);
  async function choose(f?: File) {
    if (!f || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    setVerified(false);
    setFile(null);
    try {
      const kind = await inspectManuscript(f);
      setFile(f);
      setVerified(true);
      if (kind === "docx") onInteriorChange();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Tiedostoa ei voitu tarkistaa."
      );
    } finally {
      working.current = false;
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  async function prepare(e: React.FormEvent) {
    e.preventDefault();
    if (working.current) return;
    setError("");
    setNotice("");
    const result = orderCustomerSchema.safeParse(customer);
    if (!result.success) {
      setError(
        "Tarkista nimi, sähköposti ja toimitusosoite. Postinumerossa on viisi numeroa."
      );
      return;
    }
    if (!file || !verified) {
      setError("Liitä tarkistettu PDF- tai DOCX-käsikirjoitus.");
      return;
    }
    if (!terms || (p.production.interior === "ready" && !confirmed)) {
      setError(
        "Vahvista toimitettavan aineiston tiedot ja lupa niiden käsittelyyn."
      );
      return;
    }
    working.current = true;
    setBusy(true);
    try {
      const pdf = await createPdf(),
        summary = orderSummary(
          p,
          result.data,
          confirmed && p.production.interior === "ready"
        );
      const draft = await orderEmailDraft(summary, file, pdf, p);
      if (draft.size > 20 * 1024 * 1024)
        throw new Error(
          "Liitteet ylittävät 20 Mt:n sähköpostiluonnoksen rajan. Pienennä käsikirjoitusta tai kansikuvaa."
        );
      downloadBlob(draft, safeFilename(p.title) + "-tilausesikatselu.eml");
      setNotice(
        "Tilausesikatselu ladattiin sähköpostiluonnoksena. Vastaanottajaksi on merkitty info@thunderkustannus.fi. Mitään ei lähetetty, tilattu tai veloitettu."
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Tilausesikatselun muodostaminen epäonnistui."
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      id="kannen-tilaus"
      className="cover-order"
      aria-labelledby="cover-order-heading"
    >
      <div>
        <p className="cover-panel-kicker">3. KÄSIKIRJOITUS JA KOTIINTOIMITUS</p>
        <h2 id="cover-order-heading">Tarkista kirjapaketin tiedot.</h2>
        <p className="cover-help">
          Tässä esikatselussa voit valmistella koko tilauksen liitteineen. Se ei
          lähetä sähköpostia eikä avaa maksua.
        </p>
      </div>
      <div className="cover-order-grid">
        <form onSubmit={prepare}>
          <fieldset disabled={busy} className="cover-order-fields">
            <div className="cover-order-inputs">
              {(
                [
                  ["name", "Nimi", "text"],
                  ["email", "Sähköpostiosoite", "email"],
                  ["phone", "Puhelin (vapaaehtoinen)", "tel"],
                  ["address", "Katuosoite", "text"],
                  ["postal", "Postinumero", "text"],
                  ["city", "Postitoimipaikka", "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    name={"private-order-" + key}
                    value={customer[key]}
                    maxLength={key === "postal" ? 5 : 150}
                    required={key !== "phone"}
                    autoComplete={
                      key === "name"
                        ? "name"
                        : key === "email"
                          ? "email"
                          : key === "phone"
                            ? "tel"
                            : key === "address"
                              ? "street-address"
                              : key === "postal"
                                ? "postal-code"
                                : "address-level2"
                    }
                    inputMode={key === "postal" ? "numeric" : undefined}
                    onChange={e =>
                      setCustomer({ ...customer, [key]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <label className="cover-order-file">
              Käsikirjoitus
              <input
                ref={input}
                type="file"
                accept=".pdf,.docx"
                onChange={e => void choose(e.target.files?.[0])}
              />
              <small>
                Yksi PDF- tai DOCX-tiedosto, enintään 8 Mt. Kuva ja
                käsikirjoitus pysyvät tässä esikatselussa omalla laitteellasi.
              </small>
            </label>
            {file && (
              <p className="cover-order-file-ok">
                Liite: {file.name} · {(file.size / 1024 / 1024).toFixed(2)} Mt{" "}
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setVerified(false);
                  }}
                >
                  Poista liite
                </button>
              </p>
            )}
            {p.production.interior === "ready" ? (
              <label className="cover-order-check">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                />
                Vahvistan, että sisus-PDF:n leikattu koko (TrimBox) on{" "}
                {g.widthMm} × {g.heightMm} mm ja sisältää täsmälleen{" "}
                {p.production.pages} sivua tyhjät sivut mukaan lukien,
                yksittäisinä sivuina eikä aukeamina. Kansi on erillinen
                tiedosto.
              </label>
            ) : (
              <p className="cover-order-note">
                Sisäsivujen taitto 217 € (sis. alv) on lisätty. Oikoluku ja
                sisällön muokkaus eivät sisälly tähän. Vahvistamme lopullisen
                sivumäärän, selän ja hinnan taiton jälkeen.
              </p>
            )}
            <label className="cover-order-check">
              <input
                type="checkbox"
                checked={terms}
                onChange={e => setTerms(e.target.checked)}
              />
              Minulla on oikeus käyttää toimittamaani aineistoa. Ymmärrän, että
              kyseessä on tilausesikatselu ja että aineisto tarkistetaan ennen
              painoon lähettämistä.
            </label>
            <button
              type="submit"
              className="cover-primary"
              disabled={
                busy ||
                !file ||
                !verified ||
                !terms ||
                (p.production.interior === "ready" && !confirmed)
              }
            >
              {busy ? "Valmistellaan…" : "Lataa tilausesikatselu liitteineen"}
            </button>
          </fieldset>
          {error && (
            <p role="alert" className="cover-order-error">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="cover-order-success">
              {notice}
            </p>
          )}
        </form>
        <aside className="cover-order-total">
          <h3>Painatuspaketti</h3>
          <p>
            {p.production.quantity} pehmeäkantista kirjaa
            <br />
            {g.widthMm} × {g.heightMm} mm · {p.production.pages} sivua
            <br />
            {p.production.paper.replace("g Standard", " g/m²")}
            <br />
            Värillinen kansi, Metsä Board
          </p>
          <dl>
            <div>
              <dt>Painatus ({p.production.quantity} kpl)</dt>
              <dd>{formatMoney(q.printCents)}</dd>
            </div>
            <div>
              <dt>Sisäsivujen taitto</dt>
              <dd>
                {q.layoutCents ? formatMoney(q.layoutCents) : "Ei tilattu"}
              </dd>
            </div>
            <div>
              <dt>Kotiintoimitus</dt>
              <dd>50,00 €</dd>
            </div>
            <div>
              <dt>Yhteensä, sis. alv</dt>
              <dd>{formatMoney(q.totalCents!)}</dd>
            </div>
          </dl>
          <p className="cover-order-note">
            Painatushinta tulee suoraan nykyisestä hintalaskurista. Tämä on
            painatuspalvelu; verkkokauppajakelu ei sisälly tähän tilaukseen.
          </p>
          <strong>Maksu ei ole käytössä esikatselussa.</strong>
          <p className="cover-help">
            Varsinainen tilausten vastaanotto, suojattu aineistolähetys ja maksu
            kytketään vasta hyväksytyn esikatselun jälkeen. Käsikirjoitusta ei
            tallenneta selaimen automaattiseen luonnokseen.
          </p>
        </aside>
      </div>
    </section>
  );
}
