import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { coverClientIp } from "./client-ip";
const base = "https://www.thunderkustannus.fi";
const req = (host = "www.thunderkustannus.fi", ip: unknown = "203.0.113.7") =>
  ({ headers: { host, "x-real-ip": ip }, socket: { remoteAddress: "100.64.0.1" } }) as Request;
describe("Railway public-edge rate-limit identity", () => {
  it("keeps different public visitors out of one shared proxy bucket", () => {
    expect(coverClientIp(req(), base, "production")).toBe("203.0.113.7");
    expect(coverClientIp(req(undefined, "203.0.113.8"), base, "production")).toBe("203.0.113.8");
  });
  it("does not trust supplied headers outside Railway or on private hosts", () => {
    expect(coverClientIp(req(), base, "")).toBe("100.64.0.1");
    expect(coverClientIp(req("service.railway.internal"), base, "production")).toBe("100.64.0.1");
    expect(coverClientIp(req(), "http://www.thunderkustannus.fi", "production")).toBe("100.64.0.1");
  });
  it("rejects multiple, malformed and duplicate header values", () => {
    for (const bad of ["203.0.113.7, 203.0.113.8", "unknown", "", ["203.0.113.7"]])
      expect(coverClientIp(req(undefined, bad), base, "production")).toBe("100.64.0.1");
  });
});
