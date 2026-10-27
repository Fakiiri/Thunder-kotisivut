import { describe, it, expect } from "vitest";
import { randomBytes, randomUUID } from "node:crypto";
import { VaultCrypto, type VaultRow } from "./vault";
import { createProject } from "../../client/src/lib/cover/model";
import { coverGeometry, printQuote } from "../../shared/print-production";
import { deliverSubmissionNotice } from "./submission-mail";
import type { Submission, SubmissionNotice } from "./submissions";
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
  it("does not mark ambiguous delivery errors as automatically retryable", async () => {
    const f = fixture();
    await expect(
      deliverSubmissionNotice(
        f.job,
        f.crypt,
        "test-only",
        (async () => new Response("{}", { status: 503 })) as typeof fetch
      )
    ).rejects.toMatchObject({ retryable: false });
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
