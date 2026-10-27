import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import {
  approvePrintQuote,
  ThunderCheckoutClient,
  paidPrintCheckout,
  THUNDER_STRIPE_ACCOUNT,
  type ApprovedPrintQuote,
} from "./checkout";
import { createProject } from "../../client/src/lib/cover/model";
import { coverGeometry, printQuote } from "../../shared/print-production";
import type { Submission } from "./submissions";
const now = 1793090000000;
function fixture() {
  const project = createProject(),
    q = printQuote(project.production)!;
  const source: Submission = {
    receipt: {
      id: randomUUID(),
      status: "awaiting_review",
      totalCents: q.totalCents!,
      provisional: false,
      expires: now + 30 * 86400000,
    },
    customer: {
      name: "Test Author",
      email: "author@example.com",
      phone: "",
      address: "Test road",
      postal: "00100",
      city: "Helsinki",
    },
    project,
    projectId: randomUUID(),
    revision: 1,
    manuscript: "TEST",
    filename: "sisus.pdf",
    digest: "a".repeat(64),
    geometry: coverGeometry(project.production),
    quote: q,
    receivedAt: now,
    review: "required",
  };
  const quote = approvePrintQuote(
    source,
    {
      sourceDigest: source.digest,
      finalPagesConfirmed: true,
      amountConfirmed: true,
    },
    now
  );
  const attempt = {
    id: randomUUID(),
    createdAt: now,
    expiresAt: now + 3600000,
  };
  return { source, quote, attempt };
}
function provider(
  quote: ApprovedPrintQuote,
  attempt: ReturnType<typeof fixture>["attempt"],
  options: {
    account?: string;
    inclusive?: boolean;
    percentage?: number;
    session?: Record<string, unknown>;
  } = {}
) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const request = (async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("/accounts/"))
      return new Response(
        JSON.stringify({
          id: options.account || THUNDER_STRIPE_ACCOUNT,
          object: "account",
          charges_enabled: true,
        })
      );
    if (String(url).includes("/tax_rates/"))
      return new Response(
        JSON.stringify({
          id: String(url).split("/").pop(),
          active: true,
          inclusive: options.inclusive !== false,
          livemode: false,
          percentage: options.percentage ?? 13.5,
        })
      );
    return new Response(
      JSON.stringify({
        id: "cs_test_12345",
        object: "checkout.session",
        url: "https://checkout.stripe.com/c/pay/cs_test_12345",
        amount_total: quote.totalCents,
        currency: "eur",
        client_reference_id: quote.id,
        metadata: { cover_digest: quote.digest, cover_attempt: attempt.id },
        status: "open",
        payment_status: "unpaid",
        expires_at: Math.floor(attempt.expiresAt / 1000),
        livemode: false,
        ...options.session,
      })
    );
  }) as typeof fetch;
  const client = new ThunderCheckoutClient(
    {
      secret: "rk_test_OnlyFakeKey123456",
      mode: "test",
      taxRates: {
        print: "txr_print",
        layout: "txr_layout",
        delivery: "txr_delivery",
      },
    },
    request
  );
  return { client, calls };
}
function event(f: ReturnType<typeof fixture>) {
  return {
    id: "evt_12345",
    type: "checkout.session.completed",
    livemode: false,
    data: {
      object: {
        id: "cs_test_12345",
        object: "checkout.session",
        mode: "payment",
        payment_link: null,
        currency: "eur",
        amount_total: f.quote.totalCents,
        payment_status: "paid",
        client_reference_id: f.quote.id,
        metadata: {
          integration: "thunder-cover-print-v1",
          cover_quote: f.quote.id,
          cover_attempt: f.attempt.id,
          cover_digest: f.quote.digest,
        },
      },
    },
  };
}
describe("print checkout account and quote boundaries", () => {
  it("requires explicit final approval and binds approval to an immutable source", () => {
    const f = fixture();
    expect(() =>
      approvePrintQuote(
        f.source,
        {
          sourceDigest: f.source.digest,
          finalPagesConfirmed: false,
          amountConfirmed: true,
        },
        now
      )
    ).toThrow("approval-required");
    expect(() =>
      approvePrintQuote(
        f.source,
        {
          sourceDigest: "b".repeat(64),
          finalPagesConfirmed: true,
          amountConfirmed: true,
        },
        now
      )
    ).toThrow("approval-required");
    expect(f.quote.totalCents).toBe(f.source.quote.totalCents);
  });
  it("refuses checkout before verification or when the exact Thunder account is not verified", async () => {
    const f = fixture(),
      p = provider(f.quote, f.attempt, { account: "acct_other_business" });
    await expect(p.client.create(f.quote, f.attempt, now)).rejects.toThrow(
      "thunder-account-not-verified"
    );
    expect(p.calls).toHaveLength(0);
    await expect(p.client.initialize()).rejects.toThrow(
      "thunder-account-not-verified"
    );
    expect(p.calls.map(c => c.url)).toEqual([
      "https://api.stripe.com/v1/accounts/" + THUNDER_STRIPE_ACCOUNT,
    ]);
    expect(
      p.calls.every(
        c =>
          (c.init?.headers as Record<string, string>)["Stripe-Account"] ===
          THUNDER_STRIPE_ACCOUNT
      )
    ).toBe(true);
  });
  it("creates an exact-price session without manuscripts or contact addresses in metadata", async () => {
    const f = fixture(),
      p = provider(f.quote, f.attempt);
    await p.client.initialize();
    const session = await p.client.create(f.quote, f.attempt, now);
    expect(session.id).toBe("cs_test_12345");
    const call = p.calls[p.calls.length - 1],
      body = new URLSearchParams(String(call.init?.body));
    expect(body.get("customer_email")).toBe(f.quote.email);
    expect(body.get("line_items[0][price_data][unit_amount]")).toBe(
      String(f.quote.printCents)
    );
    expect(body.get("line_items[1][price_data][unit_amount]")).toBe(
      String(f.quote.deliveryCents)
    );
    expect(body.get("automatic_tax[enabled]")).toBe("false");
    expect(body.get("adaptive_pricing[enabled]")).toBe("false");
    expect(body.get("allow_promotion_codes")).toBe("false");
    expect(body.get("payment_method_types[1]")).toBe("klarna");
    expect(
      [...body.entries()]
        .filter(([k]) => k.startsWith("metadata"))
        .map(([, v]) => v)
        .join(" ")
    ).not.toContain("author@example.com");
    expect(String(call.init?.body)).not.toContain("Test+road");
    expect(
      (call.init?.headers as Record<string, string>)["Idempotency-Key"]
    ).toBe("cover-" + f.attempt.id);
  });
  it("does not create a session for a modified, expired or stale approval", async () => {
    const f = fixture(),
      p = provider(f.quote, f.attempt);
    await p.client.initialize();
    await expect(
      p.client.create({ ...f.quote, totalCents: 1 }, f.attempt, now)
    ).rejects.toThrow("invalid-approval");
    await expect(
      p.client.create(f.quote, f.attempt, f.quote.expires + 1)
    ).rejects.toThrow("invalid-approval");
    await expect(
      p.client.create(f.quote, f.attempt, now + 15 * 60000)
    ).rejects.toThrow("invalid-attempt");
    expect(p.calls.some(c => c.url.endsWith("/checkout/sessions"))).toBe(false);
  });
  it("rejects a tax rate differing from the agreed 13.5 percent", async () => {
    const f=fixture(), p=provider(f.quote,f.attempt,{percentage:25.5});
    await expect(p.client.initialize()).rejects.toThrow("inclusive-tax-rate-required");
  });
  it("rejects exclusive VAT rates that would add tax on top of the advertised price", async () => {
    const f = fixture(),
      p = provider(f.quote, f.attempt, { inclusive: false });
    await expect(p.client.initialize()).rejects.toThrow(
      "inclusive-tax-rate-required"
    );
  });
  it.each([
    { url: "https://evil.invalid/pay" },
    { amount_total: 1 },
    { livemode: true },
    { metadata: { cover_digest: "wrong" } },
    { expires_at: 0 },
  ])("rejects a mismatched provider response %j", async session => {
    const f = fixture(),
      p = provider(f.quote, f.attempt, { session });
    await p.client.initialize();
    await expect(p.client.create(f.quote, f.attempt, now)).rejects.toThrow(
      "checkout-response-mismatch"
    );
  });
  it("does not confuse test and live API keys", () => {
    expect(
      () =>
        new ThunderCheckoutClient({
          secret: "sk_live_OnlyFakeKey123456",
          mode: "test",
          taxRates: {
            print: "txr_print",
            layout: "txr_layout",
            delivery: "txr_delivery",
          },
        })
    ).toThrow("checkout-configuration-incomplete");
  });
  it("accepts only paid, bound sessions and ignores an unpaid deferred payment", () => {
    const f = fixture(),
      e = event(f);
    expect(
      paidPrintCheckout(e, f.quote, f.attempt, "cs_test_12345", false)?.email
    ).toBe("author@example.com");
    e.data.object.payment_status = "unpaid";
    expect(
      paidPrintCheckout(e, f.quote, f.attempt, "cs_test_12345", false)
    ).toBeNull();
    e.type = "checkout.session.async_payment_succeeded";
    e.data.object.payment_status = "paid";
    expect(
      paidPrintCheckout(e, f.quote, f.attempt, "cs_test_12345", false)
        ?.amountCents
    ).toBe(f.quote.totalCents);
  });
  it("rejects wrong session, amount, account and quote bindings", () => {
    const f = fixture();
    expect(() =>
      paidPrintCheckout(event(f), f.quote, f.attempt, "cs_test_other", false)
    ).toThrow();
    const wrongAmount = event(f);
    wrongAmount.data.object.amount_total = 1;
    expect(() =>
      paidPrintCheckout(wrongAmount, f.quote, f.attempt, "cs_test_12345", false)
    ).toThrow();
    expect(() =>
      paidPrintCheckout(
        { ...event(f), account: "acct_other_business" },
        f.quote,
        f.attempt,
        "cs_test_12345",
        false
      )
    ).toThrow();
  });
});
