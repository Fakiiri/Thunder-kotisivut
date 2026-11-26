export const PAGE_PRICE_POLICY_VERSION = "file-type-pages-v2";
export const PAGE_PRICE_NOTICE =
  "Word-aineiston hinta perustuu arvioituun sivumäärään. Lopullinen sivumäärä selviää taitossa. Jos se ylittää arvion yli 10 %, lähetämme lisäkustannuksesta erillisen laskun. Mahdollinen lisämaksu vahvistetaan kanssasi ennen painatusta.";
export const PDF_PRICE_NOTICE = "PDF-aineiston hinta on lukittu tämän tiedoston mukaan. Sivumäärä täydennetään hinnaston seuraavaan sivumäärään tyhjillä loppusivuilla. Tästä sivumäärästä ei tule lisälaskua. Aineiston vaihtaminen edellyttää uutta hintalaskentaa.";
export const MANUAL_REVIEW_NOTICE = "Tarkistamme aineiston vielä manuaalisesti ennen painoon lähettämistä. Jos havaitsemme ongelmia, otamme sinuun yhteyttä ennen tuotantoa. Tarkistus ei sisällä oikolukua tai taiton korjaamista.";

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
