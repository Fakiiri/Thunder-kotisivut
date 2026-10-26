import { describe, expect, it } from "vitest";
import {
  templates,
  createProject,
  applyTemplate,
  projectSchema,
  cropImage,
  contrast,
  coverWidth,
  safeFilename,
} from "../client/src/lib/cover/model";
import {
  wrapLines,
  renderCover,
  coverWarnings,
} from "../client/src/lib/cover/render";
import { readImage } from "../client/src/lib/cover/storage";

describe("cover project boundary", () => {
  it("accepts all eight original templates and JSON round trips", () => {
    expect(templates).toHaveLength(8);
    for (const t of templates) {
      const p = createProject(t.id);
      expect(projectSchema.parse(JSON.parse(JSON.stringify(p)))).toEqual(p);
    }
  });
  it("rejects remote images, SVG and out-of-bounds or oversized input", () => {
    const p = createProject();
    expect(
      projectSchema.safeParse({
        ...p,
        image: {
          data: "https://evil.example/tracking.png",
          width: 100,
          height: 100,
        },
      }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...p,
        image: {
          data: "data:image/svg+xml;base64,AAAA",
          width: 100,
          height: 100,
        },
      }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...p, title: "x".repeat(121) }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({ ...p, bg: "url(https://evil.example)" }).success
    ).toBe(false);
    expect(
      projectSchema.safeParse({
        ...p,
        positions: {
          ...p.positions,
          title: { ...p.positions.title, x: Infinity },
        },
      }).success
    ).toBe(false);
    expect(projectSchema.safeParse({ ...p, version: 2 }).success).toBe(false);
  });
  it("preserves personal content when choosing another layout", () => {
    const p = {
      ...createProject(),
      title: "Minun tarinani",
      back: "Oma esittely",
      author: "Åsa Ääkkönen",
    };
    const next = applyTemplate(p, "children");
    expect(next.title).toBe(p.title);
    expect(next.back).toBe(p.back);
    expect(next.author).toBe(p.author);
    expect(next.template).toBe("children");
    expect(next.bg).not.toBe(p.bg);
  });
  it("never allows filenames to escape their download basename", () => {
    expect(safeFilename("../../Ääni: <script> / 😀")).toBe("Ääni-script-");
    expect(safeFilename("")).toBe("kirjan-kansi");
  });
});
describe("cover geometry and quality", () => {
  it("covers the full image area and respects crop and zoom limits", () => {
    const r = cropImage(1600, 900, 600, 852, {
      zoom: 1,
      x: 50,
      y: 50,
      shade: 0,
    });
    expect(r.width).toBeGreaterThanOrEqual(600);
    expect(r.height).toBeGreaterThanOrEqual(852);
    expect(r.x).toBeLessThan(0);
    expect(r.y).toBeCloseTo(0);
    const z = cropImage(1600, 900, 600, 852, {
      zoom: 2,
      x: 100,
      y: 0,
      shade: 0,
    });
    expect(z.x + z.width).toBeCloseTo(600);
    expect(z.y).toBeCloseTo(0);
    expect(coverWidth("spread")).toBeCloseTo((315 * 600) / 148);
    expect(coverWidth("front")).toBeCloseTo((158 * 600) / 148);
  });
  it("keeps explicit paragraphs and wraps unbroken long titles", () => {
    const ctx = {
      measureText: (s: string) => ({ width: Array.from(s).length * 10 }),
    };
    expect(wrapLines(ctx as any, "ABCD\n\nEF", 20)).toEqual([
      "AB",
      "CD",
      "",
      "EF",
    ]);
    expect(wrapLines(ctx as any, "Suuri pieni kirja", 60)).toEqual([
      "Suuri",
      "pieni",
      "kirja",
    ]);
  });
  it("warns about unreadable colors and excessive title placement", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21);
    const p = {
      ...createProject(),
      bg: "#ffffff",
      ink: "#ffffff",
      author: "Tekijä",
    };
    expect(coverWarnings(p, []).join(" ")).toContain("kontrasti");
    expect(
      coverWarnings(p, [
        {
          key: "title",
          x: 500,
          y: 800,
          width: 100,
          height: 100,
          overflow: true,
        },
      ]).join(" ")
    ).toContain("turva-alue");
  });
  it("reports actual overflowing and overlapping text from renderer layout", () => {
    const ctx = new Proxy(
      { measureText: (s: string) => ({ width: Array.from(s).length * 20 }) },
      {
        get: (target, key) => (key in target ? (target as any)[key] : () => {}),
        set: (target, key, value) => {
          (target as any)[key] = value;
          return true;
        },
      }
    );
    const canvas = {
      width: 600,
      getContext: () => ctx,
    } as unknown as HTMLCanvasElement;
    const p = createProject();
    p.title = "X".repeat(100);
    p.positions.title.y = 0.8;
    p.subtitle = "Alaotsikko";
    p.positions.subtitle.y = p.positions.title.y;
    const boxes = renderCover(canvas, p, "front");
    expect(boxes.find(b => b.key === "title")?.overflow).toBe(true);
    expect(coverWarnings(p, boxes).some(w => w.includes("päällekkäin"))).toBe(
      true
    );
  });
});
describe("image intake before decoding", () => {
  it("rejects malicious/unsupported signatures and large files", async () => {
    await expect(
      readImage(
        new Blob(["<svg onload='alert(1)'></svg>"], { type: "image/png" })
      )
    ).rejects.toThrow("JPG- tai PNG");
    await expect(
      readImage(new Blob([new Uint8Array(12 * 1024 * 1024 + 1)]))
    ).rejects.toThrow("liian suuri");
  });
  it("rejects decompression-sized PNG dimensions before browser decode", async () => {
    const bytes = new Uint8Array(24);
    bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
    const view = new DataView(bytes.buffer);
    view.setUint32(16, 100_000);
    view.setUint32(20, 100_000);
    await expect(readImage(new Blob([bytes]))).rejects.toThrow("mitat");
  });
});

