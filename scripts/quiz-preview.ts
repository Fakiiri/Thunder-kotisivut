import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { quizMessage } from "../server/quiz/messages";
import type { Job } from "../server/quiz/store";
const output=process.argv[2];if(!output)throw Error("Output directory required");
await mkdir(output,{recursive:true});
const lead={id:"preview",email:"esimerkki@example.com",name:"Kirjoittaja",answers:{genre:"fiction",readiness:"ready",goal:"sales",format:"digital",copies:"none",launch:"own",timeline:"soon",audio:"yes"} as const,marketing:true,token:"a".repeat(64),source:"preview"};
for(const kind of ["result","day2","day5","owner"]) {
  const message=quizMessage({id:kind,key:"preview-only",attempts:0,kind,lead} as Job,"https://www.thunderkustannus.fi");
  await writeFile(path.join(output,`${kind}.html`),`<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${message.subject}</title><div style="padding:12px;background:#fff0cc;font:14px Arial">SÄHKÖPOSTIN ESIKATSELU. Esimerkkitunnisteet eivät toimi. Viestiä ei lähetetty.</div>${message.htmlContent}`);
  await writeFile(path.join(output,`${kind}.txt`),`Aihe: ${message.subject}\n\n${message.textContent}`);
}
await writeFile(path.join(output,"viestit.html"),`<!doctype html><html lang="fi"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Julkaisutestin sähköpostit</title><body style="font:18px system-ui;max-width:720px;margin:60px auto;padding:24px"><h1>Julkaisutestin sähköpostit</h1><p>Luonnokset, ei lähetetty. Kaksi jatkoviestiä lähetetään vain erillisellä luvalla. Varauslinkki johtaa vahvistettuun ”15 min / Santeri” -kalenteriin.</p><ol><li><a href="result.html">Heti: oma tulos ja toimintasuunnitelma</a></li><li><a href="day2.html">Päivä 2: käsikirjoituksen valmistelu</a></li><li><a href="day5.html">Päivä 5: seuraava askel ja julkaisupuhelu</a></li></ol><p><a href="owner.html">Santerille tuleva liidi-ilmoitus</a></p></body></html>`);
console.log("Quiz email previews written. No messages sent.");
