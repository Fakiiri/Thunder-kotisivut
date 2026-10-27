import {
  PAGE_PRICE_POLICY_VERSION,
  PAGE_PRICE_NOTICE,
} from "../../shared/page-settlement";
import { createHash } from "node:crypto";
import { z } from "zod";
import type { Submission } from "./submissions";

// Fixed in code: configuration cannot redirect this integration to another business.
export const THUNDER_STRIPE_ACCOUNT = "acct_1URH3eDSRtkovYbq";
const uuid = z.string().uuid();
const hash = z.string().regex(/^[a-f0-9]{64}$/);
export type ApprovedPrintQuote = {
  id: string;
  digest: string;
  sourceDigest: string;
  email: string;
  title: string;
  quantity: number;
  format: string;
  pages: number;
  printCents: number;
  layoutCents: number;
  deliveryCents: number;
  totalCents: number;
  provisional: boolean;
  pagePolicyVersion: typeof PAGE_PRICE_POLICY_VERSION;
  approvedAt: number;
  expires: number;
};
export type PrintCheckoutAttempt = {
  id: string;
  createdAt: number;
  expiresAt: number;
};
export type PrintCheckoutSession = { id: string; url: string; expires: number };

export function approvePrintQuote(
  source: Submission,
  confirmation: {
    sourceDigest: string;
    finalPagesConfirmed: boolean;
    amountConfirmed: boolean;
  },
  now = Date.now()
): ApprovedPrintQuote {
  if (
    !hash.safeParse(source.digest).success ||
    confirmation.sourceDigest !== source.digest ||
    !confirmation.finalPagesConfirmed ||
    !confirmation.amountConfirmed
  )
    throw Error("approval-required");
  return buildStoredQuote(source, now, false);
}

export function prepareInitialPrintQuote(
  source: Submission,
  acceptance: {
    sourceDigest: string;
    pagePolicyVersion: string;
    priceTermsAccepted: boolean;
  },
  now = Date.now()
): ApprovedPrintQuote {
  if (
    !hash.safeParse(source.digest).success ||
    acceptance.sourceDigest !== source.digest ||
    acceptance.pagePolicyVersion !== PAGE_PRICE_POLICY_VERSION ||
    acceptance.priceTermsAccepted !== true
  )
    throw Error("price-terms-required");
  return buildStoredQuote(source, now, true);
}

