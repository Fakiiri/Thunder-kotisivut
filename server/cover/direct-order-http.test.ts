import { it, expect } from "vitest";
import express from "express";
import { randomBytes, randomUUID } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { registerCoverRoutes } from "./routes";
import { CoverVault, MemoryVault, VaultCrypto, type VaultRow } from "./vault";
import { CoverSubmissions } from "./submissions";
import { CoverCheckoutService } from "./checkout-service";
import type { CoverCheckoutRecord, CoverCheckoutStore } from "./checkout-store";
import { createProject } from "../../client/src/lib/cover/model";
const DOCX =
  "UEsDBBQAAAAAACO7el1XdMvlLwAAAC8AAAARAAAAd29yZC9kb2N1bWVudC54bWw8ZG9jdW1lbnQ+PHA+U3ludGhldGljIHRlc3Qgb25seTwvcD48L2RvY3VtZW50PlBLAQIUABQAAAAAACO7el1XdMvlLwAAAC8AAAARAAAAAAAAAAAAAACAAQAAAAB3b3JkL2RvY3VtZW50LnhtbFBLBQYAAAAAAQABAD8AAABeAAAAAAA=";
it("takes PDF/Word orders without email login; deduplicates checkout; isolates cookies and rejects CSRF, forged pages and honeypot", async () => {
  const app = express(),
    server = app.listen(0, "127.0.0.1");
  await new Promise<void>(r => server.once("listening", r));
  const addr = server.address() as { port: number },
    base = "http://127.0.0.1:" + addr.port;
  const crypt = new VaultCrypto(randomBytes(32)),
    vault = new CoverVault(new MemoryVault(), crypt),
    rows = new Map<string, VaultRow>(),
    checkouts = new Map<string, CoverCheckoutRecord>();
  const intake = new CoverSubmissions(
    vault,
    {
      async get(id) {
        return rows.get(id) || null;
      },
      async insert(row) {
        if (rows.has(row.id)) throw Error("duplicate");
        rows.set(row.id, row);
      },
      async prune() {},
    },
    crypt
  );
  const store: CoverCheckoutStore = {
    async get(id) {
      return checkouts.get(id) || null;
    },
    async create(r) {
      checkouts.set(r.id, r);
      return r;
    },
    async update(id, fn) {
      return fn(checkouts.get(id)!);
    },
  };
  let created = 0;
  const checkout = new CoverCheckoutService(
    vault,
    intake,
    store,
    {
      async create() {
        created++;
        return {
          id: "cs_test_synthetic",
          url: "https://checkout.stripe.com/c/pay/cs_test_synthetic",
          expires: Date.now() + 3600000,
        };
      },
      async retrieve() {
        throw Error("unused");
      },
    },
    false
  );
  registerCoverRoutes(app, {
    base,
    vault,
    submissions: intake,
    checkout,
    sendAccess: null,
    directOrderEnabled: true,
  });
  const project = createProject();
  project.production.pages = 320;
  const doc = await PDFDocument.create();
  for (let n = 0; n < 273; n++)
    doc.addPage([(148 * 72) / 25.4, (210 * 72) / 25.4]);
  const requestId = randomUUID(),
    input = {
      project,
      website: "",
      priceTermsAccepted: true,
      submission: {
        requestId,
        revision: 1,
        customer: {
          name: "Test Author",
          email: "test@example.invalid",
          phone: "",
          address: "Test road",
          postal: "00100",
          city: "Helsinki",
        },
        filename: "test.pdf",
        manuscript: Buffer.from(await doc.save()).toString("base64"),
        confirmedPages: true,
        permission: true,
      },
    };
  const post = (data: unknown, cookie = "", origin = base) =>
    fetch(base + "/api/cover/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Cookie: cookie,
      },
      body: JSON.stringify(data),
    });
  try {
    expect((await post(input, "", "https://other.invalid")).status).toBe(403);
    const first = await post(input);
    expect(first.status).toBe(201);
    const body = await first.json(),
      cookie = first.headers.get("set-cookie")!.split(";")[0];
    expect(body.url).toContain("checkout.stripe.com");
    expect(created).toBe(1);
    expect((await post(input, cookie)).status).toBe(201);
    expect(created).toBe(1);
    expect(rows.size).toBe(1);
    expect(
      (await fetch(base + "/api/cover/checkout/" + requestId)).status
    ).toBe(401);
    const view = await fetch(base + "/api/cover/checkout/" + requestId, {
      headers: { Cookie: cookie },
    });
    expect(view.status).toBe(200);
    expect((await view.json()).pagePolicyNotice).toContain("lukittu");
    expect(
      (
        await fetch(base + "/api/cover/checkout/" + randomUUID(), {
          headers: { Cookie: cookie },
        })
      ).status
    ).toBe(401);
    expect(
      (
        await fetch(base + "/api/cover/projects", {
          headers: { Cookie: cookie },
        })
      ).status
    ).toBe(401);
    const bad = {
      ...input,
      project: {
        ...project,
        production: { ...project.production, pages: 256 },
      },
      submission: { ...input.submission, requestId: randomUUID() },
    };
    expect((await post(bad)).status).toBe(422);
    expect(created).toBe(1);
    const word = {
      ...input,
      project: {
        ...project,
        production: { ...project.production, interior: "layout" },
      },
      submission: {
        ...input.submission,
        requestId: randomUUID(),
        filename: "test.docx",
        manuscript: DOCX,
        confirmedPages: false,
      },
    };
    const wr = await post(word);
    expect(wr.status).toBe(201);
    const wi = await wr.json();
    expect(checkouts.get(wi.id)!.quote).toMatchObject({
      layoutCents: 21700,
      provisional: true,
    });
    expect((await post({ ...input, website: "spam" })).status).toBe(422);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(e => (e ? reject(e) : resolve()))
    );
  }
}, 20000);
