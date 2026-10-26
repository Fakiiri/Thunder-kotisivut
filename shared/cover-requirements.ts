// Conservative Thunder design rules, adopted from Totem technical guidance.
// Drukatava tariff dimensions remain the source for this tool; these are not
// a claim that the two printers use interchangeable spine dimensions.
// Verified 2026-10-26: https://totem.com.pl/en/guidelines-for-preparing-materials-for-digital-printing/
export const MIN_SPINE_TEXT_MM = 6;
export const SPINE_TEXT_INSET_MM = 1.5;
export function allowsSpineText(widthMm: number) {
  return widthMm >= MIN_SPINE_TEXT_MM;
}
