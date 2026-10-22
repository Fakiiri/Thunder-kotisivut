import { answerSummary, quizResult } from "../../shared/publication-quiz";
import type { Job } from "./store";
export function escapeHTML(s: string) {
  return s.replace(
    /[&<>"']/g,
    c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!
  );
}
export function quizMessage(job: Job, base: string) {
  const r = quizResult(job.lead.answers);
  const resultLink = `${base}/julkaisutesti#oma-tulos=${job.lead.token}`;
  const stop = `${base}/api/quiz/unsubscribe/${job.lead.token}`;
  const call = `${base}/julkaisutesti#puhelu=${job.lead.token}`;
  let subject = "Testituloksesi ja kolme seuraavaa askelta";
  let text = `Hei ${job.lead.name || "kirjoittaja"}!\n\nProfiilisi: ${r.name}.\n${r.summary}\n\n${r.ready ? "Käsikirjoituksesi on oman arviosi mukaan valmis tuotantoon." : "Viimeistele käsikirjoitus ennen tuotantopaketin tilaamista."}\n\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}\n\nSuuntaa antava vaihtoehto: ${r.package}, ${r.price} € (sis. ALV 25,5 %).\n${r.reason}\n${r.notes.join("\n")}\n\n${r.caveat}\n\nAvaa oma toimintasuunnitelmasi: ${resultLink}\n\nVaraa maksuton 15 minuutin julkaisupuhelu Santerin kanssa: ${call}\nPuhelussa käymme läpi tilanteesi ja järkevän seuraavan askeleen. Ei ostopakkoa.`;
  if (job.kind === "owner") {
    subject = `Uusi julkaisutestiliidi: ${r.package}`;
    text = `Nimi: ${job.lead.name}\nSähköposti: ${job.lead.email}\nProfiili: ${r.name}\nMarkkinointilupa kahdelle jatkoviestille: ${job.lead.marketing ? "kyllä" : "ei"}\nLähde: ${job.lead.source}\n\n${answerSummary(job.lead.answers)}\n\nVastaa asiakkaalle henkilökohtaisesti tarvittaessa. Älä lisää luvattomaan markkinointisarjaan.`;
  } else if (job.kind === "booking-owner") {
    subject = "Julkaisupuhelupyyntö – sovi aika yhden arkipäivän kuluessa";
    text = `${job.lead.name}\n${job.lead.email}\n${job.details}\n\n${answerSummary(job.lead.answers)}\n\nAsiakkaalle ei ole luvattu varattua kellonaikaa. Sovi 15 minuutin puhelu henkilökohtaisesti. Automaattiset jatkoviestit on pysäytetty.`;
  } else if (job.kind === "booking-customer") {
    subject = "Julkaisupuhelupyyntösi on vastaanotettu";
    text = `Hei ${job.lead.name || ""}!\n\nKiitos puhelupyynnöstäsi. Santeri ottaa sinuun yhteyttä yhden arkipäivän kuluessa, jotta voitte sopia maksuttoman 15 minuutin julkaisupuhelun ajan.\n\nToiveesi: ${job.details}\n\nAikaa ei ole vielä varattu kalenteriin. Sinun ei tarvitse lähettää käsikirjoitusta etukäteen.\n\nVoit vastata tähän sähköpostiin, jos haluat täydentää tietojasi.`;
  } else if (job.kind === "day2") {
    subject = r.ready
      ? "Kolme tarkistusta ennen kuin kirjasi siirtyy tuotantoon"
      : "Näin viet käsikirjoitustasi seuraavaan vaiheeseen";
    text = `Hei ${job.lead.name || "kirjoittaja"}!\n\nJulkaisutestissä sinulle sopivaksi suunnaksi nousi ${r.package}.\n\n${r.steps[0]}\n\nTarkista lisäksi: 1) onko tekstistä yksi lopullinen versio, 2) ovatko kuvien käyttöluvat kunnossa ja 3) kenelle kirja on tarkoitettu.\n\n${r.ready ? "Jos haluat varmistaa toteutuksen, käydään tilanteesi yhdessä läpi." : "Kirjoittamiselle saa antaa aikaa. Voimme puhelussa auttaa hahmottamaan, mitä kannattaa tehdä ennen tuotantoa."}\n\nVaraa maksuton 15 minuutin julkaisupuhelu: ${call}`;
  } else if (job.kind === "day5") {
    subject = "Mikä olisi kirjallesi järkevä seuraava askel?";
    text = `Hei ${job.lead.name || "kirjoittaja"}!\n\nTestisi perusteella ${r.package} voisi sopia tavoitteisiisi.\n${r.reason}\n\nDigi 890 € · Printti 1 690 € · Premium 2 990 € (sis. ALV 25,5 %). ${r.caveat}\n\nEnnen päätöstä kannattaa varmistaa tarvittavat formaatit, painosmäärä ja käsikirjoituksen valmius. Sinun ei tarvitse ratkaista kaikkea yksin.\n\nVaraa maksuton 15 minuutin julkaisupuhelu Santerin kanssa: ${call}\n\nTämä on viimeinen tämän testin perusteella lähettämämme jatkoviesti. Voit myös vastata tähän ja kertoa, mikä mietityttää.`;
  }
  text +=
    "\n\nSanteri Sandberg\nThunder Kustannus / Thunder Media Oy\ninfo@thunderkustannus.fi\nSalopääntie 76, 12540 Launonen";
  if (["day2", "day5"].includes(job.kind))
    text += `\n\nSait viestin, koska annoit julkaisutestissä luvan kahteen jatkoviestiin. Peruuta testin jatkoviestit: ${stop}`;
  return {
    subject,
    textContent: text,
    htmlContent: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#242321;line-height:1.7"><div style="background:#191918;color:white;padding:24px;border-top:5px solid #ff620f"><strong>Thunder<span style="color:#ff620f">Kustannus</span></strong></div><div style="padding:24px">${escapeHTML(
      text
    )
      .replace(
        /https:\/\/[^\s<]+/g,
        url => `<a style="color:#c64600" href="${url}">${url}</a>`
      )
      .replace(/\n/g, "<br>")}</div></div>`,
  };
}
