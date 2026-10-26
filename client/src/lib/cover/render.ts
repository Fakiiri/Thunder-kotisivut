import {
  allowsSpineText,
  SPINE_TEXT_INSET_MM,
} from "@shared/cover-requirements";
import {
  COVER_WIDTH as W,
  COVER_HEIGHT,
  coverLayout,
  coverWidth,
  cropImage,
  contrast,
  templates,
  type CoverProject,
  type CoverView,
  type TextKey,
} from "./model";
export type CoverTextRun = {
  key: TextKey;
  text: string;
  x: number;
  y: number;
  size: number;
  bold: boolean;
  align: CanvasTextAlign;
  baseline: "top" | "middle";
  rotation: number;
};
export type TextBox = {
  key: TextKey;
  x: number;
  y: number;
  width: number;
  height: number;
  overflow: boolean;
};
type Options = {
  guides?: boolean;
  backgroundOnly?: boolean;
  textRuns?: CoverTextRun[];
  selected?: TextKey;
  image?: HTMLImageElement | null;
  thumbnail?: boolean;
};
export function wrapLines(
  ctx: Pick<CanvasRenderingContext2D, "measureText">,
  text: string,
  width: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (!paragraph) {
      lines.push("");
      continue;
    }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? line + " " + word : word;
      if (ctx.measureText(candidate).width <= width) {
        line = candidate;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }
      for (const char of Array.from(word)) {
        if (line && ctx.measureText(line + char).width > width) {
          lines.push(line);
          line = "";
        }
        line += char;
      }
    }
    lines.push(line);
  }
  return lines;
}
function circle(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  c.fillStyle = color;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
function motif(c: CanvasRenderingContext2D, p: CoverProject) {
  const m = templates.find(t => t.id === p.template)!.motif;
  c.save();
  c.fillStyle = p.accent;
  c.strokeStyle = p.accent;
  c.lineWidth = 2.4;
  if (m === "landscape") {
    circle(c, 421, 484, 70, p.accent);
    c.fillStyle = p.ink;
    c.globalAlpha = 0.12;
    c.beginPath();
    c.moveTo(0, 600);
    c.bezierCurveTo(160, 420, 290, 690, 600, 480);
    c.lineTo(600, 852);
    c.lineTo(0, 852);
    c.fill();
    c.globalAlpha = 0.25;
    c.fillStyle = p.accent;
    c.beginPath();
    c.moveTo(0, 690);
    c.bezierCurveTo(240, 510, 310, 740, 600, 610);
    c.lineTo(600, 852);
    c.lineTo(0, 852);
    c.fill();
    c.globalAlpha = 0.18;
    c.strokeStyle = p.ink;
    for (let i = 0; i < 8; i++) {
      c.beginPath();
      c.moveTo(0, 700 + i * 13);
      c.bezierCurveTo(210, 630 + i * 13, 330, 770 + i * 10, 600, 650 + i * 13);
      c.stroke();
    }
  } else if (m === "type") {
    c.globalAlpha = 0.25;
    c.lineWidth = 27;
    c.beginPath();
    c.arc(476, 604, 203, 0, Math.PI * 2);
    c.stroke();
    c.globalAlpha = 0.8;
    c.fillRect(62, 660, 170, 10);
    c.fillRect(62, 682, 90, 4);
  } else if (m === "arch") {
    c.globalAlpha = 0.32;
    c.beginPath();
    c.roundRect(150, 394, 300, 310, [150, 150, 0, 0]);
    c.fill();
    c.strokeStyle = p.ink;
    c.globalAlpha = 0.3;
    c.lineWidth = 2.4;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.roundRect(172 + i * 12, 418 + i * 12, 256 - i * 24, 270 - i * 12, [
        128 - i * 12,
        128 - i * 12,
        0,
        0,
      ]);
      c.stroke();
    }
  } else if (m === "tree") {
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(300, 730);
    c.lineTo(300, 470);
    c.stroke();
    for (let i = 0; i < 6; i++) {
      const y = 500 + i * 30,
        reach = 55 + i * 10;
      for (const side of [-1, 1]) {
        c.beginPath();
        c.moveTo(300, y + 65);
        c.quadraticCurveTo(300 + side * reach, y + 40, 300 + side * reach, y);
        c.stroke();
        c.save();
        c.translate(300 + side * reach, y);
        c.rotate(side * 0.6);
        c.beginPath();
        c.ellipse(0, 0, 14, 28, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }
    c.globalAlpha = 0.35;
    c.strokeRect(28, 28, 544, 796);
  } else if (m === "grid") {
    c.globalAlpha = 0.3;
    c.lineWidth = 2.4;
    for (let i = 0; i < 9; i++) {
      c.beginPath();
      c.moveTo(44 + i * 64, 380);
      c.lineTo(44 + i * 64, 750);
      c.stroke();
    }
    for (let i = 0; i < 6; i++) {
      c.beginPath();
      c.moveTo(44, 400 + i * 64);
      c.lineTo(556, 400 + i * 64);
      c.stroke();
    }
    c.globalAlpha = 1;
    c.lineWidth = 12;
    c.beginPath();
    c.moveTo(65, 680);
    c.lineTo(220, 570);
    c.lineTo(330, 605);
    c.lineTo(520, 425);
    c.stroke();
    [
      [65, 680],
      [220, 570],
      [330, 605],
      [520, 425],
    ].forEach(([x, y]) => circle(c, x, y, 12, p.ink));
  } else if (m === "circle") {
    circle(c, 300, 540, 124, p.accent);
    c.globalAlpha = 0.7;
    circle(c, 354, 489, 119, p.bg);
    c.globalAlpha = 0.5;
    c.lineWidth = 2.4;
    c.beginPath();
    c.moveTo(300, 440);
    c.lineTo(300, 728);
    c.stroke();
  } else if (m === "garden") {
    circle(c, 450, 422, 48, p.accent);
    c.fillStyle = p.ink;
    c.globalAlpha = 0.14;
    c.beginPath();
    c.ellipse(300, 744, 420, 140, 0, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
    [
      [120, 610, 1],
      [270, 665, 0.8],
      [430, 640, 1.1],
    ].forEach(([x, y, s]) => {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.strokeStyle = p.ink;
      c.lineWidth = 6;
      c.beginPath();
      c.moveTo(0, 80);
      c.quadraticCurveTo(-30, 10, 0, -45);
      c.stroke();
      for (let j = 0; j < 5; j++) {
        circle(
          c,
          Math.cos((j * Math.PI * 2) / 5) * 23,
          Math.sin((j * Math.PI * 2) / 5) * 23 - 45,
          20,
          p.accent
        );
      }
      circle(c, 0, -45, 16, p.bg);
      c.restore();
    });
  } else {
    c.lineWidth = 2.4;
    c.strokeRect(80, 80, 440, 692);
    c.globalAlpha = 0.5;
    c.strokeRect(88, 88, 424, 676);
    c.globalAlpha = 1;
    c.fillRect(250, 440, 100, 2);
    c.fillRect(280, 452, 40, 2);
  }
  c.restore();
}

export function renderCover(
  canvas: HTMLCanvasElement,
  p: CoverProject,
  view: CoverView,
  options: Options = {}
): TextBox[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Selaimesi ei tue kannen esikatselua.");
  const c: CanvasRenderingContext2D = ctx,
    g = coverLayout(p, view),
    W = g.width,
    H = g.height,
    B = g.bleed,
    S = g.spine;
  const scale = canvas.width / g.canvasWidth;
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.clearRect(0, 0, g.canvasWidth, g.canvasHeight);
  c.fillStyle = p.bg;
  c.fillRect(0, 0, g.canvasWidth, g.canvasHeight);
  const boxes: TextBox[] = [];
  const family =
    p.font === "serif"
      ? '"Thunder Cover Serif", Georgia, serif'
      : '"Thunder Cover Sans", Arial, sans-serif';
  function text(key: Exclude<TextKey, "spine">, offset: number) {
    const pos = p.positions[key],
      size = pos.size,
      lineHeight = size * 1.25;
    c.font = (key === "title" ? "bold " : "") + size + "px " + family;
    const maxWidth = key === "back" ? W * 0.72 : W * 0.8;
    c.textAlign = pos.align;
    c.textBaseline = "top";
    const lines = wrapLines(c, p[key], maxWidth),
      usedWidth = Math.max(0, ...lines.map(t => c.measureText(t).width));
    const anchor = pos.x * W,
      left =
        pos.align === "left"
          ? anchor
          : pos.align === "right"
            ? anchor - usedWidth
            : anchor - usedWidth / 2;
    const y = pos.y * H,
      height = lines.length * lineHeight,
      safe = g.safeMm * g.unit;
    if (!p[key].trim()) return;
    // Include real glyph overhangs and accents, rather than advance widths alone.
    const glyphs = lines.map((line, i) => {
      const m = c.measureText(line),
        top = y + i * lineHeight;
      return [
        m.actualBoundingBoxLeft,
        m.actualBoundingBoxRight,
        m.actualBoundingBoxAscent,
        m.actualBoundingBoxDescent,
      ].every(Number.isFinite)
        ? {
            left: anchor - m.actualBoundingBoxLeft,
            right: anchor + m.actualBoundingBoxRight,
            top: top - m.actualBoundingBoxAscent,
            bottom: top + m.actualBoundingBoxDescent,
          }
        : { left, right: left + usedWidth, top, bottom: top + lineHeight };
    });
    const inkLeft = Math.min(left, ...glyphs.map(m => m.left)),
      inkRight = Math.max(left + usedWidth, ...glyphs.map(m => m.right)),
      inkTop = Math.min(y, ...glyphs.map(m => m.top)),
      inkBottom = Math.max(y + height, ...glyphs.map(m => m.bottom));
    const barcode = {
      x: W * 0.59,
      y: H * 0.85,
      width: W * 0.32,
      height: H * 0.09,
    };
    boxes.push({
      key,
      x: offset + inkLeft,
      y: B + inkTop,
      width: inkRight - inkLeft,
      height: inkBottom - inkTop,
      overflow:
        inkLeft < safe ||
        inkRight > W - safe ||
        inkTop < safe ||
        inkBottom > H - safe ||
        (key === "back" &&
          inkRight > barcode.x &&
          inkLeft < barcode.x + barcode.width &&
          inkBottom > barcode.y &&
          inkTop < barcode.y + barcode.height),
    });
    c.fillStyle = p.ink;
    c.textAlign = pos.align;
    c.textBaseline = "top";
    lines.forEach((line, i) => {
      options.textRuns?.push({
        key,
        text: line,
        x: offset + anchor,
        y: B + y + i * lineHeight,
        size,
        bold: key === "title",
        align: pos.align,
        baseline: "top",
        rotation: 0,
      });
      if (!options.backgroundOnly) c.fillText(line, anchor, y + i * lineHeight);
    });
    if (options.guides && options.selected === key) {
      c.save();
      c.strokeStyle = "#e46a20";
      c.lineWidth = 1.5 / scale;
      c.setLineDash([5, 4]);
      c.strokeRect(left - 5, y - 5, usedWidth + 10, height + 10);
      c.restore();
    }
  }
  function front(offset: number) {
    c.save();
    c.translate(offset, B);
    c.beginPath();
    c.rect(
      view === "spread" ? 0 : -B,
      -B,
      view === "spread" ? W + B : W + 2 * B,
      H + 2 * B
    );
    c.clip();
    if (options.image) {
      const r = cropImage(
        options.image.naturalWidth,
        options.image.naturalHeight,
        W + 2 * B,
        H + 2 * B,
        p.photo
      );
      c.drawImage(options.image, r.x - B, r.y - B, r.width, r.height);
      c.fillStyle = "rgba(0,0,0," + p.photo.shade / 100 + ")";
      c.fillRect(-B, -B, W + 2 * B, H + 2 * B);
    } else {
      c.save();
      c.translate(-B, -B);
      c.scale((W + 2 * B) / W, (H + 2 * B) / COVER_HEIGHT);
      motif(c, p);
      c.restore();
    }
    c.beginPath();
    c.rect(0, 0, W, H);
    c.clip();
    text("title", offset);
    text("subtitle", offset);
    text("author", offset);
    c.restore();
  }
  function back(offset: number) {
    c.save();
    c.translate(offset, B);
    c.beginPath();
    c.rect(0, 0, W, H);
    c.clip();
    c.fillStyle = p.accent;
    c.fillRect(W * 0.14, H * 0.112, 54, 3);
    text("back", offset);
    if (options.guides) {
      c.fillStyle = "rgba(255,255,255,.9)";
      c.fillRect(W * 0.59, H * 0.85, W * 0.32, H * 0.09);
      c.fillStyle = "#393939";
      c.font = "12px Arial";
      c.textAlign = "center";
      c.fillText("ISBN / viivakoodi", W * 0.75, H * 0.885);
      c.fillText("lisätään tuotannossa", W * 0.75, H * 0.91);
    }
    c.restore();
  }
  if (view === "front") front(B);
  else if (view === "back") back(B);
  else {
    back(B);
    c.save();
    c.fillStyle = p.bg;
    c.fillRect(B + W, B, S, H);
    if (p.spine.trim() && allowsSpineText(g.spineMm)) {
      const pos = p.positions.spine;
      c.beginPath();
      c.rect(B + W, B, S, H);
      c.clip();
      c.translate(B + W + S * pos.x, B + H * pos.y);
      c.rotate(Math.PI / 2);
      c.font = pos.size + "px " + family;
      c.fillStyle = p.ink;
      c.textAlign = pos.align;
      c.textBaseline = "middle";
      options.textRuns?.push({
        key: "spine",
        text: p.spine,
        x: B + W + S * pos.x,
        y: B + H * pos.y,
        size: pos.size,
        bold: false,
        align: pos.align,
        baseline: "middle",
        rotation: 90,
      });
      if (!options.backgroundOnly) c.fillText(p.spine, 0, 0);
      const length = c.measureText(p.spine).width,
        safe = SPINE_TEXT_INSET_MM * g.unit;
      const left =
        pos.align === "center"
          ? length / 2
          : pos.align === "right"
            ? length
            : 0;
      const metrics = c.measureText(p.spine);
      const measured = [
        metrics.actualBoundingBoxLeft,
        metrics.actualBoundingBoxRight,
        metrics.actualBoundingBoxAscent,
        metrics.actualBoundingBoxDescent,
      ].every(Number.isFinite);
      const minX = measured
        ? Math.min(-pos.size / 2, -metrics.actualBoundingBoxDescent)
        : -pos.size / 2;
      const maxX = measured
        ? Math.max(pos.size / 2, metrics.actualBoundingBoxAscent)
        : pos.size / 2;
      const minY = measured
        ? Math.min(-left, -metrics.actualBoundingBoxLeft)
        : -left;
      const maxY = measured
        ? Math.max(length - left, metrics.actualBoundingBoxRight)
        : length - left;
      boxes.push({
        key: "spine",
        x: B + W + S * pos.x + minX,
        y: B + H * pos.y + minY,
        width: maxX - minX,
        height: maxY - minY,
        overflow:
          maxX - minX > S - 2 * safe ||
          H * pos.y + minY < g.safeMm * g.unit ||
          H * pos.y + maxY > H - g.safeMm * g.unit ||
          S * pos.x + minX < safe ||
          S * pos.x + maxX > S - safe,
      });
    }
    c.restore();
    front(B + W + S);
  }
  if (options.guides) {
    c.save();
    c.fillStyle = "rgba(190,214,239,.5)";
    c.fillRect(0, 0, g.canvasWidth, B);
    c.fillRect(0, B + H, g.canvasWidth, B);
    c.fillRect(0, B, B, H);
    c.fillRect(g.canvasWidth - B, B, B, H);
    c.lineWidth = 1 / scale;
    c.strokeStyle = "#c44c43";
    c.setLineDash([]);
    c.strokeRect(B, B, g.canvasWidth - 2 * B, H);
    if (view === "spread") {
      c.beginPath();
      c.moveTo(B + W, B);
      c.lineTo(B + W, B + H);
      c.moveTo(B + W + S, B);
      c.lineTo(B + W + S, B + H);
      c.stroke();
    }
    c.strokeStyle = "#e99444";
    c.setLineDash([6, 5]);
    const safe = g.safeMm * g.unit;
    const offsets = view === "spread" ? [B, B + W + S] : [B];
    offsets.forEach(x =>
      c.strokeRect(x + safe, B + safe, W - 2 * safe, H - 2 * safe)
    );
    if (view === "spread" && allowsSpineText(g.spineMm)) {
      const inset = SPINE_TEXT_INSET_MM * g.unit;
      c.strokeRect(B + W + inset, B + safe, S - 2 * inset, H - 2 * safe);
    }
    c.restore();
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
  return boxes;
}
export function coverWarnings(p: CoverProject, boxes: TextBox[]) {
  const warnings: string[] = [],
    g = coverLayout(p, "spread");
  if (!p.title.trim()) warnings.push("Lisää kirjan nimi.");
  if (!p.author.trim()) warnings.push("Lisää tekijän nimi.");
  if (p.author.includes("Tekijän nimi"))
    warnings.push("Vaihda malliteksti omiin tietoihisi.");
  if (!p.image && contrast(p.bg, p.ink) < 4.5)
    warnings.push(
      "Tekstin ja taustan kontrasti on heikko. Vaihda tekstin tai taustan väriä."
    );
  if (p.production.interior === "layout")
    warnings.push(
      "Sivumäärä ja selän leveys ovat alustavia. Sisäsivujen taitto voi muuttaa lopullista sivumäärää."
    );
  if (p.spine.trim() && !allowsSpineText(g.spineMm))
    warnings.push(
      "Selkä on alle 6 mm: selkäteksti ei mahdu turvallisesti, eikä sitä viedä kansitiedostoon."
    );
  if (p.image) {
    const r = cropImage(
        p.image.width,
        p.image.height,
        g.width + 2 * g.bleed,
        g.height + 2 * g.bleed,
        p.photo
      ),
      dpi = 25.4 / ((g.widthMm / g.width) * r.scale);
    if (dpi < 300)
      warnings.push(
        "Kuvan tarkkuus valitussa koossa on noin " +
          Math.round(dpi) +
          " dpi. Painoon suositellaan vähintään 300 dpi:n alkuperäiskuvaa."
      );
    warnings.push("Tarkista, että teksti erottuu kuvan kaikista kohdista.");
  }
  const names = {
    title: "Kirjan nimi",
    subtitle: "Alaotsikko",
    author: "Tekijän nimi",
    back: "Takakansiteksti",
    spine: "Selkäteksti",
  };
  for (const b of boxes)
    if (b.overflow)
      warnings.push(
        names[b.key] +
          " ulottuu turva-alueen ulkopuolelle tai viivakoodin varaukseen. Pienennä tai siirrä tekstiä."
      );
  const frontBoxes = boxes.filter(b =>
    ["title", "subtitle", "author"].includes(b.key)
  );
  if (
    frontBoxes.some((a, i) =>
      frontBoxes
        .slice(i + 1)
        .some(
          b =>
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        )
    )
  )
    warnings.push("Etukannen tekstialueet osuvat päällekkäin.");
  return Array.from(new Set(warnings));
}
