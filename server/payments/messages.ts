import { ORDER_PACKAGES } from "../../shared/commerce";
import type { PaidOrder } from "./core";

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
export type ResponseWindow = "24h" | "business-day";
export function customerMessage(order: PaidOrder, window: ResponseWindow) {
  const pkg = ORDER_PACKAGES[order.packageId];
  const promise = window === "24h" ? "24 tunnin kuluessa" : "yhden arkipäivän kuluessa";
  const text = [
    "Hei!", "", `Kiitos ostostasi! Olemme vastaanottaneet maksusi: ${pkg.name}.`, "",
    `Otamme sinuun yhteyttä ${promise} ja annamme ohjeet aineiston toimittamista varten.`, "",
    pkg.preparation, "", "Sinun ei tarvitse lähettää tiedostoja vielä. Sovimme kanssasi aineiston toimitustavan ja seuraavat vaiheet henkilökohtaisesti.", "",
    "Jos haluat kertoa jotain tilauksestasi jo nyt, voit vastata tähän viestiin.", "",
    `Tilaustunnus: ${order.sessionId}`, "", "Ystävällisin terveisin,", "Santeri Sandberg", "Thunder Kustannus", "info@thunderkustannus.fi", "040 351 9546",
  ].join("\n");
  return { subject: `Kiitos tilauksestasi – ${pkg.name}`, textContent: text,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#171715"><h1 style="font-size:25px">Thunder<span style="color:#ff620a">Kustannus</span></h1>${text.split("\n\n").map(p => `<p style="font-size:16px;line-height:1.7">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` };
}

export function ownerMessage(order: PaidOrder, window: ResponseWindow) {
  const pkg = ORDER_PACKAGES[order.packageId];
  const total = new Intl.NumberFormat("fi-FI", { style: "currency", currency: "EUR" }).format(order.amountTotal / 100);
  return { subject: `Uusi maksettu tilaus: ${pkg.name}`, textContent: [
    "Uusi maksettu tilaus Thunder Kustannuksen sivustolta.", "",
    `Paketti: ${pkg.name}`, `Asiakas: ${order.name || "Nimeä ei annettu"}`,
    `Sähköposti: ${order.email}`, `Maksettu summa: ${total}`, `Stripe-tilaustunnus: ${order.sessionId}`, "",
    `Ota asiakkaaseen yhteyttä ${window === "24h" ? "24 tunnin" : "yhden arkipäivän"} kuluessa ja lähetä aineiston toimitusohjeet.`,
    "Ostajan lisääminen Brevon Tilanneet-listalle käsitellään omana jonotehtävänään. Tarkista jonon tilanne, jos myyntisarja on käynnissä.",
  ].join("\n") };
}
