// Ilmainen ääninäyte: kirjailija lähettää yhden Word-sivun (.docx), Thunder palauttaa
// ääninäytteen yhden arkipäivän kuluessa. Palveluviesti, EI markkinointilistaa.
// Liite välitetään Brevon SMTP-rajapinnalla osoitteeseen info@thunderkustannus.fi.
import { createHash } from "node:crypto";
import express, { type Express } from "express";
import { z } from "zod";

export const MAX_SAMPLE_BYTES = 2 * 1024 * 1024; // yksi Word-sivu mahtuu reilusti
/** Lomake, joka lähetetään alle 3 sekunnissa sivun avaamisesta, on lähes varmasti botti. */
export const MIN_FILL_MS = 3000;

export const sampleSchema = z
  .object({
    email: z.string().trim().email().max(200),
    name: z.string().trim().max(120).optional().default(""),
    filename: z
      .string()
      .trim()
      .min(6)
      .max(180)
      .refine(s => /\.docx$/i.test(s) && !/[\x00-\x1f\x7f/\\]/.test(s)),
    file: z
      .string()
      .min(8)
      .max(Math.ceil(MAX_SAMPLE_BYTES / 3) * 4),
    consent: z.literal(true),
    // Roskapostiesto: piilokenttä, jonka vain botit täyttävät, ja lomakkeen täyttöaika.
    website: z.string().max(200).optional().default(""),
    elapsedMs: z.number().int().nonnegative(),
    source: z.string().trim().max(200).optional().default(""),
  })
  .strict();
export type SampleInput = z.infer<typeof sampleSchema>;

export type SampleVerdict =
  | { ok: true; bytes: Buffer }
  | { ok: false; reason: "spam" | "file" };

/** Tarkistaa roskapostiehdot ja että liite on oikeasti .docx-tiedosto (zip, jossa word/document.xml). */
export function inspectSample(input: SampleInput): SampleVerdict {
  if (input.website || input.elapsedMs < MIN_FILL_MS) return { ok: false, reason: "spam" };
  const bytes = Buffer.from(input.file, "base64");
  if (bytes.length < 8 || bytes.length > MAX_SAMPLE_BYTES) return { ok: false, reason: "file" };
  const zip = bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  if (!zip || !bytes.includes(Buffer.from("word/document.xml"))) return { ok: false, reason: "file" };
  // Makrolliset tiedostot (.docm sisältö) hylätään.
  if (bytes.includes(Buffer.from("vbaProject.bin"))) return { ok: false, reason: "file" };
  return { ok: true, bytes };
}

export function safeFilename(name: string) {
  const base = name.replace(/[^A-Za-z0-9ÅÄÖåäöÉéÜü._ -]/g, "_").replace(/\s+/g, " ").trim();
  return (base.replace(/\.docx$/i, "").slice(0, 80) || "naytesivu") + ".docx";
}

export async function sendSampleRequest(
  input: SampleInput,
  bytes: Buffer,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
  now = new Date()
) {
  const who = input.name ? `${input.name} <${input.email}>` : input.email;
  const body = {
    sender: { name: "Thunder Kustannus", email: "info@thunderkustannus.fi" },
    to: [{ email: "info@thunderkustannus.fi" }],
    replyTo: { email: input.email, ...(input.name ? { name: input.name } : {}) },
    subject: `Ääninäytepyyntö – ${input.name || input.email}`,
    textContent: [
      "Uusi ilmainen ääninäytepyyntö sivustolta.",
      `Lähettäjä: ${who}`,
      `Lähde: ${input.source || "suora / orgaaninen"}`,
      `Vastaanotettu: ${now.toISOString()}`,
      "Lupaus asiakkaalle: näyte yhden arkipäivän kuluessa. Vastaa tähän viestiin, niin vastaus menee suoraan kirjailijalle.",
      "Liite on asiakkaan toimittama eikä virustarkastettu. Avaa vain Wordissa suojatussa näkymässä.",
    ].join("\n\n"),
    attachment: [{ name: safeFilename(input.filename), content: bytes.toString("base64") }],
    tags: ["aaninayte"],
  };
  const res = await fetchImpl("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { "api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
}

export function registerSampleRoutes(app: Express, env = process.env, fetchImpl: typeof fetch = fetch) {
  const hits = new Map<string, { count: number; until: number }>();
  app.post("/api/aaninayte", express.json({ limit: "3mb" }), async (req, res) => {
    res.set("Cache-Control", "no-store");
    const origin = req.get("origin");
    const allowed = ["https://www.thunderkustannus.fi", "https://thunderkustannus.fi"];
    const devOrigin =
      env.NODE_ENV !== "production" && origin && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
    if (!origin || (!allowed.includes(origin) && !devOrigin)) {
      res.sendStatus(403);
      return;
    }
    const remote = env.RAILWAY_ENVIRONMENT_ID
      ? req.get("x-forwarded-for")?.split(",").at(-1)?.trim()
      : undefined;
    const key = createHash("sha256").update(remote || req.socket.remoteAddress || "unknown").digest("hex");
    const now = Date.now();
    hits.forEach((v, k) => v.until < now && hits.delete(k));
    const hit = hits.get(key) || { count: 0, until: now + 3600000 };
    hit.count++;
    hits.set(key, hit);
    if (hit.count > 5) {
      res.sendStatus(429);
      return;
    }
    const parsed = sampleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.sendStatus(400);
      return;
    }
    const verdict = inspectSample(parsed.data);
    if (!verdict.ok) {
      // Botille kuitataan onnistuminen, jotta se ei opi kiertämään estoa.
      res.sendStatus(verdict.reason === "spam" ? 204 : 415);
      return;
    }
    if (!env.BREVO_API_KEY) {
      res.sendStatus(503); // Lomake ohjaa silloin WhatsAppiin tai sähköpostiin.
      return;
    }
    try {
      await sendSampleRequest(parsed.data, verdict.bytes, env.BREVO_API_KEY, fetchImpl);
      res.sendStatus(204);
    } catch (error) {
      console.error("[Sample] Brevo send failed", error instanceof Error ? error.message : "");
      res.sendStatus(502);
    }
  });
}
