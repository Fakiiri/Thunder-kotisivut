import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { randomBytes, randomUUID } from "node:crypto";
import { CoverVault, MemoryVault, VaultCrypto, type VaultRow } from "./vault";
import { CoverSubmissions } from "./submissions";
import { createProject } from "../../client/src/lib/cover/model";
import { inspectPdf, pricedPdfPages } from "../../shared/pdf-manuscript";
import { prepareInitialPrintQuote } from "./checkout";
import { PAGE_PRICE_POLICY_VERSION } from "../../shared/page-settlement";
import { preparePdf } from "./pdf-worker";

async function pdf(count: number, w = 148, h = 210) {
  const d = await PDFDocument.create();
  for (let n = 0; n < count; n++) d.addPage([(w * 72) / 25.4, (h * 72) / 25.4]);
  return Buffer.from(await d.save());
}
function fixture() {
  const crypt = new VaultCrypto(randomBytes(32)),
    repo = new MemoryVault(),
    vault = new CoverVault(repo, crypt),
    rows = new Map<string, VaultRow>();
  const submissions = new CoverSubmissions(
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
  return { vault, repo, submissions, rows };
}
describe("direct manuscript order", () => {
  it("rounds 273 pages to 320 and appends exactly 47 empty pages without changing existing page dimensions", async () => {
    const project = createProject();
    project.production = { ...project.production, pages: 320 };
    const bytes = await pdf(273);
    const client = await inspectPdf(bytes, project.production);
    expect(client).toMatchObject({
      sourcePages: 273,
      billedPages: 320,
      blankPages: 47,
    });
    const server = await preparePdf(bytes, project.production);
    expect(server).toMatchObject({
      sourcePages: 273,
      billedPages: 320,
      blankPages: 47,
    });
    const result = await PDFDocument.load(server.bytes);
    expect(result.getPageCount()).toBe(320);
    expect(result.getPage(0).getSize()).toEqual(result.getPage(319).getSize());
  });
  it("preserves exact-page PDF bytes and rejects a forged cheap page selection, oversize count and wrong trim size", async () => {
    const p = createProject().production;
    const bytes = await pdf(p.pages);
    expect((await preparePdf(bytes, p)).bytes.equals(bytes)).toBe(true);
    await expect(
      preparePdf(await pdf(273), { ...p, pages: 256 })
    ).rejects.toThrow();
    await expect(preparePdf(await pdf(1, 210, 297), p)).rejects.toThrow(
      "pdf-size-mismatch"
    );
    expect(() => pricedPdfPages(2001, p)).toThrow();
  });
  it("stores a guest order without confirming email ownership, locks a PDF quote and retries idempotently", async () => {
    const f = fixture(),
      project = createProject();
    project.production.pages = 320;
    const requestId = randomUUID();
    const guest = await f.vault.createGuestOrder(
      "test@example.invalid",
      project,
      requestId
    );
    expect(await f.vault.identity(guest.session)).toBeNull();
    await expect(f.vault.projects(guest.session)).rejects.toThrow(
      "unauthorized"
    );
    const user = (await f.vault.identity(guest.session, true))!;
    expect(await f.vault.journeyAudience(user.owner)).toBeNull();
    const input = {
      requestId,
      revision: 1,
      customer: {
        name: "Test Author",
        email: "test@example.invalid",
        phone: "",
        address: "Test road 1",
        postal: "00100",
        city: "Helsinki",
      },
      filename: "test.pdf",
      manuscript: (await pdf(273)).toString("base64"),
      confirmedPages: true,
      permission: true,
    };
    const receipt = await f.submissions.submit(
      guest.session,
      guest.projectId,
      input,
      true
    );
    expect(
      await f.submissions.submit(guest.session, guest.projectId, input, true)
    ).toEqual(receipt);
    expect(f.rows.size).toBe(1);
    const { source } = await f.submissions.paymentSource(
      guest.session,
      receipt.id
    );
    expect(source.pdfPages).toMatchObject({
      sourcePages: 273,
      billedPages: 320,
      blankPages: 47,
    });
    expect(source.pressManuscript).toBeTruthy();
    const quote = prepareInitialPrintQuote(source, {
      sourceDigest: source.digest,
      pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
      priceTermsAccepted: true,
    });
    expect(quote.provisional).toBe(false);
    const other = await f.vault.createGuestOrder(
      "test@example.invalid",
      project,
      randomUUID()
    );
    await expect(
      f.submissions.paymentSource(other.session, receipt.id)
    ).rejects.toThrow("not-found");
    await expect(
      f.submissions.submit(
        guest.session,
        guest.projectId,
        {
          ...input,
          customer: { ...input.customer, email: "someone@example.invalid" },
        },
        true
      )
    ).rejects.toThrow("email-mismatch");
  });
});
