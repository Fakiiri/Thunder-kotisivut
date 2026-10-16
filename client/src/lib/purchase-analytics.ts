import type { MouseEvent } from "react";

export type PurchasePlacement = "home_campaign" | "home_packages" | "pricing_packages" | "home_formats" |
  "home_printed" | "home_audio" | "home_ebook";
export type PurchaseClick = {
  packageId: string;
  placement: PurchasePlacement;
  checkout: boolean;
};

export function analyticsAllowed(storage: Pick<Storage, "getItem">): boolean {
  try {
    const consent = JSON.parse(storage.getItem("thunder_cookie_consent") || "null");
    return consent?.version === "1" && consent.analytics === true;
  } catch { return false; }
}

// No customer information, query strings or payment-session IDs go to Analytics.
// A click is never reported as a purchase. Only the paid webhook proves a sale.
export function trackPurchaseClick(event: MouseEvent<HTMLAnchorElement>, click: PurchaseClick) {
  try {
    if (!analyticsAllowed(window.localStorage) || !window.gtag) return;
    const anchor = event.currentTarget;
    const href = anchor.href;
    const sameTab = !event.defaultPrevented && event.button === 0 &&
      !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey &&
      (!anchor.target || anchor.target === "_self");
    let navigated = false;
    const navigate = () => {
      if (!sameTab || navigated) return;
      navigated = true;
      window.location.assign(href);
    };
    const parameters = {
      package_id: click.packageId,
      cta_location: click.placement,
      destination_type: click.checkout ? "stripe_checkout" : "enquiry",
      page_path: window.location.pathname,
      transport_type: "beacon",
    };
    window.gtag("event", "package_cta_click", parameters);
    if (click.checkout) {
      window.gtag("event", "begin_checkout", {
        ...parameters,
        items: [{ item_id: click.packageId, item_name: click.packageId, quantity: 1 }],
        event_callback: navigate,
        event_timeout: 350,
      });
      // Navigation still works when Analytics is blocked or fails to call back.
      if (sameTab) { event.preventDefault(); window.setTimeout(navigate, 400); }
    }
  } catch { /* Checkout must work even if consent storage or Analytics fails. */ }
}
