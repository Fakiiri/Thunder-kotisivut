import { Worker } from "node:worker_threads";
import { createRequire } from "node:module";
import type { Production } from "../../shared/print-production";
import { pricedPdfPages } from "../../shared/pdf-manuscript";
const require = createRequire(import.meta.url);
// Untrusted PDFs are parsed off the request thread, with a time and heap bound.
export async function preparePdf(bytes: Buffer, production: Production) {
  const result = await new Promise<{ sourcePages: number; bytes: Uint8Array }>(
    (resolve, reject) => {
      const worker = new Worker(
        `const {parentPort,workerData}=require('node:worker_threads');
      const {PDFDocument}=require(workerData.module);
      (async()=>{const doc=await PDFDocument.load(workerData.bytes,{updateMetadata:false,throwOnInvalidObject:true});
      if(doc.isEncrypted)throw Error('invalid-file'); const count=doc.getPageCount();
      if(count<1||count>workerData.pages)throw Error('page-count-mismatch');
      for(const page of doc.getPages()){const b=page.getTrimBox();if(Math.abs(b.width-workerData.width)>1.5||Math.abs(b.height-workerData.height)>1.5||page.getRotation().angle%180!==0)throw Error('pdf-size-mismatch');}
      const last=doc.getPage(count-1),m=last.getMediaBox(),t=last.getTrimBox(),b=last.getBleedBox(),c=last.getCropBox();
      for(let n=count;n<workerData.pages;n++){const p=doc.addPage([m.width,m.height]);p.setMediaBox(m.x,m.y,m.width,m.height);p.setTrimBox(t.x,t.y,t.width,t.height);p.setBleedBox(b.x,b.y,b.width,b.height);p.setCropBox(c.x,c.y,c.width,c.height);p.setRotation(last.getRotation());}
      parentPort.postMessage({sourcePages:count,bytes:count===workerData.pages?workerData.bytes:await doc.save({addDefaultPage:false})});
      })().catch(e=>parentPort.postMessage({error:e.message}));`,
        {
          eval: true,
          resourceLimits: { maxOldGenerationSizeMb: 128 },
          workerData: {
            module: require.resolve("pdf-lib"),
            bytes,
            pages: production.pages,
            width: (Number(production.format.split("x")[0]) * 72) / 25.4,
            height: (Number(production.format.split("x")[1]) * 72) / 25.4,
          },
        }
      );
      const done = () => {
        clearTimeout(timer);
        void worker.terminate();
      };
      const timer = setTimeout(() => {
        done();
        reject(Error("invalid-file"));
      }, 15000);
      worker.once("message", r => {
        done();
        r.error ? reject(Error(r.error)) : resolve(r);
      });
      worker.once("error", () => {
        done();
        reject(Error("invalid-file"));
      });
      worker.once("exit", code => {
        if (code !== 0) {
          clearTimeout(timer);
          reject(Error("invalid-file"));
        }
      });
    }
  );
  const billedPages = pricedPdfPages(result.sourcePages, production);
  if (billedPages !== production.pages) throw Error("page-count-mismatch");
  return {
    sourcePages: result.sourcePages,
    billedPages,
    blankPages: billedPages - result.sourcePages,
    bytes: Buffer.from(result.bytes),
  };
}