function buildStoredQuote(
  source: Submission,
  now: number,
  provisional: boolean
): ApprovedPrintQuote {
  if (
    source.receipt.expires <= now ||
    !uuid.safeParse(source.receipt.id).success
  )
    throw Error("expired");
  const q = source.quote,
    p = source.project.production;
  if (
    p.quantity > 200 ||
    p.quantity < 1 ||
    q.totalCents === null ||
    !Number.isSafeInteger(q.totalCents) ||
    q.totalCents <= 0 ||
    q.deliveryCents === null ||
    [q.printCents, q.layoutCents, q.deliveryCents].some(
      x => !Number.isSafeInteger(x) || x < 0
    ) ||
    q.printCents + q.layoutCents + q.deliveryCents !== q.totalCents
  )
    throw Error("invalid-quote");
  const value: Omit<ApprovedPrintQuote, "digest"> = {
    id: source.receipt.id,
    sourceDigest: source.digest,
    email: source.customer.email.toLowerCase(),
    title: source.project.title,
    quantity: p.quantity,
    format: p.format,
    pages: p.pages,
    printCents: q.printCents,
    layoutCents: q.layoutCents,
    deliveryCents: q.deliveryCents,
    totalCents: q.totalCents,
    provisional,
    pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
    approvedAt: now,
    expires: Math.min(source.receipt.expires, now + 7 * 86400000),
  };
  return {
    ...value,
    digest: createHash("sha256").update(JSON.stringify(value)).digest("hex"),
  };
}
export function validateApprovedQuote(q: ApprovedPrintQuote, now: number) {
  const { digest, ...value } = q;
  if (
    !uuid.safeParse(q.id).success ||
    !hash.safeParse(q.sourceDigest).success ||
    createHash("sha256").update(JSON.stringify(value)).digest("hex") !==
      digest ||
    q.expires <= now ||
    q.pagePolicyVersion !== PAGE_PRICE_POLICY_VERSION ||
    q.approvedAt > now ||
    !z.email().safeParse(q.email).success
  )
    throw Error("invalid-approval");
}
export class ThunderCheckoutClient {
  private verified = false;
  constructor(
    private settings: {
      secret: string;
      mode: "test" | "live";
      taxRates: { print: string; layout: string; delivery: string };
    },
    private request: typeof fetch = fetch
  ) {
    const prefix =
      settings.mode === "live"
        ? /^(sk|rk)_live_[A-Za-z0-9]{12,}$/
        : /^(sk|rk)_test_[A-Za-z0-9]{12,}$/;
    if (
      !prefix.test(settings.secret) ||
      [
        settings.taxRates?.print,
        settings.taxRates?.layout,
        settings.taxRates?.delivery,
      ].some(x => !/^txr_[A-Za-z0-9]+$/.test(x))
    )
      throw Error("checkout-configuration-incomplete");
    // Copy settings so later mutation of an external object cannot change account scope.
    this.settings = { ...settings, taxRates: { ...settings.taxRates } };
  }
  private async call(path: string, init: RequestInit = {}) {
    const response = await this.request("https://api.stripe.com/v1" + path, {
      ...init,
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: "Bearer " + this.settings.secret,
        ...init.headers,
        "Stripe-Account": THUNDER_STRIPE_ACCOUNT,
      },
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      const code = [failure.error?.type, failure.error?.code, failure.error?.param]
        .filter(x => typeof x === "string" && /^[a-zA-Z0-9_.]+$/.test(x)).join(":");
      throw Error("stripe-unavailable:" + response.status + ":" + code);
    }
    return response.json();
  }
  async initialize() {
    this.verified = false;
    // Retrieve only the explicitly authorized Thunder account, never a default account or account list.
    const account = await this.call("/accounts/" + THUNDER_STRIPE_ACCOUNT);
    if (
      account.id !== THUNDER_STRIPE_ACCOUNT ||
      account.object !== "account" ||
      (this.settings.mode === "live" && account.charges_enabled !== true)
    )
      throw Error("thunder-account-not-verified");
    for (const id of Array.from(
      new Set(Object.values(this.settings.taxRates))
    )) {
      const rate = await this.call("/tax_rates/" + id);
      if (
        rate.id !== id ||
        rate.active !== true ||
        rate.inclusive !== true ||
        rate.livemode !== (this.settings.mode === "live") ||
        rate.percentage !== 13.5
      )
        throw Error("inclusive-tax-rate-required");
    }
    this.verified = true;
  }
  async retrieve(
    quote: ApprovedPrintQuote,
    attempt: PrintCheckoutAttempt,
    id: string
  ) {
    if (!this.verified || !/^cs_[A-Za-z0-9_]+$/.test(id))
      throw Error("thunder-account-not-verified");
    const result = await this.call("/checkout/sessions/" + id);
    if (
      result.id !== id ||
      result.object !== "checkout.session" ||
      result.livemode !== (this.settings.mode === "live") ||
      result.amount_total !== quote.totalCents ||
      result.currency !== "eur" ||
      result.client_reference_id !== quote.id ||
      result.metadata?.cover_digest !== quote.digest ||
      result.metadata?.cover_attempt !== attempt.id ||
      result.metadata?.cover_quote !== quote.id ||
      result.metadata?.integration !== "thunder-cover-print-v1" ||
      !["open", "expired", "complete"].includes(result.status) ||
      !["paid", "unpaid", "no_payment_required"].includes(result.payment_status)
    )
      throw Error("checkout-response-mismatch");
    return {
      status: result.status as "open" | "expired" | "complete",
      paymentStatus: result.payment_status as
        | "paid"
        | "unpaid"
        | "no_payment_required",
    };
  }
  async create(
    quote: ApprovedPrintQuote,
    attempt: PrintCheckoutAttempt,
    now = Date.now()
  ): Promise<PrintCheckoutSession> {
    if (!this.verified) throw Error("thunder-account-not-verified");
    validateApprovedQuote(quote, now);
    if (
      !uuid.safeParse(attempt.id).success ||
      !Number.isSafeInteger(attempt.createdAt) ||
      !Number.isSafeInteger(attempt.expiresAt) ||
      attempt.createdAt > now ||
      attempt.expiresAt - attempt.createdAt !== 3600000 ||
      attempt.createdAt < now - 14 * 60000 ||
      quote.expires < attempt.expiresAt
    )
      throw Error("invalid-attempt");
    const body = new URLSearchParams({
      "custom_text[submit][message]":
        "Maksat ilmoitettuun sivumäärään perustuvan maksun. " +
        PAGE_PRICE_NOTICE,
      mode: "payment",
      locale: "fi",
      currency: "eur",
      customer_email: quote.email,
      client_reference_id: quote.id,
      success_url:
        "https://www.thunderkustannus.fi/kansi-maksu/" + quote.id + "?paluu=1",
      cancel_url: "https://www.thunderkustannus.fi/kansi-maksu/" + quote.id,
      billing_address_collection: "required",
      allow_promotion_codes: "false",
      "automatic_tax[enabled]": "false",
      "adaptive_pricing[enabled]": "false",
      expires_at: String(Math.floor(attempt.expiresAt / 1000)),
    });
    ["card", "klarna", "mobilepay"].forEach((method, i) =>
      body.set("payment_method_types[" + i + "]", method)
    );
    const metadata = {
      integration: "thunder-cover-print-v1",
      cover_quote: quote.id,
      cover_attempt: attempt.id,
      cover_digest: quote.digest,
    };
    for (const [key, value] of Object.entries(metadata)) {
      body.set("metadata[" + key + "]", value);
      body.set("payment_intent_data[metadata][" + key + "]", value);
    }
    const lines = [
      {
        name:
          "Kirjan painatus, " +
          quote.quantity +
          " kpl, " +
          quote.format +
          " mm, " +
          quote.pages +
          " sivua",
        amount: quote.printCents,
        tax: this.settings.taxRates.print,
      },
      ...(quote.layoutCents
        ? [
            {
              name: "Sisäsivujen taitto",
              amount: quote.layoutCents,
              tax: this.settings.taxRates.layout,
            },
          ]
        : []),
      {
        name: "Kotiintoimitus",
        amount: quote.deliveryCents,
        tax: this.settings.taxRates.delivery,
      },
    ].filter(x => x.amount > 0);
    lines.forEach((line, i) => {
      const prefix = "line_items[" + i + "]";
      body.set(prefix + "[quantity]", "1");
      body.set(prefix + "[price_data][currency]", "eur");
      body.set(prefix + "[price_data][unit_amount]", String(line.amount));
      body.set(prefix + "[price_data][tax_behavior]", "inclusive");
      body.set(prefix + "[price_data][product_data][name]", line.name);
      body.set(prefix + "[tax_rates][0]", line.tax);
    });
    const result = await this.call("/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": "cover-" + attempt.id,
      },
      body: body.toString(),
    });
    const url = new URL(String(result.url));
    if (
      !/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(result.id) ||
      result.object !== "checkout.session" ||
      result.livemode !== (this.settings.mode === "live") ||
      result.amount_total !== quote.totalCents ||
      result.currency !== "eur" ||
      result.client_reference_id !== quote.id ||
      result.metadata?.cover_digest !== quote.digest ||
      result.metadata?.cover_attempt !== attempt.id ||
      result.status !== "open" ||
      result.payment_status !== "unpaid" ||
      result.expires_at !== Math.floor(attempt.expiresAt / 1000) ||
      url.protocol !== "https:" ||
      url.hostname !== "checkout.stripe.com" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443")
    )
      throw Error("checkout-response-mismatch");
    return {
      id: result.id,
      url: result.url,
      expires: result.expires_at * 1000,
    };
  }
}

