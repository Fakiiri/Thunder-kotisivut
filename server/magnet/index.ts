// Liidimagneetin tilaus -> magneettikohtainen Brevo-lista (markkinointilupa pakollinen).
// Lista-ID:t ympäristömuuttujassa MAGNET_BREVO_LISTS, esim. {"kurssi":25,"muistelma":26,"naytekirja":27}.
// Ilman muuttujaa reitti vastaa 503, jolloin sivu kertoo, ettei tilaus ole vielä auki.
import { createHash } from "node:crypto";
import express, { type Express } from "express";
import { z } from "zod";
import { MAGNET_KEYS, MAGNETS, type MagnetKey } from "../../shared/magnets";

export const magnetSchema = z.object({
  magnet: z.enum(MAGNET_KEYS as [MagnetKey, ...MagnetKey[]]),
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(120),
  consent: z.literal(true),
  source: z.string().trim().max(200).optional().default(""),
  website: z.string().max(0).optional(), // honeypot
});
export type MagnetInput = z.infer<typeof magnetSchema>;

export function readMagnetLists(raw: string | undefined): Record<MagnetKey, number> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out = {} as Record<MagnetKey, number>;
    for (const key of MAGNET_KEYS) {
      const id = Number(parsed[key]);
      if (!Number.isInteger(id) || id <= 0) return null;
      out[key] = id;
    }
    return out;
  } catch {
    return null;
  }
}

export async function syncMagnetToBrevo(
  input: MagnetInput,
  config: { apiKey: string; lists: Record<MagnetKey, number> },
  fetchImpl: typeof fetch = fetch,
  today = new Date()
): Promise<void> {
  const post = (attributes: Record<string, string>) =>
    fetchImpl("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": config.apiKey },
      body: JSON.stringify({
        email: input.email,
        listIds: [config.lists[input.magnet]],
        updateEnabled: true,
        attributes,
      }),
    });
  const base = { FIRSTNAME: input.name };
  let res = await post({
    ...base,
    MAGNEETTI: input.magnet,
    KAISTA: MAGNETS[input.magnet].lane,
    MAGNEETTI_LAHDE: input.source,
    MARKKINOINTILUPA_PVM: today.toISOString().slice(0, 10),
  });
  if (res.status === 400) {
    console.error("[Magnet] Brevo rejected attributes, retrying with name only");
    res = await post(base);
  }
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
}

export function registerMagnetRoutes(app: Express, env = process.env) {
  const hits = new Map<string, { count: number; until: number }>();
  app.post("/api/magneetti", express.json({ limit: "4kb" }), async (req, res) => {
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
    if (hit.count > 10) {
      res.status(429).json({ error: "Liian monta yritystä. Kokeile myöhemmin." });
      return;
    }
    res.set("Cache-Control", "no-store");
    const parsed = magnetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Tarkista nimi, sähköposti ja lupa." });
      return;
    }
    const lists = readMagnetLists(env.MAGNET_BREVO_LISTS);
    if (!env.BREVO_API_KEY || !lists) {
      res.status(503).json({ error: "Tilaus avautuu pian. Kokeile hetken päästä uudelleen." });
      return;
    }
    try {
      await syncMagnetToBrevo(parsed.data, { apiKey: env.BREVO_API_KEY, lists });
      res.sendStatus(204);
    } catch (error) {
      console.error("[Magnet] Brevo sync failed", error instanceof Error ? error.message : "");
      res.status(502).json({ error: "Tilaus epäonnistui. Yritä uudelleen." });
    }
  });
}
