export const PAGE_PRICE_POLICY_VERSION = "actual-pages-v1";
export const PAGE_PRICE_NOTICE =
  "Hinta perustuu ilmoittamaasi sivumäärään. Lopullinen painatushinta määräytyy toteutuneen sivumäärän mukaan. Jos sivumäärä kasvaa yli 10 %, lisäkustannus laskutetaan erikseen. Mahdollinen hintaero vahvistetaan kanssasi ennen painatusta.";

// This determines the review/settlement path. It never initiates a charge or refund.
export function assessPageChange(estimatedPages: number, actualPages: number) {
  if (
    !Number.isSafeInteger(estimatedPages) ||
    estimatedPages < 1 ||
    estimatedPages > 10000 ||
    !Number.isSafeInteger(actualPages) ||
    actualPages < 1 ||
    actualPages > 10000
  )
    throw Error("invalid-page-count");
  return {
    estimatedPages,
    actualPages,
    difference: actualPages - estimatedPages,
    priceReviewRequired: true,
    increasedMoreThanTenPercent: actualPages * 10 > estimatedPages * 11,
  };
}
export function assessPriceSettlement(
  initialCents: number,
  finalCents: number
) {
  if (
    !Number.isSafeInteger(initialCents) ||
    initialCents <= 0 ||
    !Number.isSafeInteger(finalCents) ||
    finalCents <= 0
  )
    throw Error("invalid-settlement-amount");
  const differenceCents = finalCents - initialCents;
  return {
    differenceCents,
    action:
      differenceCents > 0
        ? ("additional-payment" as const)
        : differenceCents < 0
          ? ("credit" as const)
          : ("none" as const),
    automaticCollection: false as const,
  };
}
