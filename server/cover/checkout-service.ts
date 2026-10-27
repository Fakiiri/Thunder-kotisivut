import { randomUUID } from "node:crypto";
import { CoverVault } from "./vault";
import { CoverSubmissions } from "./submissions";
import {
  prepareInitialPrintQuote,
  validateApprovedQuote,
  paidPrintCheckout,
  type ThunderCheckoutClient,
  type ApprovedPrintQuote,
  type PrintCheckoutAttempt,
  type PrintCheckoutSession,
} from "./checkout";
import {
  PAGE_PRICE_POLICY_VERSION,
  PAGE_PRICE_NOTICE,
} from "../../shared/page-settlement";
import type { CoverCheckoutStore, CoverCheckoutRecord } from "./checkout-store";
export type CheckoutProvider = Pick<
  ThunderCheckoutClient,
  "create" | "retrieve"
>;
export class CoverCheckoutService {
  constructor(
    private vault: CoverVault,
    private submissions: CoverSubmissions,
    private store: CoverCheckoutStore,
    private provider: CheckoutProvider,
    private live: boolean,
    private now = Date.now
  ) {}
  private async owner(session: string) {
    const user = await this.vault.identity(session);
    if (!user) throw Error("unauthorized");
    return user.owner;
  }
  async preview(session: string, id: string) {
    const owner = await this.owner(session),
      old = await this.store.get(id);
    if (old) {
      if (old.owner !== owner) throw Error("not-found");
      return this.summary(old);
    }
    const { source } = await this.submissions.paymentSource(session, id);
    return {
      id,
      state: "awaiting-payment",
      sourceDigest: source.digest,
      title: source.project.title,
      deliveryAddress:
        source.customer.address +
        ", " +
        source.customer.postal +
        " " +
        source.customer.city,
      totalCents: source.quote.totalCents,
      printCents: source.quote.printCents,
      layoutCents: source.quote.layoutCents,
      deliveryCents: source.quote.deliveryCents,
      pages: source.project.production.pages,
      quantity: source.project.production.quantity,
      format: source.project.production.format,
      pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
      pagePolicyNotice: PAGE_PRICE_NOTICE,
    };
  }
  private summary(record: CoverCheckoutRecord) {
    const q = record.quote;
    return {
      id: record.id,
      state: record.state === "quoted" ? "awaiting-payment" : record.state,
      sourceDigest: q.sourceDigest,
      title: q.title,
      deliveryAddress:
        record.customer.address +
        ", " +
        record.customer.postal +
        " " +
        record.customer.city,
      expires: q.expires,
      totalCents: q.totalCents,
      printCents: q.printCents,
      layoutCents: q.layoutCents,
      deliveryCents: q.deliveryCents,
      pages: q.pages,
      quantity: q.quantity,
      format: q.format,
      pagePolicyVersion: q.pagePolicyVersion,
      pagePolicyNotice: PAGE_PRICE_NOTICE,
    };
  }
  async start(
    session: string,
    id: string,
    acceptance: {
      sourceDigest: string;
      pagePolicyVersion: string;
      priceTermsAccepted: boolean;
    }
  ): Promise<{ url?: string; paid?: boolean; processing?: boolean }> {
    const owner = await this.owner(session);
    if (
      acceptance.priceTermsAccepted !== true ||
      acceptance.pagePolicyVersion !== PAGE_PRICE_POLICY_VERSION
    )
      throw Error("price-terms-required");
    let record = await this.store.get(id);
    if (!record) {
      const { source } = await this.submissions.paymentSource(session, id);
      const quote = prepareInitialPrintQuote(source, acceptance, this.now());
      record = await this.store.create({
        id,
        owner,
        quote,
        customer: source.customer,
        state: "quoted",
        attempt: null,
        session: null,
      });
    }
    if (record.owner !== owner) throw Error("not-found");
    if (record.quote.sourceDigest !== acceptance.sourceDigest)
      throw Error("checkout-conflict");
    // An old session can be replaced only after Stripe confirms it has expired unpaid.
    if (
      record.state === "open" &&
      record.session &&
      record.attempt &&
      record.session.expires <= this.now()
    ) {
      const previousSession = record.session,
        previousAttempt = record.attempt;
      const remote = await this.provider.retrieve(
        record.quote,
        previousAttempt,
        previousSession.id
      );
      if (remote.status !== "expired" || remote.paymentStatus !== "unpaid")
        return { processing: true };
      await this.store.update(id, r => {
        if (r.owner !== owner) throw Error("not-found");
        if (r.state === "open" && r.session?.id === previousSession.id) {
          r.state = "quoted";
          r.attempt = null;
          r.session = null;
        }
      });
    }
    const prepared = await this.store.update(id, r => {
      if (r.owner !== owner) throw Error("not-found");
      if (r.state === "paid") return { kind: "paid" } as const;
      if (r.state === "review") return { kind: "review" } as const;
      if (r.session && r.state === "open")
        return { kind: "existing", session: r.session } as const;
      if (r.attempt && r.state === "creating") {
        if (r.attempt.createdAt < this.now() - 14 * 60000) {
          r.state = "review";
          return { kind: "review" } as const;
        }
        return { kind: "create", quote: r.quote, attempt: r.attempt } as const;
      }
      validateApprovedQuote(r.quote, this.now());
      if (r.quote.expires < this.now() + 3600000) throw Error("quote-expired");
      const createdAt = Math.floor(this.now() / 1000) * 1000;
      r.attempt = {
        id: randomUUID(),
        createdAt,
        expiresAt: createdAt + 3600000,
      };
      r.state = "creating";
      return { kind: "create", quote: r.quote, attempt: r.attempt } as const;
    });
    if (prepared.kind === "paid") return { paid: true };
    if (prepared.kind === "review") throw Error("checkout-needs-review");
    if (prepared.kind === "existing") return { url: prepared.session.url };
    // A timeout preserves the same attempt and its exact parameters for a bounded retry.
    const checkout = await this.provider.create(
      prepared.quote,
      prepared.attempt,
      this.now()
    );
    return this.store.update(id, r => {
      if (r.owner !== owner || r.attempt?.id !== prepared.attempt.id)
        throw Error("checkout-conflict");
      if (r.state === "paid") {
        if (r.session?.id !== checkout.id) throw Error("checkout-conflict");
        return { paid: true };
      }
      if (r.state === "review") throw Error("checkout-needs-review");
      if (r.session && r.session.id !== checkout.id)
        throw Error("checkout-conflict");
      r.session = checkout;
      r.state = "open";
      return { url: checkout.url };
    });
  }
  async receive(event: any) {
    if (
      ![
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
      ].includes(event?.type)
    )
      return false;
    const id = event?.data?.object?.metadata?.cover_quote;
    if (typeof id !== "string") throw Error("not-found");
    return this.store.update(id, r => {
      if (!r.attempt) throw Error("payment-without-attempt");
      const candidate = event?.data?.object?.id;
      if (
        typeof candidate !== "string" ||
        !/^cs_[A-Za-z0-9_]+$/.test(candidate)
      )
        throw Error("invalid-session");
      const paid = paidPrintCheckout(
        event,
        r.quote,
        r.attempt,
        r.session?.id || candidate,
        this.live
      );
      if (!paid) return false;
      if (r.state === "paid") {
        if (r.paidEvent?.sessionId !== paid.sessionId)
          throw Error("checkout-conflict");
        return true;
      }
      r.session ||= {
        id: paid.sessionId,
        url: "",
        expires: r.attempt.expiresAt,
      };
      r.paidEvent = { eventId: paid.eventId, sessionId: paid.sessionId };
      r.state = "paid";
      // The durable store inserts buyer-list and both confirmation jobs in this transaction.
      return true;
    });
  }
}
