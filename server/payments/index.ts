import express, { type Express } from "express";
import { readLinkRules, readPackageLists, paidOrderFromEvent, verifyStripeSignature, type PackageLists } from "./core";
import { customerMessage, ownerMessage, type ResponseWindow } from "./messages";
import { mysqlOrderStore, type OrderJob, type OrderStore } from "./store";

type PaymentOptions = {
  enabled: boolean; secret: string; live: boolean;
  rules: ReturnType<typeof readLinkRules>; store?: OrderStore;
};

export function registerStripeWebhook(app: Express, options: PaymentOptions) {
  // Must be registered BEFORE express.json(): Stripe signs the unchanged bytes.
  app.post("/api/payments/stripe/webhook", express.raw({ type: "application/json", limit: "1mb" }), async (req, res) => {
    if (!options.enabled || !options.secret || !options.store) { res.sendStatus(503); return; }
    if (!Buffer.isBuffer(req.body) || !verifyStripeSignature(req.body, req.get("stripe-signature") || "", options.secret)) {
      res.status(400).json({ error: "Invalid signature" }); return;
    }
    let order;
    try { order = paidOrderFromEvent(JSON.parse(req.body.toString("utf8")), options.rules, options.live); }
    catch { res.status(422).json({ error: "Event requires review" }); return; }
    if (!order) { res.status(200).json({ received: true, ignored: true }); return; }
    try {
      await options.store.recordPaidOrder(order);
      res.status(200).json({ received: true });
    } catch {
      console.error("[Payments] Could not persist order; Stripe must retry");
      res.sendStatus(503);
    }
  });
}

export async function deliverOrderJob(job: OrderJob, settings: {
  apiKey: string; ownerEmail: string; senderEmail: string; buyerListId: number;
  responseWindow: ResponseWindow; request?: typeof fetch;
  packageLists?: PackageLists;
}) {
  const request = settings.request || fetch;
  const url = job.kind === "buyer-list" ? "https://api.brevo.com/v3/contacts" : "https://api.brevo.com/v3/smtp/email";
  const body = job.kind === "buyer-list"
    ? { email: job.order.email, listIds: Array.from(new Set([settings.buyerListId,
        ...(settings.packageLists?.[job.order.packageId] ? [settings.packageLists[job.order.packageId]!] : [])])), updateEnabled: true }
    : {
      sender: { name: "Thunder Kustannus", email: settings.senderEmail },
      replyTo: { name: "Santeri Sandberg", email: settings.ownerEmail },
      to: [{ email: job.kind === "owner" ? settings.ownerEmail : job.order.email }],
      ...(job.kind === "owner" ? ownerMessage(job.order, settings.responseWindow) : customerMessage(job.order, settings.responseWindow)),
      headers: { idempotencyKey: job.providerKey },
      tags: ["paid-order", job.order.packageId],
    };
  const result = await request(url, { method: "POST", signal: AbortSignal.timeout(10_000),
    headers: { "api-key": settings.apiKey, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
  if (!result.ok) {
    const error = new Error(`Brevo status ${result.status}`) as Error & { retryable: boolean };
    error.retryable = result.status === 429 || result.status >= 500;
    throw error;
  }
}

export function configureOrderAutomation(app: Express) {
  const enabled = process.env.PAYMENTS_ENABLED === "true";
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const rules = readLinkRules(process.env.STRIPE_PAYMENT_LINK_MAP);
  const packageLists = readPackageLists(process.env.BREVO_PACKAGE_LIST_MAP);
  const responseWindow = process.env.ORDER_RESPONSE_WINDOW;
  const email = process.env.ORDER_NOTIFY_EMAIL || "info@thunderkustannus.fi";
  const senderEmail = process.env.ORDER_SENDER_EMAIL || "info@thunderkustannus.fi";
  const buyerListId = Number(process.env.BREVO_BUYER_LIST_ID || "10");
  if (enabled && (!secret || !process.env.DATABASE_URL || !process.env.BREVO_API_KEY ||
    !Object.keys(rules).length || Object.values(rules).some(rule => !packageLists[rule.packageId]) ||
    !["24h", "business-day"].includes(responseWindow || "") ||
    !["test", "live"].includes(process.env.STRIPE_MODE || "") ||
    !Number.isSafeInteger(buyerListId) || buyerListId <= 0 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(senderEmail))) throw Error("Order automation configuration is incomplete");
  const store = enabled ? mysqlOrderStore(process.env.DATABASE_URL!) : undefined;
  registerStripeWebhook(app, { enabled, secret, rules, store, live: process.env.STRIPE_MODE === "live" });
  if (!store) return;
  let busy = false;
  const timer = setInterval(async () => {
    if (busy) return;
    busy = true;
    try {
      for (let count = 0; count < 10; count++) {
        const job = await store.claim();
        if (!job) break;
        try {
          await deliverOrderJob(job, { apiKey: process.env.BREVO_API_KEY!, ownerEmail: email,
            senderEmail, buyerListId, packageLists, responseWindow: responseWindow as ResponseWindow });
          await store.finish(job);
        } catch (error) {
          await store.fail(job, error instanceof Error ? error.name : "DeliveryError",
            (error as { retryable?: boolean }).retryable !== false);
          console.error(`[Payments] ${job.kind} job needs retry or review (${job.id})`);
        }
      }
    } catch { console.error("[Payments] Outbox unavailable; check database and migration"); }
    finally { busy = false; }
  }, 5000);
  timer.unref();
}
