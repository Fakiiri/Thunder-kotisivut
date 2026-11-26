import type { Production } from "@shared/print-production";
export type PdfPageInfo = {
  sourcePages: number;
  billedPages: number;
  blankPages: number;
};
export async function readPdfPages(
  file: File,
  production: Production
): Promise<PdfPageInfo> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./pdf-manuscript.worker.ts", import.meta.url),
      { type: "module" }
    );
    const finish = () => {
      clearTimeout(timeout);
      worker.terminate();
    };
    const timeout = setTimeout(() => {
      finish();
      reject(Error("PDF:n lukeminen kesti liian kauan. Tarkista tiedosto."));
    }, 15000);
    worker.onmessage = event => {
      finish();
      event.data.error ? reject(Error(event.data.error)) : resolve(event.data);
    };
    worker.onerror = () => {
      finish();
      reject(Error("PDF:n lukeminen epäonnistui. Tarkista tiedosto."));
    };
    worker.postMessage({ bytes, production }, [bytes.buffer]);
  });
}