import {
  DEFAULT_PRODUCTION,
  coverGeometry,
  printQuote,
  productionSchema,
  normalizeProduction,
} from "../shared/print-production";
import { SOFTCOVER_PRICING, QUANTITIES } from "../shared/print-pricing-data";
import { coverPdf } from "../client/src/lib/cover/pdf";
import {
  inspectManuscript,
  orderCustomerSchema,
  orderSummary,
} from "../client/src/lib/cover/order";
describe("one print production source", () => {
  it("uses the exact tariff spine and 5 mm on all outside edges for every supported book", () => {
    for (const entry of SOFTCOVER_PRICING) {
      const p = {
        ...DEFAULT_PRODUCTION,
        format: entry.format,
        paper: entry.paper,
        pages: entry.pages,
      };
      const g = coverGeometry(p);
      const [w, h] = entry.format.split("x").map(Number);
      expect(g.spineMm).toBe(entry.spine_mm ?? 0);
      expect(g.sheetWidthMm).toBe(2 * w + (entry.spine_mm ?? 0) + 10);
      expect(g.sheetHeightMm).toBe(h + 10);
      expect(g.frontX).toBe(5 + w + (entry.spine_mm ?? 0));
      expect(g.bleedMm).toBe(5);
    }
  });
  it("adds shipping once and the 217 euro layout only when selected", () => {
    const p = { ...DEFAULT_PRODUCTION };
    const q = printQuote(p)!;
    expect(q.printCents).toBe(73800);
    expect(q.totalCents).toBe(78800);
    const layout = printQuote({ ...p, interior: "layout" })!;
    expect(layout.layoutCents).toBe(21700);
    expect(layout.totalCents).toBe(q.totalCents! + 21700);
    for (const entry of SOFTCOVER_PRICING)
      for (const quantity of QUANTITIES) {
        const quote = printQuote({
          ...p,
          format: entry.format,
          paper: entry.paper,
          pages: entry.pages,
          quantity,
        })!;
        expect(quote.printCents).toBe(
          Math.round((entry.prices as Record<string, number>)[quantity] * 100) *
            quantity
        );
      }
  });
  it("rejects unquoted page counts and quantities over 200 instead of inventing prices or spine widths", () => {
    expect(
      productionSchema.safeParse({ ...DEFAULT_PRODUCTION, pages: 161 }).success
    ).toBe(false);
    expect(
      productionSchema.safeParse({ ...DEFAULT_PRODUCTION, quantity: 201 })
        .success
    ).toBe(false);
    expect(printQuote({ ...DEFAULT_PRODUCTION, quantity: 500 })).toBeNull();
    expect(() =>
      coverGeometry({ ...DEFAULT_PRODUCTION, pages: 161 })
    ).toThrow();
    const p = normalizeProduction(
      { ...DEFAULT_PRODUCTION, pages: 64 },
      { paper: "120g Standard" }
    );
    expect(productionSchema.safeParse(p).success).toBe(true);
  });
  it("migrates legacy drafts and preserves production info when the cover template changes", () => {
    const p = createProject();
    const legacy: any = { ...p };
    delete legacy.production;
    delete legacy.spine;
    delete legacy.positions.spine;
    const migrated = projectSchema.parse(legacy);
    expect(migrated.production).toEqual(DEFAULT_PRODUCTION);
    expect(migrated.spine).toBe("");
    p.production = { ...DEFAULT_PRODUCTION, pages: 320 };
    p.spine = "OMA KIRJA";
    const next = applyTemplate(p, "expert");
    expect(next.production).toEqual(p.production);
    expect(next.spine).toBe(p.spine);
  });
  it("creates a dimensioned PDF with bleed and trim boxes and correct xref byte offsets", async () => {
    const text = await coverPdf(
      new Uint8Array([255, 216, 255, 217]),
      3720,
      2598,
      DEFAULT_PRODUCTION
    ).text();
    expect(text).toContain("/TrimBox [14.173228346456694 14.173228346456694");
    expect(text).toContain("/BleedBox [0 0");
    const media = text.match(/\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/)!;
    expect((Number(media[1]) * 25.4) / 72).toBeCloseTo(315);
    expect((Number(media[2]) * 25.4) / 72).toBeCloseTo(220);
    const xref = Number(text.match(/startxref\n(\d+)/)![1]);
    expect(text.slice(xref, xref + 4)).toBe("xref");
  });
});
describe("local order attachment boundary", () => {
  it("rejects active PDFs and file-extension tricks without contacting a server", async () => {
    await expect(
      inspectManuscript(new File(["%PDF-1.4\n/JavaScript\n%%EOF"], "test.pdf"))
    ).rejects.toThrow();
    await expect(
      inspectManuscript(new File(["<script>hello</script>"], "test.pdf"))
    ).rejects.toThrow();
    await expect(
      inspectManuscript(new File(["%PDF-1.4\n%%EOF"], "test.exe"))
    ).rejects.toThrow();
    await expect(
      inspectManuscript(
        new File([new Uint8Array(8 * 1024 * 1024 + 1)], "test.pdf")
      )
    ).rejects.toThrow("8 Mt");
  });
  it("validates delivery details and lists the complete price and production in the owner draft", () => {
    const customer = {
      name: "Testi Asiakas",
      email: "customer@example.com",
      phone: "",
      address: "Testikatu 1",
      postal: "00100",
      city: "Helsinki",
    };
    expect(orderCustomerSchema.safeParse(customer).success).toBe(true);
    expect(
      orderCustomerSchema.safeParse({ ...customer, postal: "1" }).success
    ).toBe(false);
    const text = orderSummary(createProject(), customer, true);
    expect(text).toContain("50,00 €");
    expect(text).toContain("788,00 €");
    expect(text).toContain("315 × 220 mm");
    expect(text).toContain("ei lähetetty");
  });
});

