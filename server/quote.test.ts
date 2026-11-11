import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { readQuoteConfig, registerQuoteRoutes, syncQuoteToBrevo } from "./quote";
import { captureLeadSource, leadSourceLabel, parseLeadSource, readLeadSource } from "@shared/lead-source";

const input = { email: "testi@example.com", name: "Testi", package: "Printti", pages: "200", timeline: "1-3kk", source: "google / cpc / x" };

describe("hinta-arvio -> Brevo", () => {
  it("requires an explicit quote list id (never falls back to list 2)", () => {
    expect(readQuoteConfig({ BREVO_API_KEY: "k" } as NodeJS.ProcessEnv)).toBeNull();
    expect(readQuoteConfig({ BREVO_API_KEY: "k", BREVO_QUOTE_LIST_ID: "abc" } as NodeJS.ProcessEnv)).toBeNull();
    expect(readQuoteConfig({ BREVO_API_KEY: "k", BREVO_QUOTE_LIST_ID: "14" } as NodeJS.ProcessEnv)).toEqual({ apiKey: "k", listId: 14 });
  });

  it("adds the contact only to the quote list with source attributes", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    await syncQuoteToBrevo(input, { apiKey: "k", listId: 14 }, fetchImpl as unknown as typeof fetch, new Date("2026-11-20T10:00:00Z"));
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.listIds).toEqual([14]);
    expect(body.attributes).toMatchObject({ FIRSTNAME: "Testi", TARJOUS_LAHDE: "google / cpc / x", TARJOUS_PVM: "2026-11-20" });
  });

  it("retries without custom attributes when Brevo rejects them", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({ ok: false, status: 400 }).mockResolvedValueOnce({ ok: true, status: 204 });
    await syncQuoteToBrevo(input, { apiKey: "k", listId: 14 }, fetchImpl as unknown as typeof fetch);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).attributes).toEqual({ FIRSTNAME: "Testi" });
  });

  describe("route", () => {
    let server: Server;
    let base: string;
    beforeAll(async () => {
      const app = express();
      registerQuoteRoutes(app, { NODE_ENV: "test" } as NodeJS.ProcessEnv);
      server = await new Promise<Server>(r => { const l = app.listen(0, "127.0.0.1", () => r(l)); });
      const a = server.address();
      if (!a || typeof a === "string") throw new Error("no address");
      base = `http://127.0.0.1:${a.port}`;
    });
    afterAll(() => server.close());
    const send = (origin: string | null, body: unknown) =>
      fetch(`${base}/api/hinta-arvio`, { method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });

    it("rejects foreign origins", async () => {
      expect((await send("https://evil.example", input)).status).toBe(403);
      expect((await send(null, input)).status).toBe(403);
    });
    it("validates the email", async () => {
      expect((await send("http://localhost:3000", { email: "nope" })).status).toBe(400);
    });
    it("is a no-op until the Brevo list is configured", async () => {
      expect((await send("https://www.thunderkustannus.fi", input)).status).toBe(204);
    });
  });
});

describe("lead source", () => {
  it("keeps utm params and the first touch only", () => {
    const store = new Map<string, string>();
    const s = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    captureLeadSource("?utm_source=google&utm_medium=cpc&utm_campaign=thunder_omakustanne_hinta&gclid=abc", "/hinnat", s);
    captureLeadSource("?utm_source=facebook", "/", s);
    const src = readLeadSource(s);
    expect(src).toEqual({ utm_source: "google", utm_medium: "cpc", utm_campaign: "thunder_omakustanne_hinta", landing: "/hinnat" });
    expect(leadSourceLabel(src)).toBe("google / cpc / thunder_omakustanne_hinta");
  });
  it("labels visits without utm as direct/organic", () => {
    expect(parseLeadSource("?x=1", "/")).toBeNull();
    expect(leadSourceLabel(null)).toBe("suora / orgaaninen");
  });
});
