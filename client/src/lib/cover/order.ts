import { z } from "zod";
import {
  formatMoney,
  coverGeometry,
  printQuote,
} from "@shared/print-production";
import type { CoverProject } from "./model";
export const MAX_MANUSCRIPT = 8 * 1024 * 1024;
export const orderCustomerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  phone: z.string().trim().max(40),
  address: z.string().trim().min(3).max(150),
  postal: z.string().regex(/^\d{5}$/),
  city: z.string().trim().min(2).max(80),
});
export type OrderCustomer = z.infer<typeof orderCustomerSchema>;
export async function inspectManuscript(file: File) {
  if (file.size > MAX_MANUSCRIPT)
    throw new Error("Käsikirjoitus saa olla enintään 8 Mt.");
  if (file.size < 8) throw new Error("Tiedosto on tyhjä tai vioittunut.");
  const bytes = new Uint8Array(await file.arrayBuffer()),
    name = file.name.toLowerCase();
  const pdf = [37, 80, 68, 70, 45].every((x, i) => bytes[i] === x);
  if (pdf && name.endsWith(".pdf")) {
    // Review attachment only: do not execute/render untrusted PDF in the app.
    const text = new TextDecoder("latin1").decode(bytes);
    if (
      !text.includes("%%EOF") ||
      /\/(JavaScript|JS|Launch|EmbeddedFile|Encrypt)\b/.test(text)
    )
      throw new Error(
        "Valitse tavallinen PDF ilman salasanaa, upotettuja tiedostoja tai toiminnallista sisältöä."
      );
    return "pdf" as const;
  }
  if (
    name.endsWith(".docx") &&
    bytes[0] === 80 &&
    bytes[1] === 75 &&
    bytes[2] === 3 &&
    bytes[3] === 4
  ) {
    const header = new DataView(bytes.buffer);
    let start = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
      if (header.getUint32(i, true) === 0x06054b50) {
        start = i;
        break;
      }
    if (start < 0)
      throw new Error("Word-tiedoston rakennetta ei voitu tarkistaa.");
    const entries = header.getUint16(start + 10, true);
    let offset = header.getUint32(start + 16, true),
      total = 0,
      document = false;
    if (entries > 2000) throw new Error("Word-tiedosto sisältää liikaa osia.");
    for (let i = 0; i < entries; i++) {
      if (
        offset + 46 > bytes.length ||
        header.getUint32(offset, true) !== 0x02014b50
      )
        throw new Error("Word-tiedosto on vioittunut.");
      if (header.getUint16(offset + 8, true) & 1)
        throw new Error("Salattua Word-tiedostoa ei voi liittää.");
      const size = header.getUint32(offset + 24, true),
        length = header.getUint16(offset + 28, true),
        extra = header.getUint16(offset + 30, true),
        comment = header.getUint16(offset + 32, true);
      total += size;
      if (
        size > 32 * 1024 * 1024 ||
        total > 64 * 1024 * 1024 ||
        offset + 46 + length + extra + comment > bytes.length
      )
        throw new Error("Word-tiedoston purettu koko on liian suuri.");
      const entry = new TextDecoder()
        .decode(bytes.slice(offset + 46, offset + 46 + length))
        .toLowerCase();
      if (
        entry.includes("vbaproject") ||
        entry.includes("../") ||
        entry.startsWith("/")
      )
        throw new Error(
          "Makroja tai poikkeavaa tiedostorakennetta ei sallita."
        );
      if (entry === "word/document.xml") document = true;
      offset += 46 + length + extra + comment;
    }
    if (!document) throw new Error("Tiedosto ei ole tuettu Word-asiakirja.");
    return "docx" as const;
  }
  throw new Error(
    "Valitse PDF- tai DOCX-tiedosto. Tiedoston sisällön täytyy vastata tiedostopäätettä."
  );
}
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
