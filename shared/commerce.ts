export const ORDER_PACKAGES = {
  painatus: {
    name: "Kirjan painatuspalvelu",
    preparation:
      "Käsikirjoitus ja kansiprojektin tiedot ovat meillä jo. Vahvistamme toteutuneen sivumäärän, lopullisen painatushinnan ja painoaineiston ennen tuotantoa. Jos sivumäärä kasvaa yli 10 %, lisäkustannus laskutetaan erikseen. Mahdollinen hintaero sovitaan ennen painatusta.",
  },
  digi: {
    name: "Digi-paketti",
    preparation:
      "Valmistele käsikirjoituksesi, kirjan työnimi ja mahdolliset kansitoiveesi. Käymme kanssasi läpi e-kirjan ja äänikirjan aineistot ennen tuotannon aloittamista.",
  },
  printti: {
    name: "Printti-paketti",
    preparation:
      "Valmistele käsikirjoituksesi, mahdolliset kuvat ja kansitoiveesi. Varmistamme kanssasi painetun kirjan sekä digitaalisten formaattien aineistot ja aikataulun.",
  },
  premium: {
    name: "Premium-paketti",
    preparation:
      "Valmistele käsikirjoituksesi, mahdolliset kuvat, kansitoiveesi ja ajatuksesi kirjan kohderyhmästä. Käymme läpi julkaisun ja pakettiisi kuuluvan lanseerauksen seuraavat vaiheet.",
  },
  joulu990: {
    name: "990 € kirjajulkaisupaketti",
    preparation:
      "Valmistele valmis käsikirjoituksesi ja kansitoiveesi. Tarkistamme kanssasi A5-kirjan alle 256 sivun laajuuden, 100 kappaleen painoksen sekä toteutus- ja toimitusaikataulun.",
  },
} as const;

export type OrderPackageId = keyof typeof ORDER_PACKAGES;
export function isOrderPackageId(value: unknown): value is OrderPackageId {
  return typeof value === "string" && Object.hasOwn(ORDER_PACKAGES, value);
}
