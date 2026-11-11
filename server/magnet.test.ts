import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { magnetSchema, readMagnetLists, registerMagnetRoutes, syncMagnetToBrevo } from "./magnet";
import { MAGNETS } from "@shared/magnets";
import { magnetSource } from "../client/src/lib/magnet-source";
import { linkitSource } from "../client/src/pages/Linkit";

const ok = { magnet: "kurssi", email: "testi@example.com", name: "Testi", consent: true, source: "ig-bio" };
const lists = { kurssi: 25, muistelma: 26, naytekirja: 27 };

describe("liidimagneetit", () => {
  it("has the three pages from card 002", () => {
    expect(Object.values(MAGNETS).map(m => m.path)).toEqual(["/kirjasi-5-paivassa", "/muistelman-aloitus", "/naytekirja"]);
    expect(MAGNETS.naytekirja.lane).toBe("kaista-1");
  });

  it("requires marketing consent and a first name", () => {
    expect(magnetSchema.safeParse(ok).success).toBe(true);
    expect(magnetSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
    expect(magnetSchema.safeParse({ ...ok, name: "" }).success).toBe(false);
    expect(magnetSchema.safeParse({ ...ok, website: "spam" }).success).toBe(false);
  });

  it("needs a list id for every magnet", () => {
    expect(readMagnetLists(undefined)).toBeNull();
    expect(readMagnetLists('{"kurssi":25}')).toBeNull();
    expect(readMagnetLists("nope")).toBeNull();
    expect(readMagnetLists(JSON.stringify(lists))).toEqual(lists);
  });

  it("puts the contact only on its own magnet list with lane and source", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    await syncMagnetToBrevo(magnetSchema.parse({ ...ok, magnet: "naytekirja" }), { apiKey: "k", lists },
      fetchImpl as unknown as typeof fetch, new Date("2026-11-23T10:00:00Z"));
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.listIds).toEqual([27]);
    expect(body.attributes).toEqual({ FIRSTNAME: "Testi", MAGNEETTI: "naytekirja", KAISTA: "kaista-1",
      MAGNEETTI_LAHDE: "ig-bio", MARKKINOINTILUPA_PVM: "2026-11-23" });
  });

  it("retries with the name only when Brevo rejects attributes", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({ ok: false, status: 400 }).mockResolvedValueOnce({ ok: true, status: 204 });
    await syncMagnetToBrevo(magnetSchema.parse(ok), { apiKey: "k", lists }, fetchImpl as unknown as typeof fetch);
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body).attributes).toEqual({ FIRSTNAME: "Testi" });
  });

  it("reads source from ?source= or the session UTM", () => {
    expect(magnetSource("?source=ig-bio", null)).toBe("ig-bio");
    expect(magnetSource("?source=<x>", null)).toBe("suora / orgaaninen");
    const store = { getItem: () => JSON.stringify({ utm_source: "facebook", utm_medium: "paid", utm_campaign: "k2" }) };
    expect(magnetSource("", store)).toBe("facebook / paid / k2");
    expect(linkitSource("?source=fb-bio")).toBe("fb-bio");
    expect(linkitSource("")).toBe("ig-bio");
  });

  describe("route", () => {
    let server: Server;
    let base: string;
    beforeAll(async () => {
      const app = express();
      registerMagnetRoutes(app, { NODE_ENV: "test" } as NodeJS.ProcessEnv);
      server = await new Promise<Server>(r => { const l = app.listen(0, "127.0.0.1", () => r(l)); });
      const a = server.address();
      if (!a || typeof a === "string") throw new Error("no address");
      base = `http://127.0.0.1:${a.port}`;
    });
    afterAll(() => server.close());
    const send = (origin: string | null, body: unknown) =>
      fetch(`${base}/api/magneetti`, { method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });

    it("rejects foreign origins", async () => {
      expect((await send("https://evil.example", ok)).status).toBe(403);
    });
    it("rejects missing consent", async () => {
      expect((await send("http://localhost:3000", { ...ok, consent: false })).status).toBe(400);
    });
    it("says 503 until the Brevo lists are configured", async () => {
      expect((await send("https://www.thunderkustannus.fi", ok)).status).toBe(503);
    });
  });
});
