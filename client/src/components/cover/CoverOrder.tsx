import { PAGE_PRICE_NOTICE } from "@shared/page-settlement";
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
import {
  safeFilename,
  projectSchema,
  type CoverProject,
} from "@/lib/cover/model";
export default function CoverOrder({
  project: p,
  createPdf,
  onInteriorChange,
  intake = false,
  checkoutAvailable = false,
  projectId = null,
  dirty = false,
}: {
  intake?: boolean;
  checkoutAvailable?: boolean;
  projectId?: string | null;
  dirty?: boolean;
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
  const [received, setReceived] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const requestKey = useRef({ signature: "", id: "" });
  useEffect(() => {
    if (!intake) return;
    let active = true;
    fetch("/api/cover/session", { cache: "no-store" })
      .then(r => r.json())
      .then(s => {
        if (active)
          setCustomer(c => ({ ...c, email: s.authenticated ? s.email : "" }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [intake, projectId]);
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
    if (intake && (!projectId || dirty)) {
      setError(
        "Tallenna ensin kansiprojektisi viimeisin versio sivun yläosasta."
      );
      return;
    }
    working.current = true;
    setBusy(true);
    try {
      if (intake) {
        const savedResponse = await fetch("/api/cover/projects/" + projectId, {
          cache: "no-store",
        });
        if (!savedResponse.ok)
          throw Error(
            "Avaa projekti käyttölinkillä ja tallenna se ennen lähettämistä."
          );
        const saved = await savedResponse.json();
        if (
          JSON.stringify(projectSchema.parse(saved.project)) !==
          JSON.stringify(projectSchema.parse(p))
        )
          throw Error(
            "Projektia on muutettu toisella laitteella. Avaa ja tarkista uusin kansiversio ennen lähettämistä."
          );
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(
            ...Array.from(bytes.subarray(i, i + 8192))
          );
        const manuscript = btoa(binary);
        const checksum = Array.from(
          new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
        )
          .map(x => x.toString(16).padStart(2, "0"))
          .join("");
        const signature = JSON.stringify({
          customer: result.data,
          projectId,
          revision: saved.revision,
          checksum,
          filename: file.name,
          confirmed,
        });
        if (requestKey.current.signature !== signature)
          requestKey.current = { signature, id: crypto.randomUUID() };
        const response = await fetch("/api/cover/submissions/" + projectId, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: requestKey.current.id,
            revision: saved.revision,
            customer: result.data,
            filename: file.name,
            manuscript,
            confirmedPages: confirmed,
            permission: true,
          }),
        });
        const receipt = await response.json().catch(() => null);
        if (!response.ok)
          throw Error(
            receipt?.error ||
              "Aineiston lähetys ei onnistunut. Yritä myöhemmin samalla lomakkeella."
          );
        setReceived(true);
        setReceiptId(receipt.id);
        setFile(null);
        setNotice(
          "Aineisto vastaanotettu. Pyyntösi tunniste: " +
            receipt.id +
            ". Santeri tarkistaa tiedot ja ottaa yhteyttä yhden arkipäivän kuluessa. Tämä ei vielä ole tilaus tai veloitus."
        );
        return;
      }
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
          {intake
            ? "Lähetä käsikirjoitus ja kirjan tiedot meille tarkistettavaksi. Vahvistamme aineiston ja lopullisen toteutuksen ennen tilausta tai maksua."
            : "Tässä esikatselussa voit valmistella koko tilauksen liitteineen. Se ei lähetä sähköpostia eikä avaa maksua."}
        </p>
      </div>
      <div className="cover-order-grid">
        <form onSubmit={prepare} className="manus-no-record">
          {intake && (!projectId || dirty) && (
            <p className="cover-order-note">
              Avaa henkilökohtainen käyttölinkkisi ja tallenna kansiprojektin
              uusin versio sivun yläosasta ennen aineiston lähettämistä.
            </p>
          )}
          <fieldset disabled={busy || received} className="cover-order-fields">
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
                    readOnly={intake && key === "email"}
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
                {intake
                  ? "Yksi PDF- tai DOCX-tiedosto, enintään 8 Mt. Lähetetty käsikirjoitus toimitetaan Thunder Kustannukselle sähköpostitse ja tallennetaan salattuna 30 päiväksi. Aineistoa ei käytetä markkinointiin."
                  : "Yksi PDF- tai DOCX-tiedosto, enintään 8 Mt. Kuva ja käsikirjoitus pysyvät tässä esikatselussa omalla laitteellasi."}
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
              {intake
                ? "Minulla on oikeus toimittaa aineisto. Pyydän sen lähettämistä Thunder Kustannukselle sähköpostitse tarkistusta ja yhteydenottoa varten. Tämä ei vielä ole sitova tilaus."
                : "Minulla on oikeus käyttää toimittamaani aineistoa. Ymmärrän, että kyseessä on tilausesikatselu ja että aineisto tarkistetaan ennen painoon lähettämistä."}
            </label>
            <button
              type="submit"
              className="cover-primary"
              disabled={
                busy ||
                received ||
                (intake && (!projectId || dirty)) ||
                !file ||
                !verified ||
                !terms ||
                (p.production.interior === "ready" && !confirmed)
              }
            >
              {busy
                ? "Valmistellaan…"
                : intake
                  ? "Lähetä aineisto tarkistettavaksi"
                  : "Lataa tilausesikatselu liitteineen"}
            </button>
          </fieldset>
          {receiptId && checkoutAvailable && (
            <a className="cover-primary" href={"/kansi-maksu/" + receiptId}>
              Tarkista tiedot ja siirry maksamaan →
            </a>
          )}
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
          <p className="cover-order-note">{PAGE_PRICE_NOTICE}</p>
          <strong>
            {intake
              ? "Lähetys ei veloita mitään."
              : "Maksu ei ole käytössä esikatselussa."}
          </strong>
          <p className="cover-help">
            {intake
              ? "Tallenna kansiprojekti ennen lähettämistä. Aineiston vastaanotto ei takaa painokelpoisuutta. Santeri vahvistaa toteutuksen ja maksutavan kanssasi erikseen. Käsikirjoitusta ei tallenneta selaimen automaattiseen luonnokseen."
              : "Varsinainen tilausten vastaanotto, suojattu aineistolähetys ja maksu kytketään vasta hyväksytyn esikatselun jälkeen. Käsikirjoitusta ei tallenneta selaimen automaattiseen luonnokseen."}
          </p>
        </aside>
      </div>
    </section>
  );
}
