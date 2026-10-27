import { describe, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { CoverVault, MemoryVault, VaultCrypto, type VaultRow } from "./vault";
import { CoverSubmissions } from "./submissions";
import {
  CoverCheckoutService,
  type CheckoutProvider,
} from "./checkout-service";
import type { CoverCheckoutRecord, CoverCheckoutStore } from "./checkout-store";
import { createProject } from "../../client/src/lib/cover/model";
import { PAGE_PRICE_POLICY_VERSION } from "../../shared/page-settlement";
class MemoryCheckout implements CoverCheckoutStore {
  rows = new Map<string, CoverCheckoutRecord>();
  tails = new Map<string, Promise<void>>();
  fulfillment = new Set<string>();
  async get(id: string) {
    const r = this.rows.get(id);
    return r ? structuredClone(r) : null;
  }
  async create(r: CoverCheckoutRecord) {
    if (!this.rows.has(r.id)) this.rows.set(r.id, structuredClone(r));
    const saved = (await this.get(r.id))!;
    if (
      saved.owner !== r.owner ||
      saved.quote.sourceDigest !== r.quote.sourceDigest
    )
      throw Error("checkout-conflict");
    return saved;
  }
  async update<T>(
    id: string,
    action: (r: CoverCheckoutRecord) => T
  ): Promise<T> {
    const prior = this.tails.get(id) || Promise.resolve();
    let release!: () => void;
    const gate = new Promise<void>(r => {
      release = r;
    });
    this.tails.set(
      id,
      prior.then(() => gate)
    );
    await prior;
    try {
      const r = await this.get(id);
      if (!r) throw Error("not-found");
      const result = action(r);
      if (r.state === "paid") this.fulfillment.add(r.id);
      this.rows.set(id, r);
      return result;
    } finally {
      release();
    }
  }
}
async function fixture() {
  let now = 1793090000000;
  const vault = new CoverVault(
    new MemoryVault(),
    new VaultCrypto(randomBytes(32)),
    () => now
  );
  const token = (await vault.requestLink("author@example.com", false, "test"))!;
  const session = (await vault.verify(token, "author@example.com"))!.session;
  const project = await vault.saveProject(session, createProject());
  const rows = new Map<string, VaultRow>();
  const repo = {
    async get(id: string) {
      return rows.get(id) || null;
    },
    async insert(r: VaultRow) {
      rows.set(r.id, r);
    },
    async prune() {},
  };
  const intake = new CoverSubmissions(
    vault,
    repo,
    new VaultCrypto(randomBytes(32)),
    () => now
  );
  const receipt = await intake.submit(session, project.id, {
    requestId: randomUUID(),
    revision: project.revision,
    customer: {
      name: "Test",
      email: "author@example.com",
      phone: "",
      address: "Test road",
      postal: "00100",
      city: "Helsinki",
    },
    filename: "book.pdf",
    manuscript: Buffer.from("%PDF-test %%EOF").toString("base64"),
    confirmedPages: true,
    permission: true,
  });
  const store = new MemoryCheckout();
  let failOnce = false;
  const attempts: string[] = [],
    created = new Map<string, { id: string; url: string; expires: number }>();
  let remote: {
    status: "open" | "expired" | "complete";
    paymentStatus: "paid" | "unpaid" | "no_payment_required";
  } = { status: "expired", paymentStatus: "unpaid" };
  const provider: CheckoutProvider = {
    async create(q, a) {
      attempts.push(a.id);
      if (!created.has(a.id))
        created.set(a.id, {
          id: "cs_test_" + a.id.replace(/-/g, ""),
          url: "https://checkout.stripe.com/c/pay/" + a.id,
          expires: a.expiresAt,
        });
      if (failOnce) {
        failOnce = false;
        throw Error("network-timeout");
      }
      return created.get(a.id)!;
    },
    async retrieve() {
      return remote;
    },
  };
  const service = new CoverCheckoutService(
    vault,
    intake,
    store,
    provider,
    false,
    () => now
  );
  const preview = await service.preview(session, receipt.id);
  const acceptance = {
    sourceDigest: preview.sourceDigest,
    pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
    priceTermsAccepted: true,
  };
  function event(record: CoverCheckoutRecord) {
    return {
      id: "evt_12345",
      livemode: false,
      type: "checkout.session.completed",
      data: {
        object: {
          id: record.session?.id || created.get(record.attempt!.id)!.id,
          object: "checkout.session",
          payment_link: null,
          mode: "payment",
          currency: "eur",
          amount_total: record.quote.totalCents,
          payment_status: "paid",
          client_reference_id: record.id,
          metadata: {
            integration: "thunder-cover-print-v1",
            cover_quote: record.id,
            cover_attempt: record.attempt!.id,
            cover_digest: record.quote.digest,
          },
        },
      },
    };
  }
  return {
    vault,
    session,
    id: receipt.id,
    store,
    service,
    provider,
    attempts,
    created,
    acceptance,
    event,
    advance: (ms: number) => {
      now += ms;
    },
    failNext: () => {
      failOnce = true;
    },
    setRemote: (r: typeof remote) => {
      remote = r;
    },
  };
}
describe("durable checkout orchestration", () => {
  it("ignores unrelated Stripe events without treating them as failed payments", async () => {
    const f = await fixture();
    expect(
      await f.service.receive({
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_example", metadata: { cover_quote: f.id } } },
      })
    ).toBe(false);
    expect(f.store.fulfillment.size).toBe(0);
  });
  it("requires login, ownership and policy acceptance", async () => {
    const f = await fixture();
    await expect(f.service.start("", f.id, f.acceptance)).rejects.toThrow(
      "unauthorized"
    );
    const link = await f.vault.requestLink("other@example.com", false, "other");
    const other = (await f.vault.verify(link!, "other@example.com"))!;
    await expect(
      f.service.start(other.session, f.id, f.acceptance)
    ).rejects.toThrow("not-found");
    await expect(
      f.service.start(f.session, f.id, {
        ...f.acceptance,
        priceTermsAccepted: false,
      })
    ).rejects.toThrow("price-terms-required");
    expect(f.created.size).toBe(0);
  });
  it("binds simultaneous starts to one provider idempotency key and one session", async () => {
    const f = await fixture();
    const [a, b] = await Promise.all([
      f.service.start(f.session, f.id, f.acceptance),
      f.service.start(f.session, f.id, f.acceptance),
    ]);
    expect(a).toEqual(b);
    expect(f.created.size).toBe(1);
    expect(new Set(f.attempts).size).toBe(1);
    expect(await f.service.preview(f.session, f.id)).toMatchObject({
      state: "open",
    });
    expect(f.store.fulfillment.size).toBe(0);
  });
  it("retries an ambiguous creation with the same saved attempt", async () => {
    const f = await fixture();
    f.failNext();
    await expect(
      f.service.start(f.session, f.id, f.acceptance)
    ).rejects.toThrow("network-timeout");
    const retry = await f.service.start(f.session, f.id, f.acceptance);
    expect(retry.url).toBeTruthy();
    expect(new Set(f.attempts).size).toBe(1);
    expect(f.created.size).toBe(1);
  });
  it("requires review instead of starting a second charge after the retry window", async () => {
    const f = await fixture();
    f.failNext();
    await expect(
      f.service.start(f.session, f.id, f.acceptance)
    ).rejects.toThrow();
    f.advance(15 * 60000);
    await expect(
      f.service.start(f.session, f.id, f.acceptance)
    ).rejects.toThrow("checkout-needs-review");
    expect(f.created.size).toBe(1);
    expect((await f.store.get(f.id))!.state).toBe("review");
  });
  it("renews only a provider-confirmed expired unpaid session", async () => {
    const f = await fixture();
    await f.service.start(f.session, f.id, f.acceptance);
    f.advance(3600001);
    await f.service.start(f.session, f.id, f.acceptance);
    expect(f.created.size).toBe(2);
  });
  it("does not issue a new session while a deferred payment is processing", async () => {
    const f = await fixture();
    await f.service.start(f.session, f.id, f.acceptance);
    f.advance(3600001);
    f.setRemote({ status: "complete", paymentStatus: "unpaid" });
    expect(await f.service.start(f.session, f.id, f.acceptance)).toEqual({
      processing: true,
    });
    expect(f.created.size).toBe(1);
  });
  it("rejects a wrong amount and processes duplicate paid events only once", async () => {
    const f = await fixture();
    await f.service.start(f.session, f.id, f.acceptance);
    const event = f.event((await f.store.get(f.id))!);
    event.data.object.amount_total = 1;
    await expect(f.service.receive(event)).rejects.toThrow(
      "payment-does-not-match-approval"
    );
    expect(f.store.fulfillment.size).toBe(0);
    const valid = f.event((await f.store.get(f.id))!);
    await f.service.receive(valid);
    await f.service.receive(valid);
    expect(f.store.fulfillment.size).toBe(1);
    expect((await f.service.preview(f.session, f.id)).state).toBe("paid");
    expect(await f.service.start(f.session, f.id, f.acceptance)).toEqual({
      paid: true,
    });
  });
  it("waits for deferred payment success and accepts late success after review", async () => {
    const f = await fixture();
    await f.service.start(f.session, f.id, f.acceptance);
    const event = f.event((await f.store.get(f.id))!);
    event.data.object.payment_status = "unpaid";
    expect(await f.service.receive(event)).toBe(false);
    expect(f.store.fulfillment.size).toBe(0);
    await f.store.update(f.id, r => {
      r.state = "review";
    });
    event.type = "checkout.session.async_payment_succeeded";
    event.data.object.payment_status = "paid";
    expect(await f.service.receive(event)).toBe(true);
    expect(f.store.fulfillment.size).toBe(1);
  });
});
