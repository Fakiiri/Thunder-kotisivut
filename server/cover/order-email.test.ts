import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CoverOrder from "../../client/src/components/cover/CoverOrder";
import { createProject } from "../../client/src/lib/cover/model";

describe("anonymous manuscript intake", () => {
  it("allows entering an address and offers verification without enabling an anonymous upload", () => {
    const html = renderToStaticMarkup(createElement(CoverOrder, {
      project: createProject(), intake: true,
      createPdf: async () => new Blob(), onInteriorChange: () => {},
      onRequestAccess: () => {},
    }));
    const email = html.match(/<input[^>]*name="private-order-email"[^>]*>/)?.[0];
    expect(email).toBeDefined();
    expect(email).not.toMatch(/readonly|disabled/i);
    expect(html).toContain("Jatka käyttölinkin pyytämiseen");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Lähetä aineisto tarkistettavaksi/);
  });
});
