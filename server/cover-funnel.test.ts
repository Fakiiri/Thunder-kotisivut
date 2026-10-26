import { describe, it, expect } from "vitest";
import {
  COVER_TOUCHES,
  coverTouchDraft,
  nextCoverTouch,
  type CoverAudience,
} from "../shared/cover-funnel";
const DAY = 86400000,
  now = Date.UTC(2026, 9, 26),
  base: CoverAudience = {
    verified: true,
    marketing: true,
    unsubscribed: false,
    blocked: false,
    purchased: false,
    inPersonalService: false,
    suppressionKnown: true,
    otherSequenceActive: false,
    enrolledAt: now - 20 * DAY,
    lastMarketingAt: null,
    delivered: [],
  };
describe("draft cover funnel policy", () => {
  it.each([
    "unsubscribed",
    "blocked",
    "purchased",
    "inPersonalService",
    "otherSequenceActive",
  ] as const)("stops %s before the next message", key => {
    expect(nextCoverTouch({ ...base, [key]: true }, now).touch).toBeNull();
  });
  it.each(["verified", "marketing", "suppressionKnown"] as const)(
    "requires %s rather than assuming consent or successful checks",
    key => {
      expect(nextCoverTouch({ ...base, [key]: false }, now).touch).toBeNull();
    }
  );
  it("does not catch up old messages in a burst", () => {
    const a = {
      ...base,
      delivered: ["welcome"],
      lastMarketingAt: now - 60_000,
    };
    expect(nextCoverTouch(a, now).touch).toBeNull();
    expect(
      nextCoverTouch({ ...a, lastMarketingAt: now - DAY }, now).touch?.id
    ).toBe("unfinished");
  });
  it("keeps the next unsent message in order and ends after the eligible branch", () => {
    expect(
      nextCoverTouch({ ...base, delivered: COVER_TOUCHES.map(t => t.id) }, now)
        .touch
    ).toBeNull();
    expect(nextCoverTouch({ ...base, enrolledAt: now }, now).touch?.id).toBe(
      "welcome"
    );
    expect(
      nextCoverTouch({ ...base, enrolledAt: now, delivered: ["welcome"] }, now)
        .touch
    ).toBeNull();
  });
  it("rejects invalid times and creates a useful draft for every touch", () => {
    expect(nextCoverTouch({ ...base, enrolledAt: NaN }, now).touch).toBeNull();
    for (const t of COVER_TOUCHES) {
      const d = coverTouchDraft(t.id);
      expect(d.body.length).toBeGreaterThan(100);
      expect(d.cta.length).toBeGreaterThan(5);
    }
  });
});
