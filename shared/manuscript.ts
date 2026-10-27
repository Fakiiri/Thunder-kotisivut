import { z } from "zod";
export const MAX_MANUSCRIPT = 8 * 1024 * 1024;
export const orderCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[^\x00-\x1f\x7f]+$/),
  email: z.email().max(200),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[^\x00-\x1f\x7f]*$/),
  address: z
    .string()
    .trim()
    .min(3)
    .max(150)
    .regex(/^[^\x00-\x1f\x7f]+$/),
  postal: z.string().regex(/^\d{5}$/),
  city: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[^\x00-\x1f\x7f]+$/),
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
