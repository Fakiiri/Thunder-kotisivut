import {
  productionSchema,
  printQuote,
  formatMoney,
  type Production,
} from "./print-production";
export function coverRequestURL(p: Production) {
  const q = new URLSearchParams({
    source: "kansisuunnittelija",
    format: p.format,
    paper: p.paper,
    pages: String(p.pages),
    quantity: String(p.quantity),
    interior: p.interior,
  });
  return "/tarjouspyynto?" + q.toString();
}
export function coverRequestMessage(search: string): string {
  const q = new URLSearchParams(search);
  if (q.get("source") !== "kansisuunnittelija") return "";
  const parsed = productionSchema.safeParse({
    format: q.get("format"),
    paper: q.get("paper"),
    pages: Number(q.get("pages")),
    quantity: Number(q.get("quantity")),
    interior: q.get("interior"),
  });
  if (!parsed.success) return "";
  const p = parsed.data,
    price = printQuote(p)!;
  return [
    "Kansisuunnittelijasta: pyydän tarjouksen painatuksesta.",
    "Koko: " + p.format.replace("x", " × ") + " mm",
    "Sisuspaperi: " + p.paper,
    "Sivumäärä: " + p.pages + " (vahvistetaan lopullisesta sisuksesta)",
    "Painos: " + p.quantity + " kpl",
    "Sisäsivujen taitto: " +
      (p.interior === "layout"
        ? "tarvitaan, 217 € sis. alv"
        : "oma painovalmis PDF"),
    "Laskurin kokonaishinta: " +
      formatMoney(price.totalCents!) +
      " (sis. alv ja 50 € kotiintoimitus).",
    "Kansiluonnoksen painokelpoisuus ja lopullinen tilaus vahvistetaan erikseen.",
  ].join("\n");
}
