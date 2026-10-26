import { z } from "zod";
import { SOFTCOVER_PRICING, QUANTITIES } from "./print-pricing-data";
export const BLEED_MM = 5;
export const SAFE_MM = 5;
export const LAYOUT_CENTS = 21700;
export const DELIVERY_CENTS = 5000;
export const productionSchema = z
  .object({
    format: z.string().max(20),
    paper: z.string().max(40),
    pages: z.number().int().min(1).max(2000),
    quantity: z.number().int().min(1).max(10000),
    interior: z.enum(["ready", "layout"]),
  })
  .refine(p => !!printEntry(p), {
    message:
      "Valitse hinnastossa oleva koko, paperi, sivumäärä ja painosmäärä.",
  });
export type Production = {
  format: string;
  paper: string;
  pages: number;
  quantity: number;
  interior: "ready" | "layout";
};
export const DEFAULT_PRODUCTION: Production = {
  format: "148x210",
  paper: "80g Standard",
  pages: 160,
  quantity: 100,
  interior: "ready",
};
export const FORMATS = Array.from(
  new Set(SOFTCOVER_PRICING.map(x => x.format))
);
export function papersFor(format: string) {
  return Array.from(
    new Set(
      SOFTCOVER_PRICING.filter(x => x.format === format).map(x => x.paper)
    )
  );
}
export function pagesFor(format: string, paper: string) {
  return SOFTCOVER_PRICING.filter(x => x.format === format && x.paper === paper)
    .map(x => x.pages)
    .sort((a, b) => a - b);
}
export function quantitiesFor(
  p: Pick<Production, "format" | "paper" | "pages">
) {
  const e = SOFTCOVER_PRICING.find(
    x => x.format === p.format && x.paper === p.paper && x.pages === p.pages
  );
  return e
    ? QUANTITIES.filter(q => (e.prices as Record<string, number>)[q] != null)
    : [];
}
export function printEntry(
  p: Pick<Production, "format" | "paper" | "pages" | "quantity">
) {
  const e = SOFTCOVER_PRICING.find(
    x => x.format === p.format && x.paper === p.paper && x.pages === p.pages
  );
  return e &&
    QUANTITIES.includes(p.quantity) &&
    (e.prices as Record<string, number>)[p.quantity] > 0
    ? e
    : null;
}
export function printQuote(
  p: Production,
  deliveryCents: number | null = DELIVERY_CENTS
) {
  const e = printEntry(p);
  if (!e) return null;
  const unitCents = Math.round(
    (e.prices as Record<string, number>)[p.quantity] * 100
  );
  const printCents = unitCents * p.quantity;
  return {
    unitCents,
    printCents,
    layoutCents: p.interior === "layout" ? LAYOUT_CENTS : 0,
    deliveryCents,
    subtotalCents: printCents + (p.interior === "layout" ? LAYOUT_CENTS : 0),
    totalCents:
      deliveryCents === null
        ? null
        : printCents +
          (p.interior === "layout" ? LAYOUT_CENTS : 0) +
          deliveryCents,
  };
}
export function coverGeometry(p: Production) {
  const e = printEntry(p);
  if (!e)
    throw new Error(
      "Kannen mittoja ei voida laskea ilman hinnastossa olevaa yhdistelmää."
    );
  const [widthMm, heightMm] = p.format.split("x").map(Number);
  const spineMm = e.spine_mm ?? 0;
  return {
    widthMm,
    heightMm,
    spineMm,
    bleedMm: BLEED_MM,
    safeMm: SAFE_MM,
    sheetWidthMm: 2 * widthMm + spineMm + 2 * BLEED_MM,
    sheetHeightMm: heightMm + 2 * BLEED_MM,
    backX: BLEED_MM,
    spineX: BLEED_MM + widthMm,
    frontX: BLEED_MM + widthMm + spineMm,
    binding: p.pages === 32 ? "stapled" : "glued",
  };
}
export function formatMoney(cents: number) {
  return (
    (cents / 100).toLocaleString("fi-FI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}
export function formatMm(mm: number) {
  return mm.toLocaleString("fi-FI", { maximumFractionDigits: 2 }) + " mm";
}
export function normalizeProduction(
  p: Production,
  patch: Partial<Production>
): Production {
  const next = { ...p, ...patch };
  if (!FORMATS.includes(next.format)) next.format = DEFAULT_PRODUCTION.format;
  if (!papersFor(next.format).includes(next.paper))
    next.paper = papersFor(next.format)[0];
  if (!pagesFor(next.format, next.paper).includes(next.pages))
    next.pages = pagesFor(next.format, next.paper)[0];
  if (!quantitiesFor(next).includes(next.quantity))
    next.quantity = quantitiesFor(next)[0];
  return next;
}
