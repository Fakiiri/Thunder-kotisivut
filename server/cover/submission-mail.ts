import { VaultCrypto } from "./vault";
import type { Submission, SubmissionNotice } from "./submissions";
import { formatMoney } from "../../shared/print-production";
import { exportReviewCover } from "./prepress";
import { createHash } from "node:crypto";

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
      saved.pdfPages
        ? `PDF: ${saved.pdfPages.sourcePages} alkuperäistä sivua, ${saved.pdfPages.billedPages} painettavaa sivua, ${saved.pdfPages.blankPages} tyhjää loppusivua. Tämän PDF:n sivumäärään ei liity lisälaskua.`
        : "Word-aineiston lopullinen sivumäärä tarkistetaan taitossa; yli 10 %:n kasvun lisälasku tehdään käsin.",
      "Laskurin hinta: " +
        formatMoney(saved.quote.totalCents!) +
        " (sis. alv ja 50 euron toimitus)",
      "Tarkista aineisto ja hinta ennen painoa tai maksua. Liite on asiakkaan toimittama, ei virustarkastettu. Älä avaa poikkeavaa aktiivista sisältöä.",
      "Kansiversio: " + saved.projectId + ", revisio " + saved.revision,
      "Vastaa asiakkaalle yhden arkipäivän kuluessa.",
    ].join("\n\n"),
    attachment: [{ name: saved.filename, content: saved.manuscript }] as {
      name: string;
      content: string;
    }[],
    headers: { idempotencyKey: job.key },
    tags: ["cover-manuscript"],
  };
  if (saved.directOrder) {
    body.attachment.push({
      name: "kansi-esikatselu.pdf",
      content: (await exportReviewCover(saved.project)).toString("base64"),
    });
    if (saved.pressManuscript)
      body.attachment.push({
        name: "sisus-tyhjat-loppusivut.pdf",
        content: saved.pressManuscript,
      });
  }
  const groups: (typeof body.attachment)[] = [[]];
  for (const attachment of body.attachment) {
    const current = groups[groups.length - 1];
    if (
      current.length &&
      current.reduce((sum, a) => sum + a.content.length, 0) +
        attachment.content.length >
        18_000_000
    )
      groups.push([attachment]);
    else current.push(attachment);
  }
  for (let part = 0; part < groups.length; part++) {
    const digest = createHash("sha256")
      .update(job.key + ":" + part)
      .digest("hex");
    const key =
      part === 0
        ? job.key
        : `${digest.slice(0, 8)}-${digest.slice(8, 12)}-4${digest.slice(13, 16)}-a${digest.slice(17, 20)}-${digest.slice(20, 32)}`;
    const response = await request("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        attachment: groups[part],
        headers: { idempotencyKey: key },
        subject:
          body.subject +
          (groups.length > 1 ? ` (osa ${part + 1}/${groups.length})` : ""),
      }),
    }).catch(error => {
      throw Object.assign(
        error instanceof Error ? error : Error("Notification network error"),
        { retryable: true }
      );
    });
    if (!response.ok) {
      // A duplicate idempotency key means the original submission was accepted.
      if (response.status === 400) {
        const error = await response.json().catch(() => null);
        if (
          error?.code === "duplicate_parameter" &&
          /idempotency/i.test(String(error?.message))
        )
          continue;
      }
      throw Object.assign(Error("Intake notification unavailable"), {
        retryable: response.status === 429 || response.status >= 500,
      });
    }
  }
}