// This function accepts only a signature-verified Stripe event at the HTTP boundary.
// A browser redirect, expired session or completed-but-unpaid Klarna session never marks an order paid.
export function paidPrintCheckout(
  event: any,
  quote: ApprovedPrintQuote,
  attempt: PrintCheckoutAttempt,
  sessionId: string,
  live: boolean
) {
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event?.type)
  )
    return null;
  if (
    event.livemode !== live ||
    (event.account && event.account !== THUNDER_STRIPE_ACCOUNT)
  )
    throw Error("payment-account-or-mode-mismatch");
  const s = event.data?.object;
  if (
    !s ||
    s.object !== "checkout.session" ||
    s.id !== sessionId ||
    s.payment_link ||
    s.mode !== "payment" ||
    s.currency !== "eur" ||
    s.amount_total !== quote.totalCents ||
    s.client_reference_id !== quote.id ||
    s.metadata?.integration !== "thunder-cover-print-v1" ||
    s.metadata.cover_quote !== quote.id ||
    s.metadata.cover_attempt !== attempt.id ||
    s.metadata.cover_digest !== quote.digest ||
    !/^evt_[A-Za-z0-9]+$/.test(event.id)
  )
    throw Error("payment-does-not-match-approval");
  if (s.payment_status !== "paid") return null;
  return {
    eventId: event.id,
    sessionId: s.id,
    email: quote.email,
    amountCents: quote.totalCents,
    quoteId: quote.id,
    approvalDigest: quote.digest,
  };
}
