import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import sharp from "sharp";
import PDFDocument from "pdfkit";
import { create as readFont } from "fontkit";
import {
  projectSchema,
  coverLayout,
  cropImage,
  type CoverProject,
} from "../../client/src/lib/cover/model";
import {
  renderCover,
  coverWarnings,
  type CoverTextRun,
} from "../../client/src/lib/cover/render";
import { registerCoverFonts, coverFontFile } from "./fonts";
export type PressProfile = {
  id: string;
  icc: string;
  conversionConfigured: boolean;
  maxInkPercent: number;
  minimumImageDpi: number;
};
export type Issue = { code: string; message: string };
export type Preflight = {
  fingerprint: string;
  errors: Issue[];
  warnings: Issue[];
  widthMm: number;
  heightMm: number;
  spineMm: number;
  effectiveDpi: number | null;
  status: "review" | "blocked" | "technical-pass";
};
const fontCache = new Map<string, ReturnType<typeof readFont>>();
function font(sans: boolean, bold: boolean) {
  const path = coverFontFile(sans, bold);
  if (!fontCache.has(path)) fontCache.set(path, readFont(readFileSync(path)));
  return fontCache.get(path)!;
}
export function projectFingerprint(p: CoverProject) {
  return createHash("sha256")
    .update(JSON.stringify(projectSchema.parse(p)))
    .digest("hex");
}
async function scene(p: CoverProject) {
  registerCoverFonts();
  const g = coverLayout(p, "spread"),
    s = (300 * g.widthMm) / (25.4 * g.width);
  const width = Math.round(g.canvasWidth * s),
    height = Math.round(g.canvasHeight * s);
  if (width * height > 24_000_000)
    throw Error("Kansi ylittää turvallisen kuvakoon.");
  const canvas = createCanvas(width, height),
    text: CoverTextRun[] = [];
  let image: Awaited<ReturnType<typeof loadImage>> | undefined;
  if (p.image) {
    const raw = Buffer.from(p.image.data.split(",")[1], "base64");
    if (raw.length > 12 * 1024 * 1024)
      throw Error("Kuva ylittää 12 Mt:n rajan.");
    const meta = await sharp(raw, { limitInputPixels: 24_000_000 }).metadata();
    if (!["jpeg", "png"].includes(meta.format || ""))
      throw Error("Kuvan tiedostotyyppi ei kelpaa.");
    const rotated = (meta.orientation || 0) >= 5;
    if (
      (rotated ? meta.height : meta.width) !== p.image.width ||
      (rotated ? meta.width : meta.height) !== p.image.height
    )
      throw Error("Kuvan todelliset mitat eivät vastaa projektia.");
    const srgb = await sharp(raw, { limitInputPixels: 24_000_000 })
      .rotate()
      .toColourspace("srgb")
      .png()
      .toBuffer();
    image = await loadImage(srgb);
    Object.defineProperties(image, {
      naturalWidth: { value: image.width },
      naturalHeight: { value: image.height },
    });
  }
  const boxes = renderCover(
    canvas as unknown as HTMLCanvasElement,
    p,
    "spread",
    {
      backgroundOnly: true,
      textRuns: text,
      image: image as unknown as HTMLImageElement,
    }
  );
  return { canvas, boxes, text, g };
}
export async function inspectCover(
  input: unknown,
  profile: PressProfile | null,
  options: { interiorPageCount?: number; acknowledgedFingerprint?: string } = {}
) {
  const p = projectSchema.parse(input),
    sc = await scene(p),
    { g, text, boxes } = sc,
    errors: Issue[] = [],
    warnings: Issue[] = [];
  const add = (code: string, message: string) => errors.push({ code, message });
  if (!profile || !profile.conversionConfigured)
    add("profile", "CMYK-muunnos ei ole käytettävissä.");
  if (
    profile &&
    (!Number.isFinite(profile.maxInkPercent) ||
      profile.maxInkPercent < 100 ||
      profile.maxInkPercent > 400 ||
      !Number.isFinite(profile.minimumImageDpi) ||
      profile.minimumImageDpi < 200)
  )
    add("profile-settings", "Painoprofiilin raja-arvot eivät kelpaa.");
  if (
    p.production.interior !== "ready" ||
    options.interiorPageCount !== p.production.pages
  )
    add("interior", "Lopullisen sisuksen sivumäärä ja selkä pitää vahvistaa.");
  if (!p.title.trim() || !p.author.trim())
    add(
      "missing-text",
      "Lisää kirjan ja tekijän nimi tai sovi poikkeuksesta kanssamme."
    );
  if (
    p.author.includes("Tekijän nimi") ||
    p.back.startsWith("Kirjoita tähän teoksesi esittely.")
  )
    add("placeholder", "Vaihda mallitekstit omiin tietoihisi.");
  if (p.spine.trim() && g.spineMm < 6)
    add("narrow-spine", "Alle 6 mm:n selässä ei käytetä selkätekstiä.");
  for (const b of boxes)
    if (b.overflow)
      add(
        "text-placement",
        "Teksti ei mahdu turva-alueelle tai osuu viivakoodivaraukseen: " + b.key
      );
  for (const run of text) {
    const f = font(p.font === "sans", run.bold);
    for (const ch of run.text) {
      if (
        !/\s/.test(ch) &&
        !(
          "hasGlyphForCodePoint" in f &&
          f.hasGlyphForCodePoint(ch.codePointAt(0)!)
        )
      ) {
        add("glyph", "Valittu fontti ei sisällä merkkiä: " + ch);
        break;
      }
    }
  }
  let effectiveDpi: number | null = null;
  if (p.image) {
    if (!p.image.original)
      add(
        "original-image",
        "Lataa alkuperäinen kuva uudelleen. Vanhan luonnoksen pienennetty kuva ei korvaa alkuperäistä painoaineistoa."
      );
    const r = cropImage(
      p.image.width,
      p.image.height,
      g.width + 2 * g.bleed,
      g.height + 2 * g.bleed,
      p.photo
    );
    effectiveDpi = 25.4 / ((g.widthMm / g.width) * r.scale);
    if (effectiveDpi < (profile?.minimumImageDpi || 300))
      add(
        "resolution",
        "Kuvan todellinen tarkkuus rajauksineen on " +
          Math.round(effectiveDpi) +
          " dpi. Valitse suurempi alkuperäiskuva."
      );
  }
  for (const message of coverWarnings(p, boxes)) {
    if (message.includes("päällekkäin")) add("overlap", message);
    else warnings.push({ code: "visual", message });
  }
  const ptPerUnit = 72 / 25.4 / g.unit;
  if (
    text.some(r => r.size * ptPerUnit < 12) &&
    !/^#(?:000000|111111|222222|ffffff|ff0000|00ff00|0000ff|ffff00|00ffff|ff00ff)$/i.test(
      p.ink
    )
  )
    add(
      "fine-colour",
      "Alle 12 pisteen värillinen teksti tarvitsee painovärien tarkistuksen. Käytä pieneen tekstiin mustaa tai valkoista tai suurenna tekstiä."
    );
  const fingerprint = projectFingerprint(p);
  if (options.acknowledgedFingerprint !== fingerprint)
    warnings.push({
      code: "approval",
      message:
        "Tarkista lopullinen esikatselu ja hyväksy tämä nimenomainen versio.",
    });
  const report: Preflight = {
    fingerprint,
    errors: Array.from(
      new Map(errors.map(i => [i.code + ":" + i.message, i])).values()
    ),
    warnings,
    widthMm: g.sheetWidthMm,
    heightMm: g.sheetHeightMm,
    spineMm: g.spineMm,
    effectiveDpi,
    status: errors.length
      ? "blocked"
      : options.acknowledgedFingerprint === fingerprint
        ? "technical-pass"
        : "review",
  };
  return { p, report, sc };
}
async function cmyk(input: Buffer, profile: PressProfile) {
  return sharp(input, { limitInputPixels: 24_000_000 })
    .withIccProfile(profile.icc, { attach: false })
    .toColourspace("cmyk")
    .jpeg({ quality: 98, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
async function inkCheck(jpeg: Buffer, max: number) {
  const { data, info } = await sharp(jpeg, { limitInputPixels: 24_000_000 })
    .toColourspace("cmyk")
    .raw()
    .toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) throw Error("CMYK-erottelun tarkistus epäonnistui.");
  for (let i = 0; i < data.length; i += 4) {
    if (
      ((data[i] + data[i + 1] + data[i + 2] + data[i + 3]) * 100) / 255 >
      max + 1
    )
      throw Error("Kokonaisvärimäärä ylittää painoprofiilin rajan.");
  }
}
export async function exportPressCover(
  input: unknown,
  profile: PressProfile,
  options: {
    interiorPageCount?: number;
    acknowledgedFingerprint?: string;
    proof?: boolean;
  } = {}
) {
  const result = await inspectCover(input, profile, options),
    { p, report, sc } = result;
  const blockers = report.errors.filter(
    e => !(options.proof && e.code === "profile")
  );
  if (blockers.length || (!options.proof && report.status !== "technical-pass"))
    throw Error(
      "Painovienti estetty: " +
        (blockers.map(e => e.message).join(" ") ||
          "Hyväksy lopullinen esikatselu.")
    );
  const bg = await cmyk(sc.canvas.toBuffer("image/png"), profile);
  await inkCheck(bg, profile.maxInkPercent);
  const palette = await sharp({
    create: { width: 1, height: 1, channels: 3, background: p.ink },
  })
    .withIccProfile(profile.icc, { attach: false })
    .toColourspace("cmyk")
    .raw()
    .toBuffer();
  const color = Array.from(palette)
    .slice(0, 4)
    .map(x => (x * 100) / 255);
  // Small black text stays pure K; coloured small text needs a manual check.
  const pureBlack = /^#(?:000000|111111|222222)$/i.test(p.ink);
  const unit = 72 / 25.4 / sc.g.unit;
  const doc = new PDFDocument({
    size: [(report.widthMm * 72) / 25.4, (report.heightMm * 72) / 25.4],
    margin: 0,
    compress: true,
    autoFirstPage: true,
    info: {
      Title: options.proof
        ? "CMYK PROOF - NOT APPROVED FOR PRINT"
        : "Thunder cover " + report.fingerprint.slice(0, 12),
      Producer: "Thunder cover engine",
    },
  });
  const parts: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", b => parts.push(b));
    doc.on("end", () => resolve(Buffer.concat(parts)));
    doc.on("error", reject);
  });
  const b = (5 * 72) / 25.4,
    page = doc.page as unknown as {
      dictionary: { data: Record<string, unknown> };
    };
  page.dictionary.data.TrimBox = [
    b,
    b,
    (report.widthMm * 72) / 25.4 - b,
    (report.heightMm * 72) / 25.4 - b,
  ];
  page.dictionary.data.BleedBox = [
    0,
    0,
    (report.widthMm * 72) / 25.4,
    (report.heightMm * 72) / 25.4,
  ];
  doc.image(bg, 0, 0, {
    width: (report.widthMm * 72) / 25.4,
    height: (report.heightMm * 72) / 25.4,
  });
  for (const r of sc.text) {
    if (!r.text) continue;
    doc.save();
    doc.translate(r.x * unit, r.y * unit);
    if (r.rotation) doc.rotate(r.rotation);
    doc
      .font(coverFontFile(p.font === "sans", r.bold))
      .fontSize(r.size * unit)
      .fillColor(
        pureBlack ? [0, 0, 0, 100] : (color as [number, number, number, number])
      );
    const width = doc.widthOfString(r.text),
      x = r.align === "center" ? -width / 2 : r.align === "right" ? -width : 0;
    doc.text(r.text, x, 0, { lineBreak: false, baseline: r.baseline });
    doc.restore();
  }
  if (options.proof) {
    doc.save();
    doc
      .rect(0, 0, (report.widthMm * 72) / 25.4, 22)
      .fillColor([0, 0, 0, 0])
      .fill();
    doc
      .font(coverFontFile(false, true))
      .fontSize(10)
      .fillColor([0, 0, 0, 100])
      .text("KOEVEDOS - EI HYVAKSYTTY PAINOON", 12, 5, { lineBreak: false });
    doc.restore();
  }
  doc.end();
  const pdf = await done;
  return {
    pdf,
    report: { ...report, status: options.proof ? "review" : report.status },
    proof: !!options.proof,
  };
}
