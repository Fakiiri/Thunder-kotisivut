import { useRef, useState } from "react";
import {
  inspectManuscript,
  orderCustomerSchema,
  type OrderCustomer,
} from "@shared/manuscript";
import {
  formatMoney,
  normalizeProduction,
  printQuote,
  type Production,
} from "@shared/print-production";
import {
  MANUAL_REVIEW_NOTICE,
  PAGE_PRICE_NOTICE,
  PDF_PRICE_NOTICE,
} from "@shared/page-settlement";
import type { CoverProject } from "@/lib/cover/model";
import { readPdfPages, type PdfPageInfo } from "@/lib/cover/inspect-pdf";

const productionKey = (p: Production) =>
  JSON.stringify([p.format, p.paper, p.pages, p.interior]);
export default function DirectCoverOrder({
  project,
  onProduction,
  onPdfLock,
  enabled = false,
}: {
  project: CoverProject;
  onProduction: (p: Production) => void;
  onPdfLock: (pages: number | null) => void;
  enabled?: boolean;
}) {
  const p = project.production,
    quote = printQuote(p)!;
  const latestProduction = useRef(p);
  latestProduction.current = p;
  const [customer, setCustomer] = useState<OrderCustomer>({
    name: "",
    email: "",
    phone: "",
    address: "",
    postal: "",
    city: "",
  });
  const [file, setFile] = useState<File | null>(null),
    [kind, setKind] = useState<"pdf" | "docx" | null>(null);
  const [pdf, setPdf] = useState<PdfPageInfo | null>(null),
    [verifiedKey, setVerifiedKey] = useState("");
  const [busy, setBusy] = useState(false),
    [checking, setChecking] = useState(false),
    [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false),
    [website, setWebsite] = useState("");
  const input = useRef<HTMLInputElement>(null),
    attempt = useRef({ signature: "", id: "" }),
    working = useRef(false);
  const selectVersion = useRef(0);
  const validFile =
    !!file &&
    (kind === "docx"
      ? p.interior === "layout"
      : verifiedKey === productionKey(p));
  async function choose(next?: File) {
    const version = ++selectVersion.current;
    setFile(null);
    setPdf(null);
    setKind(null);
    setVerifiedKey("");
    setError("");
    setAccepted(false);
    onPdfLock(null);
    if (!next) return;
    setChecking(true);
    try {
      const type = await inspectManuscript(next);
      const info = type === "pdf" ? await readPdfPages(next, p) : null;
      if (version !== selectVersion.current) return;
      if (
        p.format !== latestProduction.current.format ||
        p.paper !== latestProduction.current.paper
      )
        throw Error(
          "Kirjan koko tai paperi muuttui tarkistuksen aikana. Valitse tiedosto uudelleen."
        );
      const production = normalizeProduction(
        latestProduction.current,
        info
          ? { pages: info.billedPages, interior: "ready" }
          : { interior: "layout" }
      );
      setFile(next);
      setKind(type);
      setPdf(info);
      setVerifiedKey(productionKey(production));
      onProduction(production);
      onPdfLock(info?.billedPages ?? null);
    } catch (e) {
      if (version === selectVersion.current)
        setError(e instanceof Error ? e.message : "Tiedostoa ei voitu lukea.");
    } finally {
      if (version === selectVersion.current) setChecking(false);
      if (input.current) input.current.value = "";
    }
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (working.current) return;
    setError("");
    if (!enabled) {
      setError(
        "Tämä on paikallinen esikatselu. Aineistoa ei lähetetä eikä maksua avata."
      );
      return;
    }
    if (checking) {
      setError("Odota tiedoston sivutarkistuksen valmistumista.");
      input.current?.focus();
      return;
    }
    if (!validFile) {
      setError(
        file
          ? "Kirjan tiedot ovat muuttuneet. Valitse käsikirjoitus uudelleen, jotta mitat ja hinta voidaan tarkistaa."
          : "Liitä PDF- tai Word-käsikirjoitus."
      );
      input.current?.focus();
      return;
    }
    const result = orderCustomerSchema.safeParse(customer);
    if (!result.success) {
      setError("Tarkista yhteys- ja toimitustiedot.");
      return;
    }
    if (!accepted) {
      setError("Hyväksy aineiston käsittely ja tiedostomuodon hintaehto.");
      return;
    }
    working.current = true;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file!.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192)
        binary += String.fromCharCode(
          ...Array.from(bytes.subarray(i, i + 8192))
        );
      const checksum = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))
      )
        .map(n => n.toString(16).padStart(2, "0"))
        .join("");
      const signature = JSON.stringify({
        project,
        customer: result.data,
        checksum,
        filename: file!.name,
      });
      if (attempt.current.signature !== signature)
        attempt.current = { signature, id: crypto.randomUUID() };
      const response = await fetch("/api/cover/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          website,
          priceTermsAccepted: true,
          submission: {
            requestId: attempt.current.id,
            revision: 1,
            customer: result.data,
            filename: file!.name,
            manuscript: btoa(binary),
            confirmedPages: kind === "pdf",
            permission: true,
          },
        }),
      });
      const receipt = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(
          receipt?.error || "Tilauksen valmistelu epäonnistui. Yritä uudelleen."
        );
      if (receipt.url) {
        const url = new URL(receipt.url);
        if (
          url.protocol !== "https:" ||
          url.hostname !== "checkout.stripe.com" ||
          url.username ||
          url.password
        )
          throw Error("Maksuosoitetta ei voitu tarkistaa.");
        window.location.assign(url.href);
      } else window.location.assign("/kansi-maksu/" + receipt.id);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Maksua ei voitu avata. Yritä samalla lomakkeella uudelleen."
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
      aria-labelledby="direct-order-title"
    >
      <div>
        <p className="cover-panel-kicker">3. KÄSIKIRJOITUS JA TILAUS</p>
        <h2 id="direct-order-title">Oma kirjasi painoon.</h2>
        <p>
          Liitä käsikirjoitus, täytä toimitustiedot ja jatka maksamaan. Kansi
          tallentuu tilaukseen automaattisesti.
        </p>
      </div>
      <div className="cover-order-grid">
        <form
          onSubmit={submit}
          className="manus-no-record"
          onInvalidCapture={event => {
            const first =
              event.currentTarget.querySelector<HTMLInputElement>(
                "input:invalid"
              );
            if (event.target === first) {
              setError(
                "Täytä korostettu kenttä. Sivusto näyttää ensimmäisen puuttuvan tiedon."
              );
              requestAnimationFrame(() =>
                first?.scrollIntoView({ block: "center", behavior: "smooth" })
              );
            }
          }}
        >
          <fieldset disabled={busy} className="cover-order-fields">
            <label className="cover-order-file">
              Käsikirjoitus: PDF tai Word (.docx)
              <input
                ref={input}
                type="file"
                accept=".pdf,.docx"
                onChange={e => void choose(e.target.files?.[0])}
              />
              <small>
                Yksi tiedosto, enintään 8 Mt. PDF:n sivut lasketaan
                automaattisesti. Word-aineistoon lisätään sisäsivujen taitto 217
                € (sis. alv).
              </small>
            </label>
            {checking && (
              <p role="status">
                Tarkistetaan tiedostoa ja lasketaan PDF:n sivuja…
              </p>
            )}
            {file && (
              <div className="cover-order-note">
                <strong>{file.name}</strong>
                {pdf ? (
                  <p>
                    PDF: {pdf.sourcePages} sivua. Painettava sivumäärä{" "}
                    {pdf.billedPages}, joista {pdf.blankPages} tyhjää
                    loppusivua. Hinta ja kannen selkä lasketaan{" "}
                    {pdf.billedPages} sivulle.
                  </p>
                ) : (
                  <p>
                    Word: sivumäärä on arvio. Taittopalvelu 217 € sisältyy alla
                    näkyvään hintaan.
                  </p>
                )}
                <button
                  type="button"
                  className="cover-text-link"
                  onClick={() => void choose()}
                >
                  Poista tiedosto
                </button>
              </div>
            )}
            {file && !validFile && (
              <p role="alert">
                Kirjan mitat tai sivutiedot muuttuivat. Valitse käsikirjoitus
                uudelleen ennen maksamista.
              </p>
            )}
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
                    name={key}
                    value={customer[key]}
                    required={key !== "phone"}
                    maxLength={
                      key === "postal" ? 5 : key === "email" ? 200 : 100
                    }
                    pattern={key === "postal" ? "[0-9]{5}" : undefined}
                    inputMode={key === "postal" ? "numeric" : undefined}
                    autoComplete={
                      {
                        name: "name",
                        email: "email",
                        phone: "tel",
                        address: "street-address",
                        postal: "postal-code",
                        city: "address-level2",
                      }[key]
                    }
                    onChange={e =>
                      setCustomer(c => ({ ...c, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-10000px" }}
            >
              <label>
                Verkkosivu
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                />
              </label>
            </div>
            <p className="cover-order-note">
              {kind === "pdf" ? PDF_PRICE_NOTICE : PAGE_PRICE_NOTICE}
            </p>
            <p>{MANUAL_REVIEW_NOTICE}</p>
            <label className="cover-order-check">
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
              />
              <span>
                Minulla on oikeus toimittaa aineisto. Hyväksyn yllä näkyvän
                hintaehdon ja tietojeni sekä aineiston toimittamisen Thunder
                Kustannukselle tilauksen toteuttamiseksi. Vastaan toimittamani
                aineiston sisällöstä.
                {kind === "pdf"
                  ? " Vastaan PDF:n taitosta ja hyväksyn ilmoitettujen tyhjien loppusivujen lisäämisen."
                  : " Word-aineistoni taitetaan erikseen, ja hyväksyn yllä olevan sivumääräehdon."}{" "}
                <a href="/tietosuoja" target="_blank" rel="noreferrer">
                  Tietosuoja
                </a>{" "}
                ·{" "}
                <a href="/sopimusehdot" target="_blank" rel="noreferrer">
                  Toimitusehdot
                </a>
              </span>
            </label>
            <button type="submit" className="cover-primary" disabled={busy}>
              {busy
                ? "Tallennetaan aineistoa ja avataan maksua…"
                : "Jatka maksamaan →"}
            </button>
            {!enabled && (
              <p>
                Paikallinen esikatselu: oikea maksu ja aineiston lähetys ovat
                pois päältä.
              </p>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="cover-order-error">
              {error}
            </p>
          )}
          <p className="cover-help">
            Sähköpostia käytetään tilauksen hoitamiseen. Markkinointiviestejä ei
            tilata tällä lomakkeella. Aineisto säilytetään suojatusti 30 päivää
            ja toimitetaan Thunderille sähköpostitse. Maksu ei käynnistä
            painatusta automaattisesti.
          </p>
        </form>
        <aside className="cover-order-total">
          <h3>Kirjapakettisi</h3>
          <p>
            {p.quantity} pehmeäkantista kirjaa · {p.format.replace("x", " × ")}{" "}
            mm · {p.pages} sivua
          </p>
          <dl>
            <div>
              <dt>Painatus</dt>
              <dd>{formatMoney(quote.printCents)}</dd>
            </div>
            <div>
              <dt>Sisäsivujen taitto</dt>
              <dd>
                {quote.layoutCents
                  ? formatMoney(quote.layoutCents)
                  : "Ei tilattu"}
              </dd>
            </div>
            <div>
              <dt>Kotiintoimitus</dt>
              <dd>{formatMoney(quote.deliveryCents!)}</dd>
            </div>
            <div>
              <dt>Yhteensä, sis. alv</dt>
              <dd>{formatMoney(quote.totalCents!)}</dd>
            </div>
          </dl>
          <p>
            {pdf
              ? "Hinta lukitaan tarkistettuun PDF-aineistoon."
              : "Word-aineiston sivumäärä tarkentuu taitossa."}
          </p>
          <p>
            Voit valita maksutavan maksusivulla. Kirjakauppajakelu ei sisälly
            painatuspakettiin.
          </p>
        </aside>
      </div>
    </section>
  );
}
