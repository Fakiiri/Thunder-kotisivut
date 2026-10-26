import { coverGeometry, type Production } from "@shared/print-production";
// Exact millimetre page, TrimBox and BleedBox. Browser JPEG is RGB; this is
// dimensioned review artwork, not a claim of PDF/X or a CMYK press profile.
export function coverPdf(
  jpeg: Uint8Array,
  pixelWidth: number,
  pixelHeight: number,
  p: Production
): Blob {
  const g = coverGeometry(p),
    pt = 72 / 25.4,
    w = g.sheetWidthMm * pt,
    h = g.sheetHeightMm * pt,
    b = 5 * pt;
  const enc = new TextEncoder(),
    chunks: Uint8Array[] = [],
    offsets: number[] = [0];
  let length = 0;
  const add = (v: string | Uint8Array) => {
    const bytes = typeof v === "string" ? enc.encode(v) : v;
    chunks.push(bytes);
    length += bytes.length;
  };
  const object = (id: number, value: string | (() => void)) => {
    offsets[id] = length;
    add(id + " 0 obj\n");
    if (typeof value === "string") add(value);
    else value();
    add("\nendobj\n");
  };
  add("%PDF-1.4\n");
  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  object(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  object(
    3,
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " +
      w +
      " " +
      h +
      "] /BleedBox [0 0 " +
      w +
      " " +
      h +
      "] /TrimBox [" +
      b +
      " " +
      b +
      " " +
      (w - b) +
      " " +
      (h - b) +
      "] /Resources << /XObject << /Cover 4 0 R >> >> /Contents 5 0 R >>"
  );
  object(4, () => {
    add(
      "<< /Type /XObject /Subtype /Image /Width " +
        pixelWidth +
        " /Height " +
        pixelHeight +
        " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
        jpeg.length +
        " >>\nstream\n"
    );
    add(jpeg);
    add("\nendstream");
  });
  const stream = "q\n" + w + " 0 0 " + h + " 0 0 cm\n/Cover Do\nQ\n";
  object(
    5,
    "<< /Length " +
      enc.encode(stream).length +
      " >>\nstream\n" +
      stream +
      "endstream"
  );
  const xref = length;
  add("xref\n0 6\n0000000000 65535 f \n");
  for (let id = 1; id <= 5; id++)
    add(String(offsets[id]).padStart(10, "0") + " 00000 n \n");
  add("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF");
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
export async function canvasJpeg(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>(r =>
    canvas.toBlob(r, "image/jpeg", 0.96)
  );
  if (!blob) throw new Error("PDF-kuvan muodostaminen epäonnistui.");
  return new Uint8Array(await blob.arrayBuffer());
}
