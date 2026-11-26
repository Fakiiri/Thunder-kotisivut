import { PDFDocument } from "pdf-lib";
import { pagesFor, type Production } from "./print-production";

export function pricedPdfPages(
  count: number,
  production: Pick<Production, "format" | "paper">
) {
  const pages = pagesFor(production.format, production.paper).find(
    p => p >= count
  );
  if (!Number.isSafeInteger(count) || count < 1 || !pages)
    throw Error("PDF:n sivumäärä ylittää hinnaston. Pyydä meiltä tarjous.");
  return pages;
}
export async function inspectPdf(
  bytes: Uint8Array,
  production: Pick<Production, "format" | "paper">,
  pad = false
) {
  const doc = await PDFDocument.load(bytes, {
    updateMetadata: false,
    throwOnInvalidObject: true,
  });
  if (doc.isEncrypted) throw Error("Salattua PDF-tiedostoa ei voi käyttää.");
  const count = doc.getPageCount(),
    billedPages = pricedPdfPages(count, production);
  const [width, height] = production.format.split("x").map(Number);
  const expected = { width: (width * 72) / 25.4, height: (height * 72) / 25.4 };
  for (const page of doc.getPages()) {
    const box = page.getTrimBox();
    if (
      Math.abs(box.width - expected.width) > 1.5 ||
      Math.abs(box.height - expected.height) > 1.5 ||
      page.getRotation().angle % 180 !== 0
    )
      throw Error(
        `PDF:n kaikkien sivujen on oltava valitussa koossa ${width} × ${height} mm, yksittäisinä sivuina.`
      );
  }
  const blankPages = billedPages - count;
  if (pad && blankPages) {
    const last = doc.getPage(count - 1),
      media = last.getMediaBox(),
      trim = last.getTrimBox(),
      bleed = last.getBleedBox(),
      crop = last.getCropBox();
    for (let n = 0; n < blankPages; n++) {
      const page = doc.addPage([media.width, media.height]);
      page.setMediaBox(media.x, media.y, media.width, media.height);
      page.setTrimBox(trim.x, trim.y, trim.width, trim.height);
      page.setBleedBox(bleed.x, bleed.y, bleed.width, bleed.height);
      page.setCropBox(crop.x, crop.y, crop.width, crop.height);
      page.setRotation(last.getRotation());
    }
  }
  return {
    sourcePages: count,
    billedPages,
    blankPages,
    bytes:
      pad && blankPages ? await doc.save({ addDefaultPage: false }) : bytes,
  };
}
