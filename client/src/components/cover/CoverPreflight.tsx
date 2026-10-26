import { useEffect, useState } from "react";
import { downloadBlob } from "@/lib/cover/storage";
type Report = {
  fingerprint: string;
  errors: { code: string; message: string }[];
  warnings: { code: string; message: string }[];
  status: string;
  widthMm: number;
  heightMm: number;
  spineMm: number;
  effectiveDpi: number | null;
};
export default function CoverPreflight({
  projectId,
  dirty,
}: {
  projectId: string | null;
  dirty: boolean;
}) {
  const [confirmed, setConfirmed] = useState(false),
    [approved, setApproved] = useState(false),
    [report, setReport] = useState<Report | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ready, setReady] = useState(false);
  useEffect(() => {
    setReport(null);
    setReady(false);
    setApproved(false);
    setConfirmed(false);
  }, [projectId, dirty]);
  async function inspect() {
    if (!projectId || dirty || busy) return;
    setBusy(true);
    setError("");
    setApproved(false);
    try {
      const r = await fetch("/api/cover/projects/" + projectId + "/preflight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error || "Tarkistus ei onnistunut.");
      setReport(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tarkistus ei onnistunut.");
    } finally {
      setBusy(false);
    }
  }
  async function exportFile(proof: boolean) {
    if (!projectId || dirty || busy || !report) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/cover/projects/" + projectId + "/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed,
          fingerprint: approved ? report.fingerprint : undefined,
          proof,
        }),
      });
      if (!r.ok) {
        const data = await r.json();
        throw Error(data.error || "Tiedoston muodostaminen ei onnistunut.");
      }
      downloadBlob(
        await r.blob(),
        proof ? "kansi-CMYK-koevedos.pdf" : "kansi-painoaineisto.pdf"
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vienti ei onnistunut.");
    } finally {
      setBusy(false);
    }
  }
  async function markReady() {
    if (!projectId || dirty || !report || !approved || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/cover/projects/" + projectId + "/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint: report.fingerprint }),
      });
      if (!r.ok)
        throw Error(
          "Valmiiksi merkitseminen ei onnistunut. Tallenna ja tarkista uusin versio."
        );
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toiminto ei onnistunut.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="cover-preflight">
      <p className="cover-eyebrow">KANNEN AINEISTOTARKISTUS</p>
      <h2>Tarkista ennen painoa.</h2>
      <p>
        Tarkistamme kannen mitat, tekstien sijoittelun, fonttimerkit, kuvien
        tarkkuuden ja painovärit. Sisällön ja kirjoitusasun tarkistat itse.
        Kansitiedosto tehdään valitsemasi kirjakoon, paperin ja sivumäärän
        mukaan; lopullinen sisus tarkistetaan tilauksen yhteydessä.
      </p>
      {!projectId ? (
        <p>
          Tallenna kansi ensin omaksi projektiksi, jotta tarkistus ja hyväksyntä
          kohdistuvat samaan versioon.
        </p>
      ) : dirty ? (
        <p role="status">
          Kannessa on tallentamattomia muutoksia. Tallenna ne omaan projektiin
          ennen tarkistusta.
        </p>
      ) : (
        <>
          <label className="cover-order-check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => {
                setConfirmed(e.target.checked);
                setReport(null);
                setApproved(false);
              }}
            />
            Vahvistan valinneeni lopullisen, taitetun sisuksen sivumäärän, myös
            tyhjät sivut. Ymmärrän, että kansi mitoitetaan tämän tiedon
            perusteella.
          </label>
          <button
            className="cover-secondary"
            disabled={busy || !confirmed}
            onClick={() => void inspect()}
          >
            {busy ? "Tarkistetaan…" : "Tarkista tämä kansiversio"}
          </button>
        </>
      )}
      {report && (
        <div>
          <p>
            <strong>
              {report.errors.length
                ? "Korjaa tai vahvista seuraavat asiat:"
                : "Kansiversion tekniset tarkistukset tehty."}
            </strong>
          </p>
          <ul>
            {report.errors.map((i, n) => (
              <li key={i.code + n}>{i.message}</li>
            ))}
            {report.warnings
              .filter(w => w.code !== "approval")
              .map((i, n) => (
                <li key={i.code + n}>{i.message}</li>
              ))}
          </ul>
          <p>
            Koko leikkuuvaroineen: {report.widthMm} × {report.heightMm} mm ·
            selkä {report.spineMm} mm.
          </p>
          <label className="cover-order-check">
            <input
              type="checkbox"
              checked={approved}
              onChange={e => setApproved(e.target.checked)}
            />
            Olen tarkistanut tämän version tekstit, kuvat ja sijoittelun.
            Hyväksyntä koskee vain tätä tallennettua versiota.
          </label>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              className="cover-secondary"
              disabled={
                busy || dirty || report.errors.some(e => e.code !== "profile")
              }
              onClick={() => void exportFile(true)}
            >
              Lataa merkitty CMYK-koevedos
            </button>
            <button
              className="cover-primary"
              disabled={busy || dirty || !!report.errors.length || !approved}
              onClick={() => void exportFile(false)}
            >
              Lataa painoaineisto
            </button>
            <button
              className="cover-secondary"
              disabled={
                busy || dirty || !approved || !!report.errors.length || ready
              }
              onClick={() => void markReady()}
            >
              {ready
                ? "Kansisuunnitelma merkitty valmiiksi"
                : "Merkitse kansisuunnitelma valmiiksi"}
            </button>
          </div>
          <p>
            Valmiiksi merkitseminen ei ole tilaus eikä lupa painaa kirjaa.{" "}
            {ready &&
              "Voit nyt pyytää tarjouksen painatuksesta tai julkaisusta. "}
            Koevedos on erillinen tarkistustiedosto, ei painoon hyväksytty
            aineisto. Painovienti avautuu vasta, kun vaaditut tarkistukset ja
            tuotantoprofiili ovat kunnossa.
          </p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