describe("printer-derived spine and bleed safeguards", () => {
  function canvas() {
    const images: number[][] = [];
    const ctx = new Proxy(
      {
        measureText: (s: string) => ({ width: s.length * 8 }),
        drawImage: (...args: any[]) => images.push(args.slice(1)),
      },
      {
        get: (t, k) => (k in t ? (t as any)[k] : () => {}),
        set: (t, k, v) => {
          (t as any)[k] = v;
          return true;
        },
      }
    );
    return {
      images,
      element: {
        width: 1200,
        getContext: () => ctx,
      } as unknown as HTMLCanvasElement,
    };
  }
  it("omits narrow spine text, retaining the editable text and warning", () => {
    const p = createProject();
    p.spine = "Oma kirja";
    p.production = { ...p.production, paper: "80g Standard", pages: 64 };
    const c = canvas();
    expect(
      renderCover(c.element, p, "spread").some(b => b.key === "spine")
    ).toBe(false);
    expect(coverWarnings(p, []).join(" ")).toContain("alle 6 mm");
    expect(p.spine).toBe("Oma kirja");
  });
  it("checks the 1.5 mm spine inset at the real physical scale", () => {
    const p = createProject();
    p.spine = "Kirja";
    p.positions.spine = { x: 0.5, y: 0.5, align: "center", size: 25 };
    const c = canvas();
    // 9 mm spine at A5: 25 logical px fits a 1 mm inset but exceeds a 1.5 mm inset.
    expect(
      renderCover(c.element, p, "spread").find(b => b.key === "spine")?.overflow
    ).toBe(true);
    p.positions.spine.size = 14;
    expect(
      renderCover(c.element, p, "spread").find(b => b.key === "spine")?.overflow
    ).toBe(false);
  });
  it("extends the original photograph into bleed without stretching edge pixels", () => {
    const p = createProject(),
      c = canvas();
    renderCover(c.element, p, "spread", {
      image: { naturalWidth: 2000, naturalHeight: 3000 } as HTMLImageElement,
    });
    expect(c.images).toHaveLength(1);
    expect(c.images[0][0]).toBeLessThan(0);
    expect(c.images[0][1]).toBeLessThan(0);
    expect(c.images[0][2]).toBeGreaterThan(600);
  });
});

import { coverRequestMessage, coverRequestURL } from "../shared/cover-request";
describe("public cover quote handoff", () => {
  it("passes only validated production options, not private cover contents", () => {
    const p = {
      ...createProject(),
      title: "Private title",
      back: "Private back",
    };
    const url = coverRequestURL(p.production);
    expect(url).not.toContain("Private");
    const message = coverRequestMessage(
      new URL(url, "https://example.com").search
    );
    expect(message).toContain("148 × 210");
    expect(message).toContain("100 kpl");
    expect(message).toContain("788,00");
  });
  it("ignores tampered prices, unknown formats and non-cover requests", () => {
    expect(
      coverRequestMessage(
        "?source=kansisuunnittelija&format=evil&pages=999&quantity=100"
      )
    ).toBe("");
    expect(coverRequestMessage("?source=other")).toBe("");
    const search = new URL(
      coverRequestURL(createProject().production),
      "https://example.com"
    ).search;
    expect(coverRequestMessage(search + "&total=1")).not.toContain("1,00");
  });
});
