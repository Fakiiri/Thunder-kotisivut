// Hinta-arviopyyntö -> oma Brevo-lista (palveluviesti, EI markkinointilista).
// Formspree-sähköposti Thunderille säilyy ensisijaisena kanavana; tämä on rinnakkainen kopio.
import { createHash } from "node:crypto";
import express, { type Express } from "express";
import { z } from "zod";

export const quoteSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().max(120).optional().default(""),
  package: z.string().trim().max(60).optional().default(""),
  pages: z.string().trim().max(20).optional().default(""),
  timeline: z.string().trim().max(60).optional().default(""),
  source: z.string().trim().max(200).optional().default(""),
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export type QuoteConfig = { apiKey: string; listId: number };

export function readQuoteConfig(env: NodeJS.ProcessEnv): QuoteConfig | null {
  const listId = Number(env.BREVO_QUOTE_LIST_ID);
  if (!env.BREVO_API_KEY || !Number.isInteger(listId) || listId <= 0) return null;
  return { apiKey: env.BREVO_API_KEY, listId };
}

export async function syncQuoteToBrevo(
  input: QuoteInput,
  config: QuoteConfig,
  fetchImpl: typeof fetch = fetch,
  today = new Date()
): Promise<void> {
  const post = (attributes: Record<string, string>) =>
    fetchImpl("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": config.apiKey },
      body: JSON.stringify({
        email: input.email,
        listIds: [config.listId],
        updateEnabled: true,
        attributes,
      }),
    });
  const base: Record<string, string> = input.name ? { FIRSTNAME: input.name } : {};
  const full = {
    ...base,
    TARJOUS_PAKETTI: input.package,
    TARJOUS_SIVUT: input.pages,
    TARJOUS_AIKATAULU: input.timeline,
    TARJOUS_LAHDE: input.source,
    TARJOUS_PVM: today.toISOString().slice(0, 10),
  };
  let res = await post(full);
  if (res.status === 400) {
    // Custom attributes not created in Brevo yet: still land the contact on the list.
    console.error("[Quote] Brevo rejected attributes, retrying with name only");
    res = await post(base);
  }
  if (!res.ok) throw new Error(`Brevo ${res.status}`);
}

export function registerQuoteRoutes(app: Express, env = process.env) {
  const hits = new Map<string, { count: number; until: number }>();
  app.post("/api/hinta-arvio", express.json({ limit: "4kb" }), async (req, res) => {
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
      res.sendStatus(429);
      return;
    }
    res.set("Cache-Control", "no-store");
    const parsed = quoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.sendStatus(400);
      return;
    }
    const config = readQuoteConfig(env);
    if (!config) {
      res.sendStatus(204); // Brevo-reitti ei vielä käytössä; Formspree hoitaa pyynnön.
      return;
    }
    try {
      await syncQuoteToBrevo(parsed.data, config);
      res.sendStatus(204);
    } catch (error) {
      console.error("[Quote] Brevo sync failed", error instanceof Error ? error.message : "");
      res.sendStatus(502);
    }
  });
}
