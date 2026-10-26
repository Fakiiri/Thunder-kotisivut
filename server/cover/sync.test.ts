import { describe, it, expect, vi } from "vitest";
import {
  journeyProjection,
  parseJourneyLists,
  type JourneyAudience,
} from "../../shared/cover-journey";
import {
  syncCoverContact,
  processCoverSyncBatch,
  type CoverSyncQueue,
} from "./sync";
const lists = { start: 21, ready: 22, personal: 23, buyers: 10 };
const base: JourneyAudience = {
  email: "reader@example.com",
  verified: true,
  marketing: true,
  ready: false,
  enrolledAt: 1,
  readyAt: null,
};
describe("Brevo cover journey stage projection", () => {
  it("joins only after verified consent and moves exclusively between stages", () => {
    expect(
      journeyProjection(
        { ...base, verified: false },
        { listIds: [] },
        lists,
        false
      ).add
    ).toEqual([]);
    expect(
      journeyProjection(
        { ...base, marketing: false },
        { listIds: [] },
        lists,
        false
      ).add
    ).toEqual([]);
    expect(journeyProjection(base, { listIds: [] }, lists, false).add).toEqual([
      21,
    ]);
    expect(
      journeyProjection(
        { ...base, ready: true },
        { listIds: [21, 999] },
        lists,
        false
      )
    ).toMatchObject({ add: [22], remove: [21] });
    expect(
      journeyProjection(
        { ...base, ready: true },
        { listIds: [22, 999] },
        lists,
        false
      )
    ).toMatchObject({ add: [], remove: [] });
  });
  it.each(["paid", "blocked", "personal", "buyer", "excluded"])(
    "stops %s without changing unrelated lists",
    kind => {
      const a = {
        ...base,
        email: kind === "excluded" ? "Opsicus@gmail.com" : base.email,
      };
      const c = {
        emailBlacklisted: kind === "blocked",
        listIds: [
          21,
          22,
          999,
          ...(kind === "personal" ? [23] : []),
          ...(kind === "buyer" ? [10] : []),
        ],
      };
      expect(journeyProjection(a, c, lists, kind === "paid")).toMatchObject({
        add: [],
        remove: [21, 22],
        stopped: true,
      });
    }
  );
  it("rejects accidental reuse of the buyer or personal list as an enrollment trigger", () => {
    expect(() => parseJourneyLists({ ...lists, start: 10 })).toThrow();
  });
  it("removes old membership before adding the new trigger, never transmits cover contents or resets blocklisting", async () => {
    const calls: { url: string; body: any }[] = [];
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({
        url,
        body: init?.body ? JSON.parse(String(init.body)) : null,
      });
      return calls.length === 1
        ? new Response(
            JSON.stringify({ listIds: [21, 999], emailBlacklisted: false })
          )
        : new Response(null, { status: 204 });
    });
    const queue = {
      hasPaidOrder: async () => false,
      finishSync: vi.fn(),
    } as unknown as CoverSyncQueue;
    const vault = {
      journeyAudience: async () => ({ ...base, ready: true }),
    } as any;
    await syncCoverContact(
      { owner: "hash", revision: 1, attempts: 1, lease: "test" },
      vault,
      queue,
      { apiKey: "fake", lists, request: request as any }
    );
    expect(calls.map(c => c.url)).toEqual([
      "https://api.brevo.com/v3/contacts/reader%40example.com",
      "https://api.brevo.com/v3/contacts/lists/21/contacts/remove",
      "https://api.brevo.com/v3/contacts",
    ]);
    expect(calls[2].body).toEqual({
      email: base.email,
      updateEnabled: true,
      listIds: [22],
    });
    expect(queue.finishSync).toHaveBeenCalledOnce();
  });
  it("does not mark a failed sync successful and retries transient provider failures", async () => {
    const job = { owner: "hash", revision: 1, attempts: 1, lease: "test" };
    const queue = {
      claimSync: vi.fn().mockResolvedValueOnce(job).mockResolvedValue(null),
      hasPaidOrder: async () => false,
      finishSync: vi.fn(),
      failSync: vi.fn(),
    } as any;
    await processCoverSyncBatch(
      { journeyAudience: async () => base } as any,
      queue,
      {
        apiKey: "fake",
        lists,
        request: async () => new Response(null, { status: 429 }),
      }
    );
    expect(queue.finishSync).not.toHaveBeenCalled();
    expect(queue.failSync).toHaveBeenCalledWith(job, false);
  });
});
