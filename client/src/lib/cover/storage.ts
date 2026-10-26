import { projectSchema, type CoverProject } from "./model";
const DB = "thunder-cover-drafts-v1";
async function database() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore("drafts");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () =>
      reject(new Error("Selaintallennus ei ole käytettävissä."));
  });
}
let draftWrites: Promise<void> = Promise.resolve();
export function storeDraft(project: CoverProject | null): Promise<void> {
  // Preserve write/delete order even if IndexedDB opens complete out of order.
  const next = draftWrites.catch(() => {}).then(() => writeDraft(project));
  draftWrites = next;
  return next;
}
async function writeDraft(project: CoverProject | null) {
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("drafts", "readwrite");
      const store = tx.objectStore("drafts");
      if (project) store.put(projectSchema.parse(project), "current");
      else store.delete("current");
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(
          new Error(
            "Luonnoksen tallennus ei onnistunut. Lataa työtiedosto talteen."
          )
        );
      tx.onabort = () => reject(new Error("Tallennus keskeytyi."));
    });
  } finally {
    db.close();
  }
}
export async function loadDraft(): Promise<CoverProject | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const req = db
        .transaction("drafts", "readonly")
        .objectStore("drafts")
        .get("current");
      req.onsuccess = () => {
        const result = projectSchema.safeParse(req.result);
        resolve(result.success ? result.data : null);
      };
      req.onerror = () =>
        reject(new Error("Tallennettua luonnosta ei voitu avata."));
    });
  } finally {
    db.close();
  }
}
export async function readImage(
  file: Blob
): Promise<NonNullable<CoverProject["image"]>> {
  if (file.size > 12 * 1024 * 1024)
    throw new Error(
      "Kuva on liian suuri. Valitse enintään 12 Mt:n JPG- tai PNG-kuva."
    );
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((x, i) => bytes[i] === x);
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (!png && !jpg)
    throw new Error(
      "Valitse JPG- tai PNG-kuva. Muita tiedostomuotoja ei avata."
    );
  const buffer = await file.arrayBuffer();
  const header = new DataView(buffer);
  let width = 0,
    height = 0;
  if (png && buffer.byteLength >= 24) {
    width = header.getUint32(16);
    height = header.getUint32(20);
  }
  if (jpg) {
    let offset = 2;
    while (offset + 4 < buffer.byteLength) {
      if (header.getUint8(offset) !== 255) break;
      const marker = header.getUint8(offset + 1);
      offset += 2;
      if (marker === 216 || marker === 1) continue;
      if (marker === 218 || marker === 217) break;
      const length = header.getUint16(offset);
      if (length < 2 || offset + length > buffer.byteLength) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker) &&
        length >= 7
      ) {
        height = header.getUint16(offset + 3);
        width = header.getUint16(offset + 5);
        break;
      }
      offset += length;
    }
  }
  if (
    !width ||
    !height ||
    width * height > 24_000_000 ||
    Math.max(width, height) > 12000
  )
    throw new Error(
      "Kuvan mitat eivät sovellu editoriin. Käytä enintään 24 megapikselin kuvaa (pisin sivu enintään 12 000 px)."
    );
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error("Alkuperäiskuvan lukeminen epäonnistui."));
      reader.readAsDataURL(
        new Blob([buffer], { type: png ? "image/png" : "image/jpeg" })
      );
    });
    return {
      data,
      width: img.naturalWidth,
      height: img.naturalHeight,
      original: true,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
export async function validateProjectImage(
  p: CoverProject
): Promise<CoverProject> {
  if (!p.image) return p;
  const binary = atob(p.image.data.split(",")[1]);
  const image = await readImage(
    new Blob([Uint8Array.from(binary, c => c.charCodeAt(0))])
  );
  return { ...p, image: { ...image, original: p.image.original === true } };
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
