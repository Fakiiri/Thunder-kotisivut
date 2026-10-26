import { Link } from "wouter";
import {
  printQuote,
  formatMoney,
  type Production,
} from "@shared/print-production";
import { coverRequestURL } from "@shared/cover-request";
export default function CoverPrintNext({
  production: p,
}: {
  production: Production;
}) {
  const q = printQuote(p)!;
  return (
    <section id="kannen-tilaus" className="cover-next">
      <div>
        <p className="cover-eyebrow">3. KIRJASI PAINOON</p>
        <h2>Haluatko toteuttaa kirjasi?</h2>
        <p>
          {p.quantity} pehmeäkantista kirjaa, {p.format.replace("x", " × ")} mm,{" "}
          {p.pages} sivua: <strong>{formatMoney(q.totalCents!)}</strong>, sis.
          alv ja 50 € kotiintoimitus
          {p.interior === "layout" ? " sekä 217 € sisäsivutaitto" : ""}.
        </p>
        <p>
          Lataa kansiluonnos ja työtiedosto talteen. Siirry tarjouspyyntöön,
          kirjan valinnat siirtyvät lomakkeelle. Aineiston toimituksesta ja
          lopullisesta toteutuksesta sovitaan kanssasi erikseen. Tällä sivulla
          ei tehdä tilausta tai veloitusta.
        </p>
        <p>
          Kansiluonnos tarvitsee vielä painoaineiston viimeistelyn. Sisuksen
          taitto voi muuttaa sivumäärää, selkää ja hintaa.
        </p>
      </div>
      <Link className="cover-primary" href={coverRequestURL(p)}>
        Pyydä toteutus tälle kirjalle →
      </Link>
    </section>
  );
}
