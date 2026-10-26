import { describe, it, expect } from "vitest";
import { createProject } from "../../client/src/lib/cover/model";
import {
  inspectCover,
  exportPressCover,
  projectFingerprint,
  type PressProfile,
} from "./prepress";
const profile: PressProfile = {
  id: "generic-proof-only",
  icc: "cmyk",
  conversionConfigured: false,
  maxInkPercent: 400,
  minimumImageDpi: 300,
};
function project() {
  const p = createProject();
  p.author = "Aino Kirjoittaja";
  p.back = "Tämä on kirjan takakansiteksti.";
  p.ink = "#ffffff";
  return p;
}
describe("cover prepress safeguards", () => {
  it("requires a configured CMYK conversion and user-confirmed final page count", async () => {
    const r = await inspectCover(project(), null);
    expect(r.report.errors.map(e => e.code)).toEqual(
      expect.arrayContaining(["profile", "interior"])
    );
    expect(r.report.status).toBe("blocked");
  });
  it("refuses export when CMYK conversion is not configured", async () => {
    const p = project();
    await expect(
      exportPressCover(p, profile, {
        interiorPageCount: p.production.pages,
        acknowledgedFingerprint: projectFingerprint(p),
      })
    ).rejects.toThrow("Painovienti estetty");
  });
  it("exports an approved cover as CMYK without requiring a printer-specific profile", async () => {
    const p = project();
    p.production.interior = "ready";
    const result = await exportPressCover(
      p,
      { ...profile, conversionConfigured: true },
      {
        interiorPageCount: p.production.pages,
        acknowledgedFingerprint: projectFingerprint(p),
      }
    );
    expect(result.proof).toBe(false);
    const pdf = result.pdf.toString("latin1");
    expect(pdf).toContain("/DeviceCMYK");
    expect(pdf).not.toContain("/DeviceRGB");
    expect(pdf).not.toContain("CMYK PROOF");
    expect(pdf).toContain("/FontFile2");
  }, 30000);
  it("changes the approval fingerprint whenever project content changes", () => {
    const p = project(),
      h = projectFingerprint(p);
    p.title += " uusi";
    expect(projectFingerprint(p)).not.toBe(h);
  });
  it("finds unsupported glyphs rather than exporting tofu", async () => {
    const p = project();
    p.title = "Kirja 🦄";
    expect(
      (await inspectCover(p, profile)).report.errors.some(
        e => e.code === "glyph"
      )
    ).toBe(true);
  });
  it("blocks title overflow and narrow spine text", async () => {
    const p = project();
    p.positions.title.x = 0.08;
    p.production.pages = 64;
    p.spine = "Oma kirja";
    const r = await inspectCover(p, profile);
    expect(r.report.errors.map(e => e.code)).toEqual(
      expect.arrayContaining(["narrow-spine", "text-placement"])
    );
  });
  it("never treats an untaitettu manuscript as a confirmed spine", async () => {
    const p = project();
    p.production.interior = "layout";
    expect(
      (
        await inspectCover(p, profile, {
          interiorPageCount: p.production.pages,
        })
      ).report.errors.some(e => e.code === "interior")
    ).toBe(true);
  });
  it("detects an unbroken title that exceeds the cover width", async () => {
    const p = project();
    p.title = "W".repeat(100);
    expect(
      (await inspectCover(p, profile)).report.errors.some(
        e => e.code === "text-placement"
      )
    ).toBe(true);
  });
  it("rejects copied placeholder text", async () => {
    const p = createProject();
    expect(
      (await inspectCover(p, profile)).report.errors.some(
        e => e.code === "placeholder"
      )
    ).toBe(true);
  });
  it("produces a separate CMYK proof with embedded fonts and a vector text stream", async () => {
    const p = project();
    const r = await exportPressCover(p, profile, {
      proof: true,
      interiorPageCount: p.production.pages,
    });
    expect(r.proof).toBe(true);
    expect(r.report.status).toBe("review");
    const s = r.pdf.toString("latin1");
    expect(s).toContain("/DeviceCMYK");
    expect(s).toContain("/FontFile2");
    expect(s).toContain("/TrimBox");
    expect(s).toContain("CMYK PROOF");
    expect(s).not.toContain("/DeviceRGB");
  }, 30000);
});
