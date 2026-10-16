import { afterEach, describe, expect, it, vi } from "vitest";
import { analyticsAllowed, trackPurchaseClick } from "../client/src/lib/purchase-analytics";
import { campaignIsActive, CAMPAIGN_END } from "../shared/campaign";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("purchase click measurement", () => {
  function browser(consent = true) {
    const gtag = vi.fn();
    const assign = vi.fn();
    vi.stubGlobal("window", { gtag, location: { pathname: "/hinnat", assign },
      localStorage: { getItem: () => JSON.stringify({ version: "1", analytics: consent }) },
      setTimeout });
    return { gtag, assign };
  }
  function click(overrides = {}) {
    return { currentTarget: { href: "https://buy.stripe.com/example", target: "" },
      button: 0, defaultPrevented: false, preventDefault: vi.fn(), ...overrides } as any;
  }
  it("does not send clicks or delay checkout without analytics consent", () => {
    const { gtag } = browser(false);
    const event = click();
    trackPurchaseClick(event, { packageId: "joulu990", placement: "home_campaign", checkout: true });
    expect(gtag).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(analyticsAllowed({ getItem: () => "broken" })).toBe(false);
  });
  it("records the correct placement and starts checkout, then navigates once even if callbacks repeat", () => {
    vi.useFakeTimers();
    const { gtag, assign } = browser();
    const event = click();
    trackPurchaseClick(event, { packageId: "digi", placement: "pricing_packages", checkout: true });
    expect(gtag.mock.calls[0]).toEqual(["event", "package_cta_click", expect.objectContaining({
      package_id: "digi", cta_location: "pricing_packages", page_path: "/hinnat", destination_type: "stripe_checkout",
    })]);
    expect(gtag.mock.calls[1][1]).toBe("begin_checkout");
    gtag.mock.calls[1][2].event_callback();
    gtag.mock.calls[1][2].event_callback();
    vi.runAllTimers();
    expect(assign).toHaveBeenCalledOnce();
    expect(assign).toHaveBeenCalledWith("https://buy.stripe.com/example");
    expect(event.preventDefault).toHaveBeenCalledOnce();
  });
  it("never turns a missing payment link into checkout or a purchase", () => {
    const { gtag } = browser();
    const event = click();
    trackPurchaseClick(event, { packageId: "audio", placement: "home_formats", checkout: false });
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag.mock.calls[0][2].destination_type).toBe("enquiry");
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
  it("keeps modified clicks intact and still navigates if Google is blocked", () => {
    vi.useFakeTimers();
    const { assign } = browser();
    const modified = click({ ctrlKey: true });
    trackPurchaseClick(modified, { packageId: "digi", placement: "home_packages", checkout: true });
    expect(modified.preventDefault).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(assign).not.toHaveBeenCalled();
    trackPurchaseClick(click(), { packageId: "digi", placement: "home_packages", checkout: true });
    vi.advanceTimersByTime(400);
    expect(assign).toHaveBeenCalledOnce();
  });
});

it("hides the campaign at midnight 26 October Finnish winter time", () => {
  expect(campaignIsActive(Date.parse("2026-10-25T23:59:59+02:00"))).toBe(true);
  expect(campaignIsActive(CAMPAIGN_END)).toBe(false);
  expect(new Date(CAMPAIGN_END).toISOString()).toBe("2026-10-25T22:00:00.000Z");
});
