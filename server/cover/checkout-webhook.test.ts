import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { createHmac } from "node:crypto";
import { registerStripeWebhook } from "../payments";
import type { OrderStore } from "../payments/store";
describe("cover dispatch through the signed Stripe boundary", () => {
  let server: Server, base: string;
  const handled: unknown[] = [];
  const recorded: unknown[] = [];
  const store: OrderStore = {
    async recordPaidOrder(o) {
      recorded.push(o);
    },
    async claim() {
      return null;
    },
    async finish() {},
    async fail() {},
  };
  beforeAll(async () => {
    const app = express();
    registerStripeWebhook(app, {
      enabled: true,
      secret: "standard-test-secret",
      coverSecret: "cover-test-secret",
      live: false,
      store,
      rules: { plink_demo: { packageId: "digi", amountCents: 89000 } },
      cover: async e => {
        handled.push(e);
      },
    });
    app.use(express.json());
    server = await new Promise<Server>(r => {
      const s = app.listen(0, "127.0.0.1", () => r(s));
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw Error();
    base = "http://127.0.0.1:" + addr.port;
  });
  afterAll(async () => {
    await new Promise<void>(r => server.close(() => r()));
  });
  async function post(event: unknown, secret: string) {
    const body = JSON.stringify(event),
      ts = Math.floor(Date.now() / 1000),
      sig = createHmac("sha256", secret)
        .update(ts + ".")
        .update(body)
        .digest("hex");
    return fetch(base + "/api/payments/stripe/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": "t=" + ts + ",v1=" + sig,
      },
      body,
    });
  }
  const event = {
    id: "evt_test",
    livemode: false,
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_demo",
        object: "checkout.session",
        mode: "payment",
        currency: "eur",
        payment_status: "paid",
        amount_total: 89000,
        payment_link: "plink_demo",
        customer_details: { email: "author@example.com", name: "Test" },
      },
    },
  };
  it("rejects a forged signature before a handler or order write", async () => {
    expect(
      (
        await post(
          {
            ...event,
            data: {
              object: { metadata: { integration: "thunder-cover-print-v1" } },
            },
          },
          "wrong-secret"
        )
      ).status
    ).toBe(400);
    expect(handled).toHaveLength(0);
    expect(recorded).toHaveLength(0);
  });
  it("routes a signed cover event only to the cover verifier", async () => {
    const cover = {
      ...event,
      data: {
        object: {
          ...event.data.object,
          payment_link: null,
          metadata: { integration: "thunder-cover-print-v1" },
        },
      },
    };
    expect((await post(cover, "cover-test-secret")).status).toBe(200);
    expect(handled).toHaveLength(1);
    expect(recorded).toHaveLength(0);
  });
  it("does not let a test-cover secret authorize an existing package order", async () => {
    expect((await post(event, "cover-test-secret")).status).toBe(400);
    expect(recorded).toHaveLength(0);
    expect((await post(event, "standard-test-secret")).status).toBe(200);
    expect(recorded).toHaveLength(1);
  });
});
