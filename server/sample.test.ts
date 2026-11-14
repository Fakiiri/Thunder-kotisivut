import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { inspectSample, registerSampleRoutes, safeFilename, sampleSchema, sendSampleRequest } from "./sample";

// Pienin mahdollinen "docx": zip-otsake + word/document.xml -merkkijono.
const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("....word/document.xml....")]).toString("base64");
const input = {
  email: "kirjailija@example.com",
  name: "Raili",
  filename: "Luku 1.docx",
  file: docx,
  consent: true as const,
  website: "",
  elapsedMs: 15000,
  source: "google / cpc / x",
};

describe("ääninäyte", () => {
  it("accepts a real docx and rejects other files", () => {
    expect(inspectSample(sampleSchema.parse(input)).ok).toBe(true);
    const pdf = Buffer.from("%PDF-1.7 word/document.xml").toString("base64");
    expect(inspectSample(sampleSchema.parse({ ...input, file: pdf }))).toEqual({ ok: false, reason: "file" });
    const macro = Buffer.concat([Buffer.from(docx, "base64"), Buffer.from("vbaProject.bin")]).toString("base64");
    expect(inspectSample(sampleSchema.parse({ ...input, file: macro }))).toEqual({ ok: false, reason: "file" });
  });

  it("flags honeypot and too-fast submissions as spam", () => {
    expect(inspectSample(sampleSchema.parse({ ...input, website: "http://spam" }))).toEqual({ ok: false, reason: "spam" });
    expect(inspectSample(sampleSchema.parse({ ...input, elapsedMs: 500 }))).toEqual({ ok: false, reason: "spam" });
  });

  it("requires consent and a .docx name", () => {
    expect(sampleSchema.safeParse({ ...input, consent: false }).success).toBe(false);
    expect(sampleSchema.safeParse({ ...input, filename: "luku.pdf" }).success).toBe(false);
  });

  it("sanitises the attachment name", () => {
    expect(safeFilename("../../etc/pass<wd>.docx")).toBe(".._.._etc_pass_wd_.docx");
    expect(safeFilename(".docx")).toBe("naytesivu.docx");
  });

  it("emails the sample to Thunder with reply-to the author", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    await sendSampleRequest(sampleSchema.parse(input), Buffer.from(docx, "base64"), "k", fetchImpl as unknown as typeof fetch);
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body.to).toEqual([{ email: "info@thunderkustannus.fi" }]);
    expect(body.replyTo).toEqual({ email: "kirjailija@example.com", name: "Raili" });
    expect(body.attachment[0]).toEqual({ name: "Luku 1.docx", content: docx });
  });

  describe("route", () => {
    let server: Server;
    let base: string;
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    beforeAll(async () => {
      const app = express();
      registerSampleRoutes(app, { NODE_ENV: "test", BREVO_API_KEY: "k" } as NodeJS.ProcessEnv, fetchImpl as unknown as typeof fetch);
      server = await new Promise<Server>(r => {
        const l = app.listen(0, "127.0.0.1", () => r(l));
      });
      const a = server.address();
      if (!a || typeof a === "string") throw new Error("no address");
      base = `http://127.0.0.1:${a.port}`;
    });
    afterAll(() => server.close());
    const send = (origin: string | null, body: unknown) =>
      fetch(`${base}/api/aaninayte`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) },
        body: JSON.stringify(body),
      });

    it("rejects foreign origins", async () => {
      expect((await send("https://evil.example", input)).status).toBe(403);
      expect((await send(null, input)).status).toBe(403);
    });
    it("silently drops bots without sending mail", async () => {
      fetchImpl.mockClear();
      expect((await send("http://localhost:3000", { ...input, website: "x" })).status).toBe(204);
      expect(fetchImpl).not.toHaveBeenCalled();
    });
    it("rejects non-docx files", async () => {
      const res = await send("http://localhost:3000", { ...input, file: Buffer.from("hello world!").toString("base64") });
      expect(res.status).toBe(415);
    });
    it("sends a valid request", async () => {
      fetchImpl.mockClear();
      expect((await send("http://localhost:3000", input)).status).toBe(204);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
    });
    it("rate limits after five requests an hour", async () => {
      // Edelliset testit käyttivät jo osan kiintiöstä.
      let last = 0;
      for (let i = 0; i < 6; i++) last = (await send("http://localhost:3000", input)).status;
      expect(last).toBe(429);
    });
  });
});
