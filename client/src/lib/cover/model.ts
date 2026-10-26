import { z } from "zod";
import {
  DEFAULT_PRODUCTION,
  productionSchema,
  coverGeometry,
  type Production,
} from "@shared/print-production";

export const templates = [
  {
    id: "novel",
    name: "Hiljainen horisontti",
    genre: "Romaani",
    bg: "#243e42",
    ink: "#fff1d6",
    accent: "#dba86c",
    motif: "landscape",
    title: "Hiljaiset rannat",
  },
  {
    id: "type",
    name: "Vahva sana",
    genre: "Typografinen",
    bg: "#e65c34",
    ink: "#241d23",
    accent: "#ffd7ac",
    motif: "type",
    title: "Kaikki mitä jää",
  },
  {
    id: "memoir",
    name: "Eletty elämä",
    genre: "Elämäkerta",
    bg: "#e8ddc7",
    ink: "#333c33",
    accent: "#8a6b47",
    motif: "arch",
    title: "Oman tien kulkija",
  },
  {
    id: "family",
    name: "Juuret",
    genre: "Sukukirja",
    bg: "#243d32",
    ink: "#f8ecd1",
    accent: "#c2a373",
    motif: "tree",
    title: "Meidän tarinamme",
  },
  {
    id: "expert",
    name: "Uusi näkökulma",
    genre: "Tietokirja",
    bg: "#182e4a",
    ink: "#f3f4ed",
    accent: "#81c8cc",
    motif: "grid",
    title: "Ajatus joka muuttaa",
  },
  {
    id: "poetry",
    name: "Rivien välissä",
    genre: "Runot",
    bg: "#ebe5dd",
    ink: "#503d4e",
    accent: "#bd8278",
    motif: "circle",
    title: "Valon puolella",
  },
  {
    id: "children",
    name: "Pieni suuri seikkailu",
    genre: "Lastenkirja",
    bg: "#f5df9e",
    ink: "#294f52",
    accent: "#d9704d",
    motif: "garden",
    title: "Pieni suuri maailma",
  },
  {
    id: "classic",
    name: "Ajaton",
    genre: "Pelkistetty",
    bg: "#262226",
    ink: "#f4e9ce",
    accent: "#c6a46a",
    motif: "frame",
    title: "Oman kirjasi nimi",
  },
] as const;
export type TemplateId = (typeof templates)[number]["id"];
export type TextKey = "title" | "subtitle" | "author" | "back" | "spine";
export const textLabels: Record<TextKey, string> = {
  title: "Kirjan nimi",
  subtitle: "Alaotsikko",
  author: "Tekijä",
  back: "Takakansiteksti",
  spine: "Selkäteksti",
};
const placement = z.object({
  x: z.number().min(0.08).max(0.92),
  y: z.number().min(0.06).max(0.92),
  size: z.number().min(12).max(96),
  align: z.enum(["left", "center", "right"]),
});
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const projectSchema = z.object({
  version: z.literal(1),
  production: productionSchema.default(DEFAULT_PRODUCTION),
  spine: z.string().max(180).default(""),
  template: z.enum([
    "novel",
    "type",
    "memoir",
    "family",
    "expert",
    "poetry",
    "children",
    "classic",
  ]),
  title: z.string().max(120),
  subtitle: z.string().max(180),
  author: z.string().max(100),
  back: z.string().max(1800),
  bg: color,
  ink: color,
  accent: color,
  font: z.enum(["serif", "sans"]),
  positions: z.object({
    title: placement,
    subtitle: placement,
    author: placement,
    back: placement,
    spine: placement.default({ x: 0.5, y: 0.5, size: 14, align: "center" }),
  }),
  image: z
    .object({
      data: z
        .string()
        .max(18_000_000)
        .regex(/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/),
      width: z.number().int().positive().max(12000),
      height: z.number().int().positive().max(12000),
      original: z.boolean().optional(),
    })
    .refine(i => i.width * i.height <= 24_000_000, {
      message: "Kuva ylittää 24 megapikselin rajan.",
    })
    .nullable(),
  photo: z.object({
    zoom: z.number().min(1).max(3),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    shade: z.number().min(0).max(85),
  }),
});
export type CoverProject = z.infer<typeof projectSchema>;
export function createProject(id: TemplateId = "novel"): CoverProject {
  const t = templates.find(t => t.id === id)!;
  return {
    version: 1,
    production: { ...DEFAULT_PRODUCTION },
    spine: "",
    template: id,
    title: t.title,
    subtitle: "",
    author: "Tekijän nimi",
    back: "Kirjoita tähän teoksesi esittely. Mikä tekee tarinastasi kertomisen arvoisen? Herätä lukijan uteliaisuus ja anna pieni lupaus siitä, mitä sivujen välistä löytyy.",
    bg: t.bg,
    ink: t.ink,
    accent: t.accent,
    font:
      id === "type" || id === "expert" || id === "children" ? "sans" : "serif",
    positions: {
      title: { x: 0.5, y: 0.16, size: 52, align: "center" },
      subtitle: { x: 0.5, y: 0.43, size: 20, align: "center" },
      author: { x: 0.5, y: 0.86, size: 19, align: "center" },
      back: { x: 0.14, y: 0.18, size: 18, align: "left" },
      spine: { x: 0.5, y: 0.5, size: 14, align: "center" },
    },
    image: null,
    photo: { zoom: 1, x: 50, y: 50, shade: 30 },
  };
}
export function applyTemplate(p: CoverProject, id: TemplateId): CoverProject {
  const next = createProject(id);
  return {
    ...next,
    production: p.production,
    spine: p.spine,
    title: p.title,
    subtitle: p.subtitle,
    author: p.author,
    back: p.back,
    image: p.image,
    photo: p.photo,
  };
}
export function cropImage(
  iw: number,
  ih: number,
  w: number,
  h: number,
  photo: CoverProject["photo"]
) {
  const scale = Math.max(w / iw, h / ih) * photo.zoom;
  const width = iw * scale,
    height = ih * scale;
  return {
    x: (-(width - w) * photo.x) / 100,
    y: (-(height - h) * photo.y) / 100,
    width,
    height,
    scale,
  };
}
export function contrast(a: string, b: string) {
  const lum = (v: string) => {
    const c = [1, 3, 5]
      .map(i => parseInt(v.slice(i, i + 2), 16) / 255)
      .map(x => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  const [x, y] = [lum(a), lum(b)].sort((a, b) => b - a);
  return (x + 0.05) / (y + 0.05);
}
export const COVER_WIDTH = 600,
  COVER_HEIGHT = 852;
export type CoverView = "front" | "back" | "spread";
export function coverLayout(
  p: Pick<CoverProject, "production">,
  view: CoverView
) {
  const g = coverGeometry(p.production),
    unit = COVER_WIDTH / g.widthMm;
  const width = COVER_WIDTH,
    height = g.heightMm * unit,
    bleed = g.bleedMm * unit,
    spine = g.spineMm * unit;
  return {
    ...g,
    unit,
    width,
    height,
    bleed,
    spine,
    canvasWidth: (view === "spread" ? width * 2 + spine : width) + bleed * 2,
    canvasHeight: height + bleed * 2,
    backOffset: bleed,
    frontOffset: view === "spread" ? bleed + width + spine : bleed,
  };
}
export function coverWidth(
  view: CoverView,
  p: Pick<CoverProject, "production"> = { production: DEFAULT_PRODUCTION }
) {
  return coverLayout(p, view).canvasWidth;
}
export function safeFilename(title: string) {
  return (
    title
      .trim()
      .replace(new RegExp("[^\\p{L}\\p{N} _-]", "gu"), "")
      .slice(0, 70) || "kirjan-kansi"
  ).replace(/\s+/g, "-");
}
