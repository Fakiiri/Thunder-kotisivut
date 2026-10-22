import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";
import {
  answersSchema,
  quizResult,
  QUIZ_VERSION,
  MARKETING_PERMISSION,
  type QuizAnswers,
} from "../../shared/publication-quiz";
import {
  followupAllowed,
  registerQuizRoutes,
  submitSchema,
  deliverQuizJob,
  readBookingURL,
} from "./index";
import { escapeHTML, quizMessage } from "./messages";
import { leadId, type Job, type QuizStore } from "./store";
import { trackQuiz } from "../../client/src/lib/quiz-analytics";
const answers: QuizAnswers = {
  genre: "fiction",
  readiness: "ready",
  goal: "sales",
  format: "digital",
  copies: "none",
  launch: "own",
  timeline: "soon",
  audio: "yes",
};
it("offers eight genre and audience directions independently of the package", () => {
  const results = (["fiction", "memoir", "children", "expert"] as const).flatMap(genre =>
    (["personal", "sales"] as const).map(goal => quizResult({ ...answers, genre, goal }))
  );
  expect(new Set(results.map(r => r.name)).size).toBe(8);
  expect(new Set(results.map(r => r.summary)).size).toBe(8);
  expect(results.every(r => r.profile === "digi")).toBe(true);
  expect(quizResult({ ...answers, genre: "family" }).direction).toBe("life-public");
});
const job: Job = {
  id: "job1",
  kind: "day2",
  key: "unique-key",
  attempts: 1,
  lead: {
    id: "lead1",
    email: "test@example.com",
    name: "Testi",
    answers,
    marketing: true,
    token: "a".repeat(64),
    source: "guide",
  },
};
const config = {
  apiKey: "fake-key",
  base: "https://www.thunderkustannus.fi",
  owner: "info@thunderkustannus.fi",
  sender: "info@thunderkustannus.fi",
  buyerList: 10,
};
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("publication guidance", () => {
  it("only accepts a secure Google booking URL", () => {
    expect(readBookingURL("https://calendar.app.google/example")).toBe(
      "https://calendar.app.google/example"
    );
    expect(readBookingURL("https://evil.example/redirect")).toBeNull();
    expect(readBookingURL("javascript:alert(1)")).toBeNull();
  });
  it("recommends formats without upselling by profession or large print run alone", () => {
    expect(quizResult(answers).profile).toBe("digi");
    expect(
      quizResult({ ...answers, genre: "expert", goal: "expert" }).profile
    ).toBe("digi");
    expect(
      quizResult({ ...answers, format: "print", copies: "many" }).profile
    ).toBe("printti");
    expect(quizResult({ ...answers, launch: "support" }).profile).toBe(
      "premium"
    );
  });
  it("never describes an unfinished or urgent manuscript as ready to buy", () => {
    const result = quizResult({
      ...answers,
      readiness: "idea",
      timeline: "urgent",
    });
    expect(result.ready).toBe(false);
    expect(result.steps.join(" ")).toContain("ei tarvitse ostaa vielä");
    expect(result.steps.join(" ")).toContain("ei voi luvata");
  });
  it("validates all eight questions and discloses unused audio and separate print quotes", () => {
    expect(answersSchema.safeParse({ ...answers, audio: "bad" }).success).toBe(
      false
    );
    expect(
      quizResult({ ...answers, copies: "many", audio: "no" }).notes
    ).toHaveLength(2);
  });
  it("accepts no marketing permission and normalizes email", () => {
    const parsed = submitSchema.parse({
      answers,
      email: " TEST@EXAMPLE.COM ",
      marketing: false,
      version: QUIZ_VERSION,
      requestKey: "a0c3aaf2-7a3c-41b2-899d-55b310f55ffe",
    });
    expect(parsed.email).toBe("test@example.com");
    expect(parsed.marketing).toBe(false);
    expect(MARKETING_PERMISSION).toContain("kaksi");
  });
  it("deduplicates the normalized email on one day", () => {
    expect(leadId("TEST@example.com", new Date("2026-10-21"))).toBe(
      leadId("test@example.com", new Date("2026-10-21"))
    );
    expect(leadId("test@example.com", new Date("2026-10-22"))).not.toBe(
      leadId("test@example.com", new Date("2026-10-21"))
    );
  });
});
describe("email safety", () => {
  it("escapes user input and includes working opt-out only for marketing", () => {
    expect(escapeHTML('<img src=x onerror="x">')).not.toContain("<img");
    const result = quizMessage({ ...job, kind: "result" }, config.base);
    expect(result.textContent).not.toContain("Peruuta testin");
    expect(quizMessage(job, config.base).textContent).toContain(
      `/unsubscribe/${job.lead.token}`
    );
    expect(quizMessage(job, config.base).textContent).not.toContain("taattu");
  });
  it("suppresses buyers, blocked contacts, opt-outs and call requests before sending", async () => {
    const suppressed = vi.fn().mockResolvedValue(false);
    const request = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ listIds: [10] })));
    vi.stubGlobal("fetch", request);
    expect(await followupAllowed(job, { suppressed }, config)).toBe(false);
    request.mockResolvedValue(
      new Response(JSON.stringify({ listIds: [], emailBlacklisted: true }))
    );
    expect(await followupAllowed(job, { suppressed }, config)).toBe(false);
    suppressed.mockResolvedValue(true);
    expect(await followupAllowed(job, { suppressed }, config)).toBe(false);
    suppressed.mockResolvedValue(false);
    expect(
      await followupAllowed(
        { ...job, lead: { ...job.lead, marketing: false } },
        { suppressed },
        config
      )
    ).toBe(false);
  });
  it("fails closed on provider lookup errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("unavailable", { status: 503 }))
    );
    await expect(
      followupAllowed(job, { suppressed: async () => false }, config)
    ).rejects.toThrow();
  });
  it("does not send a cancelled follow-up or override suppression with contact sync", async () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    const finish = vi.fn();
    const store = {
      suppressed: async () => true,
      finish,
    } as unknown as QuizStore;
    expect(await deliverQuizJob(job, store, config, [11, 12, 13, 14, 15])).toBe(
      false
    );
    expect(finish).toHaveBeenCalledWith(job, "cancelled");
    expect(request).not.toHaveBeenCalled();
  });
  it("reuses provider idempotency key on retries", async () => {
    const request = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", request);
    await deliverQuizJob(
      { ...job, kind: "result" },
      { suppressed: async () => false } as QuizStore,
      config,
      [11, 12, 13, 14, 15]
    );
    expect(
      JSON.parse(request.mock.calls[0][1].body).headers.idempotencyKey
    ).toBe(job.key);
  });
});
describe("public routes", () => {
  let server: Server;
  async function app(store: QuizStore | null,bookingURL:string|null=null) {
    const application = express();
    registerQuizRoutes(application, store,bookingURL);
    server = createServer(application);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    return `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  }
  afterEach(async () => {
    if (server)
      await new Promise<void>(resolve => server.close(() => resolve()));
  });
  const payload = {
    answers,
    email: "test@example.com",
    name: "Testi",
    marketing: false,
    version: QUIZ_VERSION,
    requestKey: "a0c3aaf2-7a3c-41b2-899d-55b310f55ffe",
  };
  const headers = { "Content-Type": "application/json", origin: config.base };
  it("pauses follow-ups before opening the verified calendar without claiming a reservation",async()=>{
    const pauseForCalendar=vi.fn();
    const bookingURL="https://calendar.app.google/verified-example";
    const base=await app({find:async()=>job.lead,pauseForCalendar} as unknown as QuizStore,bookingURL);
    const response=await fetch(base+"/api/quiz/calendar",{method:"POST",headers,body:JSON.stringify({token:job.lead.token})});
    expect(response.status).toBe(200);expect(await response.json()).toEqual({url:bookingURL});
    expect(pauseForCalendar).toHaveBeenCalledWith(job.lead);
  });
  it("reports unavailable service honestly without losing the local result", async () => {
    const base = await app(null);
    const response = await fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(503);
  });
  it("rejects a cross-origin submission and invalid answers before saving", async () => {
    const save = vi.fn();
    const base = await app({ save } as unknown as QuizStore);
    const response = await fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers: { ...headers, origin: "https://evil.example" },
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(403);
    expect(save).not.toHaveBeenCalled();
    const invalid = await fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, answers: {} }),
    });
    expect(invalid.status).toBe(400);
  });
  it("persists a lead and records the exact consent version", async () => {
    const save = vi.fn().mockResolvedValue({ token: job.lead.token });
    const base = await app({ save } as unknown as QuizStore);
    const response = await fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, marketing: true }),
    });
    expect(response.status).toBe(202);
    expect(save.mock.calls[0][1]).toContain(MARKETING_PERMISSION);
  });
  it("never reveals an existing token from email alone", async () => {
    const save = vi.fn().mockResolvedValue({ token: null });
    const base = await app({ save } as unknown as QuizStore);
    const response = await fetch(base + "/api/quiz/submit", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    expect(response.status).toBe(409);
    expect(await response.text()).not.toContain(job.lead.token);
  });
  it("GET scanners cannot unsubscribe; POST records the suppression", async () => {
    const suppress = vi.fn();
    const base = await app({
      find: async () => job.lead,
      suppress,
    } as unknown as QuizStore);
    expect(
      (await fetch(`${base}/api/quiz/unsubscribe/${job.lead.token}`)).status
    ).toBe(200);
    expect(suppress).not.toHaveBeenCalled();
    expect(
      (
        await fetch(`${base}/api/quiz/unsubscribe/${job.lead.token}`, {
          method: "POST",
        })
      ).status
    ).toBe(200);
    expect(suppress).toHaveBeenCalledWith(job.lead.email, "unsubscribe");
  });
});
describe("tracking", () => {
  it("does not track without consent; never passes a private fragment", () => {
    const gtag = vi.fn();
    const getItem = vi.fn().mockReturnValue(null);
    vi.stubGlobal("window", {
      gtag,
      localStorage: { getItem },
      location: { origin: config.base, hash: "#secret" },
    });
    trackQuiz("quiz_start");
    expect(gtag).not.toHaveBeenCalled();
    getItem.mockReturnValue(JSON.stringify({ version: "1", analytics: true }));
    trackQuiz("quiz_complete", { profile: "digi" });
    expect(gtag.mock.calls[0][2].page_location).toBe(
      config.base + "/julkaisutesti"
    );
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("secret");
  });
});
