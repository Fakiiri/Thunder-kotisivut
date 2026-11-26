import { describe, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { VaultCrypto, type VaultRow } from "./vault";
import { createProject } from "../../client/src/lib/cover/model";
import { coverGeometry, printQuote } from "../../shared/print-production";
import { deliverSubmissionNotice } from "./submission-mail";
import type { Submission, SubmissionNotice } from "./submissions";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
function fixture() {
  const crypt = new VaultCrypto(randomBytes(32)),
    project = createProject(),
    id = randomUUID();
  const value: Submission = {
    receipt: {
      id,
      status: "awaiting_review",
      totalCents: printQuote(project.production)!.totalCents!,
      provisional: false,
      expires: Date.now() + 10000,
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
    manuscript: Buffer.from("%PDF-test-only").toString("base64"),
    filename: "sisus.pdf",
    digest: "test",
    geometry: coverGeometry(project.production),
    quote: printQuote(project.production)!,
    receivedAt: Date.now(),
    review: "required",
  };
  const row: VaultRow = {
    id,
    owner: "test",
    kind: "project",
    revision: 1,
    expires: Date.now() + 10000,
    payload: crypt.seal(id, value),
  };
  const job: SubmissionNotice = {
    row,
    lease: randomUUID(),
    key: randomUUID(),
    attempts: 1,
  };
  return { crypt, job, value };
}
describe("owner manuscript notification", () => {
  it("splits large original/padded attachments into bounded, idempotent owner emails", async () => {
    const f = fixture();
    f.value.directOrder = true;
    f.value.manuscript = Buffer.alloc(8 * 1024 * 1024).toString("base64");
    f.value.pressManuscript = f.value.manuscript;
    f.job.row.payload = f.crypt.seal(f.job.row.id, f.value);
    const sent: any[] = [];
    await deliverSubmissionNotice(f.job, f.crypt, "test-only", (async (
      _url,
      init
    ) => {
      const raw = String(init?.body);
      expect(Buffer.byteLength(raw)).toBeLessThan(20_000_000);
      const body = JSON.parse(raw);
      sent.push({
        to: body.to,
        key: body.headers.idempotencyKey,
        names: body.attachment.map((a: any) => a.name),
      });
      return new Response("{}", { status: 201 });
    }) as typeof fetch);
    expect(sent).toHaveLength(2);
    expect(sent[0].key).toBe(f.job.key);
    expect(sent[1].key).not.toBe(f.job.key);
    expect(sent.flatMap(s => s.names)).toContain("sisus-tyhjat-loppusivut.pdf");
    expect(sent.every(s => s.to[0].email === "info@thunderkustannus.fi")).toBe(
      true
    );
  });
  it("delivers the original, padded PDF and immutable cover preview only to Thunder", async () => {
    const f = fixture();
    const image=await sharp({create:{width:1000,height:1500,channels:3,background:'#287b93'}}).jpeg().toBuffer();
    f.value.project.image={data:'data:image/jpeg;base64,'+image.toString('base64'),width:1000,height:1500};
    f.value.directOrder = true;
    f.value.pdfPages = { sourcePages: 150, billedPages: 160, blankPages: 10 };
    f.value.pressManuscript = Buffer.from("synthetic padded copy").toString(
      "base64"
    );
    f.job.row.payload = f.crypt.seal(f.job.row.id, f.value);
    let body: any;
    await deliverSubmissionNotice(f.job, f.crypt, "test-only", (async (
      _url,
      init
    ) => {
      body = JSON.parse(String(init?.body));
      return new Response("{}", { status: 201 });
    }) as typeof fetch);
    expect(body.to).toEqual([{ email: "info@thunderkustannus.fi" }]);
    expect(body.attachment.map((a: any) => a.name)).toEqual([
      "sisus.pdf",
      "kansi-esikatselu.pdf",
      "sisus-tyhjat-loppusivut.pdf",
    ]);
    const cover = await PDFDocument.load(
      Buffer.from(body.attachment[1].content, "base64")
    );
    expect(cover.getPageCount()).toBe(1);
    expect(body.textContent).toContain("10 tyhjää loppusivua");
  });
  it("sends only to the fixed owner, with authenticated reply-to and original attachment", async () => {
    const f = fixture();
    let body: any;
    const request = (async (_url, init) => {
      body = JSON.parse(String(init?.body));
      return new Response("{}", { status: 201 });
    }) as typeof fetch;
    await deliverSubmissionNotice(f.job, f.crypt, "test-only", request);
    expect(body.to).toEqual([{ email: "info@thunderkustannus.fi" }]);
    expect(body.replyTo.email).toBe("author@example.com");
    expect(body.attachment).toEqual([
      { name: "sisus.pdf", content: f.value.manuscript },
    ]);
    expect(body.textContent).toContain("Ei maksettua");
    expect(body.headers.idempotencyKey).toBe(f.job.key);
  });
  it("retries transient delivery errors using the same idempotency key", async () => {
    const f = fixture();
    await expect(
      deliverSubmissionNotice(
        f.job,
        f.crypt,
        "test-only",
        (async () => new Response("{}", { status: 503 })) as typeof fetch
      )
    ).rejects.toMatchObject({ retryable: true });
    await expect(
      deliverSubmissionNotice(
        f.job,
        f.crypt,
        "test-only",
        (async () => new Response("{}", { status: 429 })) as typeof fetch
      )
    ).rejects.toMatchObject({ retryable: true });
  });
  it("treats only an idempotency-specific duplicate as already accepted", async () => {
    const f = fixture();
    await expect(
      deliverSubmissionNotice(
        f.job,
        f.crypt,
        "test-only",
        (async () =>
          new Response(
            JSON.stringify({
              code: "duplicate_parameter",
              message:
                "Email for the idempotency key has already been processed",
            }),
            { status: 400 }
          )) as typeof fetch
      )
    ).resolves.toBeUndefined();
    await expect(
      deliverSubmissionNotice(
        f.job,
        f.crypt,
        "test-only",
        (async () =>
          new Response(
            JSON.stringify({
              code: "duplicate_parameter",
              message: "Other parameter exists",
            }),
            { status: 400 }
          )) as typeof fetch
      )
    ).rejects.toThrow();
  });
});
