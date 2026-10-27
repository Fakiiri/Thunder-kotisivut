import { describe, it, expect } from "vitest";
import {
  assessPageChange,
  assessPriceSettlement,
  PAGE_PRICE_POLICY_VERSION,
} from "../../shared/page-settlement";
import { prepareInitialPrintQuote } from "./checkout";
import { createProject } from "../../client/src/lib/cover/model";
import { printQuote, coverGeometry } from "../../shared/print-production";
import { randomUUID } from "node:crypto";
import type { Submission } from "./submissions";
describe("actual-page pricing policy", () => {
  it("reviews price even for unchanged or fewer pages", () => {
    expect(assessPageChange(160, 160).priceReviewRequired).toBe(true);
    expect(assessPageChange(160, 150)).toMatchObject({
      priceReviewRequired: true,
      difference: -10,
      increasedMoreThanTenPercent: false,
    });
  });
  it("does not treat ten percent as free extra pages or misclassify the exact boundary", () => {
    expect(assessPageChange(160, 176)).toMatchObject({
      priceReviewRequired: true,
      increasedMoreThanTenPercent: false,
    });
    expect(assessPageChange(160, 177).increasedMoreThanTenPercent).toBe(true);
    expect(assessPageChange(95, 104).increasedMoreThanTenPercent).toBe(false);
    expect(assessPageChange(95, 105).increasedMoreThanTenPercent).toBe(true);
  });
  it("calculates signed price differences but never initiates collection or refund", () => {
    expect(assessPriceSettlement(78800, 82000)).toEqual({
      differenceCents: 3200,
      action: "additional-payment",
      automaticCollection: false,
    });
    expect(assessPriceSettlement(78800, 74000)).toEqual({
      differenceCents: -4800,
      action: "credit",
      automaticCollection: false,
    });
    expect(assessPriceSettlement(78800, 78800).action).toBe("none");
  });
  it("rejects malformed counts and fractional cents", () => {
    for (const n of [0, -1, 1.5, NaN, Infinity])
      expect(() => assessPageChange(160, n)).toThrow();
    expect(() => assessPriceSettlement(100.5, 200)).toThrow();
  });
  it("binds the upfront price to explicit acceptance of this policy without claiming final page approval", () => {
    const p = createProject(),
      q = printQuote(p.production)!;
    const source: Submission = {
      receipt: {
        id: randomUUID(),
        status: "awaiting_review",
        totalCents: q.totalCents!,
        provisional: false,
        expires: Date.now() + 86400000,
      },
      customer: {
        name: "Test",
        email: "author@example.com",
        phone: "",
        address: "Test road",
        postal: "00100",
        city: "Helsinki",
      },
      project: p,
      projectId: randomUUID(),
      revision: 1,
      manuscript: "TEST",
      filename: "sisus.pdf",
      digest: "a".repeat(64),
      geometry: coverGeometry(p.production),
      quote: q,
      receivedAt: Date.now(),
      review: "required",
    };
    expect(() =>
      prepareInitialPrintQuote(source, {
        sourceDigest: source.digest,
        pagePolicyVersion: "old-policy",
        priceTermsAccepted: true,
      })
    ).toThrow("price-terms-required");
    expect(() =>
      prepareInitialPrintQuote(source, {
        sourceDigest: source.digest,
        pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
        priceTermsAccepted: false,
      })
    ).toThrow("price-terms-required");
    const quote = prepareInitialPrintQuote(source, {
      sourceDigest: source.digest,
      pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
      priceTermsAccepted: true,
    });
    expect(quote.provisional).toBe(true);
    expect(quote.totalCents).toBe(q.totalCents);
    expect(quote.pagePolicyVersion).toBe(PAGE_PRICE_POLICY_VERSION);
  });
});
