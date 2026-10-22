import express, { type Express } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  answersSchema,
  MARKETING_PERMISSION,
  QUIZ_VERSION,
  QUIZ_BOOKING_URL,
  quizResult,
} from "../../shared/publication-quiz";
import { QuizStore, type Job } from "./store";
import { quizMessage } from "./messages";

export const submitSchema = z.object({
  answers: answersSchema,
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(100).default(""),
  marketing: z.boolean(),
  source: z
    .string()
    .regex(/^[a-zA-Z0-9_-]{1,80}$/)
    .default("direct"),
  website: z.string().max(200).default(""),
  version: z.literal(QUIZ_VERSION),
  requestKey: z.string().uuid(),
});
const bookingSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  phone: z
    .string()
    .trim()
    .min(5)
    .max(35)
    .regex(/^[+\d ()-]+$/),
  preferredTime: z.string().trim().max(180).default(""),
});
type Config = {
  apiKey: string;
  base: string;
  owner: string;
  sender: string;
  buyerList: number;
};
class ProviderError extends Error {
  constructor(public retryable: boolean) {
    super("Brevo request failed");
  }
}
export async function brevoRequest(
  config: Config,
  path: string,
  method = "GET",
  body?: unknown
) {
  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method,
    signal: AbortSignal.timeout(10000),
    headers: { "api-key": config.apiKey, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (
    !response.ok &&
    !(
      method === "GET" &&
      path.startsWith("/contacts/") &&
      response.status === 404
    )
  )
    throw new ProviderError(response.status === 429 || response.status >= 500);
  return response;
}
// Two dedicated lists: requesting a result is not permission for a newsletter.
export async function ensureQuizLists(config: Config) {
  const folders = await (
    await brevoRequest(config, "/contacts/folders?limit=50")
  ).json();
  let folder = folders.folders?.find(
    (f: { name: string }) => f.name === "Thunder – julkaisutesti"
  );
  if (!folder)
    folder = await (
      await brevoRequest(config, "/contacts/folders", "POST", {
        name: "Thunder – julkaisutesti",
      })
    ).json();
  const lists = await (
    await brevoRequest(config, `/contacts/folders/${folder.id}/lists?limit=50`)
  ).json();
  const ids: number[] = [];
  for (const name of [
    "Julkaisutesti – tulos pyydetty (erillinen markkinointilupa)",
    "Julkaisutesti – kaksi jatkoviestiä sallittu",
    "Julkaisutesti – Digi",
    "Julkaisutesti – Printti",
    "Julkaisutesti – Premium",
  ]) {
    const existing = lists.lists?.find(
      (l: { name: string }) => l.name === name
    );
    ids.push(
      existing?.id ||
        (
          await (
            await brevoRequest(config, "/contacts/lists", "POST", {
              name,
              folderId: folder.id,
            })
          ).json()
        ).id
    );
  }
  if (ids.some(id => !Number.isSafeInteger(id) || id <= 0))
    throw Error("Quiz list configuration invalid");
  return ids;
}
export async function followupAllowed(
  job: Job,
  store: Pick<QuizStore, "suppressed">,
  config: Config
) {
  if (
    [
      "opsicus@gmail.com",
      "kaarlo.kuosmanen@gmail.com",
      "haka.kekalainen@gmail.com",
      "utunen77@gmail.com",
    ].includes(job.lead.email)
  )
    return false;
  if (!job.lead.marketing || (await store.suppressed(job.lead))) return false;
  const response = await brevoRequest(
    config,
    `/contacts/${encodeURIComponent(job.lead.email)}`
  );
  if (response.status === 404) return false; // Fail closed until contact sync succeeds.
  const contact = await response.json();
  return (
    !contact.emailBlacklisted &&
    !(contact.listIds || []).includes(config.buyerList)
  );
}
export async function deliverQuizJob(
  job: Job,
  store: QuizStore,
  config: Config,
  lists: number[]
) {
  if (job.kind === "stop-marketing") {
    if (!lists[1]) throw new ProviderError(true);
    const response = await brevoRequest(
      config,
      `/contacts/lists/${lists[1]}/contacts/remove`,
      "POST",
      { emails: [job.lead.email] }
    );
    return true;
  }
  if (job.kind === "contact") {
    if (lists.length !== 5) throw new ProviderError(true);
    const suppressed = await store.suppressed(job.lead);
    await brevoRequest(config, "/contacts", "POST", {
      email: job.lead.email,
      updateEnabled: true,
      listIds: [
        lists[0],
        lists[
          2 +
            ["digi", "printti", "premium"].indexOf(
              quizResult(job.lead.answers).profile
            )
        ],
        ...(job.lead.marketing && !suppressed ? [lists[1]] : []),
      ],
    });
    return true;
  }
  const marketing = ["day2", "day5"].includes(job.kind);
  if (marketing && !(await followupAllowed(job, store, config))) {
    await store.finish(job, "cancelled");
    return false;
  }
  const owner = job.kind === "owner" || job.kind === "booking-owner";
  const unsubscribe = `${config.base}/api/quiz/unsubscribe/${job.lead.token}`;
  await brevoRequest(config, "/smtp/email", "POST", {
    sender: { name: "Thunder Kustannus", email: config.sender },
    replyTo: { name: "Santeri Sandberg", email: config.owner },
    to: [{ email: owner ? config.owner : job.lead.email }],
    ...quizMessage(job, config.base),
    headers: {
      idempotencyKey: job.key,
      ...(marketing
        ? {
            "List-Unsubscribe": `<${unsubscribe}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          }
        : {}),
    },
    tags: ["julkaisutesti", job.kind],
  });
  return true;
}
export async function cleanupQuizContacts(
  store: QuizStore,
  config: Config,
  lists: number[]
) {
  for (const email of await store.expiredEmails()) {
    const response = await brevoRequest(
      config,
      `/contacts/${encodeURIComponent(email)}`
    );
    if (response.status === 404) continue;
    const contact = await response.json();
    // Never delete an existing buyer or another newsletter's subscriber.
    if ((contact.listIds || []).every((id: number) => lists.includes(id))) {
      await brevoRequest(
        config,
        `/contacts/${encodeURIComponent(email)}`,
        "DELETE"
      );
    } else
      for (const id of lists)
        if (contact.listIds?.includes(id)) {
          await brevoRequest(
            config,
            `/contacts/lists/${id}/contacts/remove`,
            "POST",
            { emails: [email] }
          );
        }
  }
  await store.cleanup();
}
export function readBookingURL(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" &&
      ["calendar.app.google", "calendar.google.com"].includes(url.hostname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function registerQuizRoutes(
  app: Express,
  store: QuizStore | null,
  bookingURL: string | null = null
) {
  app.get("/api/quiz/config", (_req, res) =>
    res.set("Cache-Control", "no-store").json({ bookingURL })
  );
  const hits = new Map<string, { count: number; until: number }>();
  const protect: express.RequestHandler = (req, res, next) => {
    const origin = req.get("origin");
    const allowed = [
      "https://www.thunderkustannus.fi",
      "https://thunderkustannus.fi",
    ];
    if (
      process.env.NODE_ENV !== "production" &&
      origin &&
      /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    )
      allowed.push(origin);
    if (!origin || !allowed.includes(origin)) {
      res.sendStatus(403);
      return;
    }
    // Railway is the single trusted reverse proxy; the rightmost forwarded address
    // is appended by that proxy. Earlier client-controlled entries are ignored.
    const remote = process.env.RAILWAY_ENVIRONMENT_ID
      ? req.get("x-forwarded-for")?.split(",").at(-1)?.trim()
      : undefined;
    const key = createHash("sha256")
      .update(remote || req.socket.remoteAddress || "unknown")
      .digest("hex");
    const now = Date.now();
    hits.forEach((v, k) => {
      if (v.until < now) hits.delete(k);
    });
    const hit = hits.get(key) || { count: 0, until: now + 3600000 };
    hit.count++;
    hits.set(key, hit);
    if (hit.count > 30) {
      res
        .status(429)
        .json({ error: "Liian monta yritystä. Kokeile myöhemmin." });
      return;
    }
    res.set("Cache-Control", "no-store");
    next();
  };
  app.post(
    "/api/quiz/submit",
    express.json({ limit: "12kb" }),
    protect,
    async (req, res) => {
      const parsed = submitSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(400)
          .json({ error: "Tarkista sähköpostiosoite ja vastaukset." });
        return;
      }
      if (!store) {
        res.status(503).json({
          error:
            "Sähköpostitoiminto ei ole vielä käytössä. Saat tuloksen heti ruudulle.",
        });
        return;
      }
      if (parsed.data.website) {
        res.status(400).json({ error: "Lähetys epäonnistui." });
        return;
      }
      try {
        const { version, website, requestKey, ...lead } = parsed.data;
        const saved = await store.save(
          lead,
          lead.marketing
            ? `${QUIZ_VERSION}: ${MARKETING_PERMISSION}`
            : `${QUIZ_VERSION}: vain pyydetty tulos`,
          requestKey
        );
        if (!saved.token) {
          res.status(409).json({
            error:
              "Uutta tulosviestiä ei voitu tilata. Jos tilasit tuloksen jo tänään, käytä sähköpostiviestissä olevaa omaa linkkiä.",
          });
          return;
        }
        res.status(202).json({
          saved: true,
          token: saved.token,
          result: quizResult(lead.answers),
          bookingURL,
        });
      } catch {
        console.error("[Quiz] Lead persistence failed");
        res.status(503).json({
          error:
            "Emme voineet tallentaa pyyntöä. Tuloksesi näkyy silti ruudulla. Yritä myöhemmin uudelleen.",
        });
      }
    }
  );
  app.get("/api/quiz/result/:token", async (req, res) => {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    });
    if (!store || !/^[a-f0-9]{64}$/.test(req.params.token)) {
      res.sendStatus(404);
      return;
    }
    try {
      const lead = await store.find(req.params.token);
      if (!lead) {
        res.sendStatus(404);
        return;
      }
      res.json({ result: quizResult(lead.answers), bookingURL }); // No email, phone or raw answers exposed.
    } catch {
      res.sendStatus(503);
    }
  });
  app.post(
    "/api/quiz/call",
    express.json({ limit: "2kb" }),
    protect,
    async (req, res) => {
      const data = bookingSchema.safeParse(req.body);
      if (!store) {
        res.sendStatus(503);
        return;
      }
      if (!data.success) {
        res.status(400).json({ error: "Tarkista puhelinnumero." });
        return;
      }
      try {
        const lead = await store.find(data.data.token);
        if (!lead) {
          res.sendStatus(404);
          return;
        }
        await store.book(
          lead,
          `Puhelin: ${data.data.phone}\nAikatoive: ${data.data.preferredTime || "ei aikatoivetta"}`
        );
        res.status(202).json({ saved: true });
      } catch {
        res.sendStatus(503);
      }
    }
  );
  app.post(
    "/api/quiz/calendar",
    express.json({ limit: "1kb" }),
    protect,
    async (req, res) => {
      if (!store || !bookingURL) {
        res.sendStatus(503);
        return;
      }
      const parsed = z
        .object({ token: z.string().regex(/^[a-f0-9]{64}$/) })
        .safeParse(req.body);
      if (!parsed.success) {
        res.sendStatus(400);
        return;
      }
      try {
        const lead = await store.find(parsed.data.token);
        if (!lead) {
          res.sendStatus(404);
          return;
        }
        // Opening the calendar pauses follow-ups; it is not proof of a booking.
        await store.pauseForCalendar(lead);
        res.json({ url: bookingURL });
      } catch {
        res.sendStatus(503);
      }
    }
  );
  // GET shows a confirmation. Link-scanning software must not unsubscribe a person.
  app.get("/api/quiz/unsubscribe/:token", (req, res) => {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    });
    if (!/^[a-f0-9]{64}$/.test(req.params.token)) {
      res.sendStatus(404);
      return;
    }
    res
      .type("html")
      .send(
        `<!doctype html><html lang="fi"><meta name="viewport" content="width=device-width"><title>Peruuta testin jatkoviestit</title><body style="font:18px system-ui;max-width:600px;margin:60px auto;padding:24px"><h1>Peruuta julkaisutestin jatkoviestit</h1><p>Tämä lopettaa tämän testin markkinointiviestit.</p><form method="post"><button style="padding:16px">Peruuta jatkoviestit</button></form></body></html>`
      );
  });
  app.post("/api/quiz/unsubscribe/:token", async (req, res) => {
    res.set({
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    });
    if (!store || !/^[a-f0-9]{64}$/.test(req.params.token)) {
      res.sendStatus(404);
      return;
    }
    try {
      const lead = await store.find(req.params.token);
      if (!lead) {
        res.sendStatus(404);
        return;
      }
      await store.suppress(lead.email, "unsubscribe");
      // Remove only the dedicated quiz marketing list; never unblock or alter general consent.
      res
        .type("html")
        .send(
          '<!doctype html><html lang="fi"><meta name="viewport" content="width=device-width"><title>Peruutettu</title><body style="font:18px system-ui;padding:40px"><h1>Jatkoviestit on peruutettu.</h1><p>Voit edelleen ottaa itse yhteyttä Thunder Kustannukseen.</p></body></html>'
        );
    } catch {
      res.sendStatus(503);
    }
  });
}
export async function configureQuiz(app: Express) {
  if (process.env.QUIZ_ENABLED !== "true") {
    registerQuizRoutes(app, null);
    return;
  }
  const config: Config = {
    apiKey: process.env.BREVO_API_KEY || "",
    base: "https://www.thunderkustannus.fi",
    owner: process.env.ORDER_NOTIFY_EMAIL || "info@thunderkustannus.fi",
    sender: process.env.ORDER_SENDER_EMAIL || "info@thunderkustannus.fi",
    buyerList: Number(process.env.BREVO_BUYER_LIST_ID || 10),
  };
  const bookingURL = readBookingURL(process.env.QUIZ_BOOKING_URL ?? QUIZ_BOOKING_URL);
  if (!process.env.DATABASE_URL || !config.apiKey || !bookingURL) {
    console.error(
      "[Quiz] Activation requires MySQL, Brevo and Santeri's verified booking URL"
    );
    registerQuizRoutes(app, null);
    return;
  }
  const store = new QuizStore(process.env.DATABASE_URL);
  try {
    await store.init();
  } catch {
    console.error("[Quiz] Database setup failed; website remains available");
    registerQuizRoutes(app, null);
    return;
  }
  registerQuizRoutes(app, store, bookingURL);
  let lists: number[] | null = null,
    busy = false,
    lastCleanup = 0;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      if (!lists) {
        try {
          lists = await ensureQuizLists(config);
        } catch {
          console.error(
            "[Quiz] Dedicated list setup pending; result emails continue independently"
          );
        }
      }
      for (let i = 0; i < 10; i++) {
        const job = await store.claim();
        if (!job) break;
        try {
          if (await deliverQuizJob(job, store, config, lists || []))
            await store.finish(job);
        } catch (e) {
          await store.fail(job, !(e instanceof ProviderError) || e.retryable);
          console.error(
            `[Quiz] Delivery requires retry or review: ${job.kind}`
          );
        }
      }
      if (lists && Date.now() - lastCleanup > 86400000) {
        await cleanupQuizContacts(store, config, lists);
        lastCleanup = Date.now();
      }
    } catch {
      console.error(
        "[Quiz] Worker unavailable; check Brevo, database and outbox"
      );
    } finally {
      busy = false;
    }
  }, 5000);
  timer.unref();
}
