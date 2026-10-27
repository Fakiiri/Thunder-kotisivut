import {
  formatMoney,
  coverGeometry,
  printQuote,
} from "@shared/print-production";
import type { CoverProject } from "./model";
import {
  orderCustomerSchema,
  inspectManuscript,
  type OrderCustomer,
} from "@shared/manuscript";
export {
  MAX_MANUSCRIPT,
  orderCustomerSchema,
  inspectManuscript,
  type OrderCustomer,
} from "@shared/manuscript";
export function orderSummary(
  p: CoverProject,
  customer: OrderCustomer,
  confirmedPages: boolean
) {
  const q = printQuote(p.production)!,
    g = coverGeometry(p.production);
  return [
    "KIRJAN PAINOTILAUKSEN LUONNOS – ei lähetetty eikä maksettu",
    "Asiakas: " + customer.name,
    "Sähköposti: " + customer.email,
    "Puhelin: " + customer.phone,
    "Kotiintoimitus: " +
      customer.address +
      ", " +
      customer.postal +
      " " +
      customer.city,
    "Kirja: " + p.title,
    "Tekijä: " + p.author,
    "Koko: " + g.widthMm + " × " + g.heightMm + " mm",
    "Sisuspaperi: " + p.production.paper,
    "Sisäsivuja: " + p.production.pages,
    "Painos: " + p.production.quantity + " kpl",
    "Selkä: " + g.spineMm + " mm",
    "Leikkuuvara: 5 mm jokaisella ulkoreunalla",
    "Kansitiedoston koko: " + g.sheetWidthMm + " × " + g.sheetHeightMm + " mm",
    "Painatus: " + formatMoney(q.printCents) + " (sis. alv, laskurin hinnasto)",
    "Sisäsivujen taitto: " +
      (p.production.interior === "layout"
        ? "217,00 € (sis. alv)"
        : "Ei tilattu, asiakas toimittaa valmiin sisuksen"),
    "Kotiintoimitus: 50,00 €",
    "Yhteensä: " + formatMoney(q.totalCents!) + " (sis. alv)",
    "Sivumäärän vahvistus: " +
      (confirmedPages
        ? "Asiakas vahvistanut valitun sivumäärän"
        : "Alustava – lopullinen taitto voi muuttaa selkää ja hintaa"),
    "Tämä on painatuspalvelu. Jakelua verkkokauppoihin ei tilattu tällä lomakkeella.",
    "Kansitiedosto on RGB-kuvaksi rasteroitu luonnos, ei painovalmis PDF. CMYK-tuotantotaitto, tekstien terävyys ja lopullinen selkä vahvistetaan ennen painoa.",
  ].join("\r\n");
}
function base64(bytes: Uint8Array) {
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...Array.from(bytes.subarray(i, i + 8192)));
  return (
    btoa(text)
      .match(/.{1,76}/g)
      ?.join("\r\n") || ""
  );
}
export async function orderEmailDraft(
  summary: string,
  manuscript: File,
  cover: Blob,
  project: CoverProject
) {
  const boundary = "Thunder-" + crypto.randomUUID(),
    enc = new TextEncoder();
  const parts = [
    "To: info@thunderkustannus.fi",
    "Subject: Kirjan painotilauksen luonnos",
    "X-Unsent: 1",
    "MIME-Version: 1.0",
    'Content-Type: multipart/mixed; boundary="' + boundary + '"',
    "",
    "--" + boundary,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    base64(enc.encode(summary)),
  ];
  const safeName = manuscript.name.toLowerCase().endsWith(".docx")
    ? "kasikirjoitus.docx"
    : "sisus.pdf";
  const attachments: [string, string, Uint8Array][] = [
    [
      "kansiluonnos-RGB.pdf",
      "application/pdf",
      new Uint8Array(await cover.arrayBuffer()),
    ],
    [
      safeName,
      safeName.endsWith(".pdf")
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      new Uint8Array(await manuscript.arrayBuffer()),
    ],
    [
      "kansiprojekti.json",
      "application/json",
      enc.encode(JSON.stringify(project)),
    ],
  ];
  for (const [name, type, bytes] of attachments)
    parts.push(
      "--" + boundary,
      "Content-Type: " + type + '; name="' + name + '"',
      'Content-Disposition: attachment; filename="' + name + '"',
      "Content-Transfer-Encoding: base64",
      "",
      base64(bytes)
    );
  parts.push("--" + boundary + "--", "");
  return new Blob([parts.join("\r\n")], { type: "message/rfc822" });
}
