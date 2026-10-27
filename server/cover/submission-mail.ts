import { VaultCrypto } from "./vault";
import type { Submission, SubmissionNotice } from "./submissions";
import { formatMoney } from "../../shared/print-production";

export async function deliverSubmissionNotice(
  job: SubmissionNotice,
  crypto: VaultCrypto,
  apiKey: string,
  request: typeof fetch = fetch
) {
  const saved = crypto.open<Submission>(job.row);
  const p = saved.project.production,
    c = saved.customer;
  const body = {
    sender: { name: "Thunder Kustannus", email: "info@thunderkustannus.fi" },
    to: [{ email: "info@thunderkustannus.fi" }],
    replyTo: { name: c.name, email: c.email },
    subject: "Käsikirjoitus ja painatuspyyntö – " + saved.receipt.id,
    textContent: [
      "Uusi aineistopyyntö kansisuunnittelijasta. Ei maksettua eikä hyväksyttyä painotilausta.",
      "Pyyntö: " + saved.receipt.id,
      "Kirja: " + saved.project.title,
      c.name + " | " + c.email + " | " + c.phone,
      c.address + ", " + c.postal + " " + c.city,
      p.quantity +
        " kpl, " +
        p.format +
        " mm, " +
        p.pages +
        " sivua, " +
        p.paper,
      "Sisus: " +
        (p.interior === "layout"
          ? "Taittopalvelu 217 euroa mukana; sivumäärä ja hinta vielä vahvistettava"
          : "Asiakas vahvisti valitun sivumäärän; PDF on tarkistettava"),
      "Laskurin hinta: " +
        formatMoney(saved.quote.totalCents!) +
        " (sis. alv ja 50 euron toimitus)",
      "Tarkista aineisto ja hinta ennen painoa tai maksua. Liite on asiakkaan toimittama, ei virustarkastettu. Älä avaa poikkeavaa aktiivista sisältöä.",
      "Kansiversio: " + saved.projectId + ", revisio " + saved.revision,
      "Vastaa asiakkaalle yhden arkipäivän kuluessa.",
    ].join("\n\n"),
    attachment: [{ name: saved.filename, content: saved.manuscript }],
    headers: { idempotencyKey: job.key },
    tags: ["cover-manuscript"],
  };
  const response = await request("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    // A duplicate idempotency key means the original submission was accepted.
    if (response.status === 400) {
      const error = await response.json().catch(() => null);
      if (
        error?.code === "duplicate_parameter" &&
        /idempotency/i.test(String(error?.message))
      )
        return;
    }
    throw Object.assign(Error("Intake notification unavailable"), {
      retryable: response.status === 429,
    });
  }
}
