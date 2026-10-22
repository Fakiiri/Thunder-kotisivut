import { analyticsAllowed } from "./purchase-analytics";
export function trackQuiz(
  event:
    | "quiz_start"
    | "quiz_step"
    | "quiz_complete"
    | "quiz_lead_saved"
    | "quiz_call_requested"
    | "quiz_booking_click"
    | "quiz_package_click"
    | "quiz_cta_click",
  values: Record<string, string | number> = {}
) {
  try {
    if (!analyticsAllowed(window.localStorage) || !window.gtag) return;
    // Call sites supply only fixed enums/numbers. Never include email, tokens or raw answers.
    window.gtag("event", event, {
      ...values,
      page_path: "/julkaisutesti",
      page_location: window.location.origin + "/julkaisutesti",
      transport_type: "beacon",
    });
  } catch {
    /* Consent storage / tracking must not affect the test. */
  }
}
