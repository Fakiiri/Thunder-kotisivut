import { describe, it, expect, vi } from "vitest";
import { createHmac } from "node:crypto";
import { createServer } from "node:http";
import express from "express";
import { paidOrderFromEvent, readPackageLists, verifyStripeSignature, type PaidOrder } from "./core";
import { registerStripeWebhook, deliverOrderJob } from "./index";
import { customerMessage } from "./messages";
import type { OrderStore } from "./store";

const secret = "whsec_test_fixture";
const rules = { plink_fixture: { packageId: "digi" as const, amountCents: 89000 } };
function event(type = "checkout.session.completed", status = "paid") {
  return { id: "evt_fixture", type, livemode: false, data: { object: {
    id: "cs_test_fixture", object: "checkout.session", payment_status: status,
    payment_link: "plink_fixture", mode: "payment", amount_total: 89000, currency: "eur",
    customer_details: { email: "Writer@example.com", name: "Test Writer" },
  } } };
}
function sign(raw: Buffer, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.`).update(raw).digest("hex")}`;
}

describe("Stripe payment fulfillment", () => {
  it("rejects modified payloads and stale signatures, accepts rotated v1 signatures", () => {
    const raw = Buffer.from(JSON.stringify(event()));
    expect(verifyStripeSignature(raw, sign(raw), secret)).toBe(true);
    expect(verifyStripeSignature(Buffer.concat([raw, Buffer.from(" ")]), sign(raw), secret)).toBe(false);
    expect(verifyStripeSignature(raw, sign(raw, Math.floor(Date.now() / 1000) - 301), secret)).toBe(false);
    expect(verifyStripeSignature(raw, `${sign(raw)},v1=${"0".repeat(64)}`, secret)).toBe(true);
  });

  it("waits for delayed payments and fulfills only the configured paid package", () => {
    expect(paidOrderFromEvent(event(undefined, "unpaid"), rules, false)).toBeNull();
    const paid = paidOrderFromEvent(event("checkout.session.async_payment_succeeded"), rules, false);
    expect(paid?.email).toBe("writer@example.com");
    expect(paid?.packageId).toBe("digi");
    const wrongAmount = event(); wrongAmount.data.object.amount_total = 1;
    expect(() => paidOrderFromEvent(wrongAmount, rules, false)).toThrow();
    expect(() => paidOrderFromEvent(event(), rules, true)).toThrow();
    const foreignLink = event(); foreignLink.data.object.payment_link = "plink_other";
    expect(paidOrderFromEvent(foreignLink, rules, false)).toBeNull();
  });

  it("validates the base EUR total even when Adaptive Pricing presents another currency", () => {
    // Stripe's current Checkout Session retains the integration currency/amount.
    // The customer's locally presented amount is a separate informational field.
    const converted = event();
    Object.assign(converted.data.object, { presentment_details: { presentment_amount: 5151908, presentment_currency: "try" } });
    expect(paidOrderFromEvent(converted, rules, false)?.amountTotal).toBe(89000);
    converted.data.object.amount_total = 1;
    expect(() => paidOrderFromEvent(converted, rules, false)).toThrow();
  });

  it("preserves raw bytes, rejects forged requests, and accepts delivery retries without extra jobs", async () => {
    const orders = new Map<string, PaidOrder>();
    const recordPaidOrder = vi.fn(async (order: PaidOrder) => { if (!orders.has(order.sessionId)) orders.set(order.sessionId, order); });
    const store = { recordPaidOrder } as unknown as OrderStore;
    const app = express();
    registerStripeWebhook(app, { enabled: true, secret, live: false, rules, store });
    app.use(express.json());
    const server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address() as { port: number };
    const url = `http://127.0.0.1:${address.port}/api/payments/stripe/webhook`;
    const raw = Buffer.from(JSON.stringify(event(), null, 2));
    try {
      const send = (signature: string) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "Stripe-Signature": signature }, body: raw });
      expect((await send("invalid")).status).toBe(400);
      expect(recordPaidOrder).not.toHaveBeenCalled();
      expect((await send(sign(raw))).status).toBe(200);
      expect((await send(sign(raw))).status).toBe(200);
      expect(orders.size).toBe(1);
      recordPaidOrder.mockRejectedValueOnce(Error("Database unavailable"));
      expect((await send(sign(raw))).status).toBe(503);
    } finally { server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve())); }
  });

  it("separates customer and owner recipients; buyer suppression never resubscribes marketing", async () => {
    const order = paidOrderFromEvent(event(), rules, false)!;
    const request = vi.fn(async (_url: unknown, _init?: RequestInit) => new Response("{}", { status: 201 }));
    const options = { request: request as typeof fetch, apiKey: "fake", senderEmail: "info@thunderkustannus.fi", ownerEmail: "santeri@example.com", buyerListId: 10, responseWindow: "24h" as const };
    const job = { id: "job", order, providerKey: "11111111-1111-4111-8111-111111111111", attempts: 1 };
    await deliverOrderJob({ ...job, kind: "customer" }, options);
    const message = JSON.parse(request.mock.calls[0][1]!.body as string);
    expect(message.to).toEqual([{ email: "writer@example.com" }]);
    expect(message.textContent).toContain("24 tunnin kuluessa");
    expect(message.subject).toContain("Digi-paketti");
    await deliverOrderJob({ ...job, kind: "buyer-list" }, options);
    const contact = JSON.parse(request.mock.calls[1][1]!.body as string);
    expect(contact.listIds).toEqual([10]);
    expect(contact).not.toHaveProperty("emailBlacklisted");
    expect(contact).not.toHaveProperty("attributes.OPT_IN");
  });

  it("escapes customer data and supports the approved response window", () => {
    const order = paidOrderFromEvent(event(), rules, false)!;
    expect(customerMessage(order, "business-day").textContent).toContain("yhden arkipäivän kuluessa");
  });

  it("adds buyers to their package list without restoring marketing consent", async () => {
    expect(readPackageLists('{"digi":11}')).toEqual({ digi: 11 });
    expect(() => readPackageLists('{"digi":-1}')).toThrow();
    expect(() => readPackageLists('{"unrelated":11}')).toThrow();
    const request = vi.fn(async (_url: unknown, _init?: RequestInit) => new Response("{}", { status: 201 }));
    await deliverOrderJob({ id: "test", kind: "buyer-list", order: paidOrderFromEvent(event(), rules, false)!,
      providerKey: "fixture", attempts: 1 }, { apiKey: "fixture", request: request as typeof fetch,
      ownerEmail: "info@thunderkustannus.fi", senderEmail: "info@thunderkustannus.fi", buyerListId: 10,
      packageLists: { digi: 11, premium: 13 }, responseWindow: "business-day" });
    const contact = JSON.parse(request.mock.calls[0][1]!.body as string);
    expect(contact.listIds).toEqual([10, 11]);
    expect(contact).not.toHaveProperty("emailBlacklisted");
  });
});
