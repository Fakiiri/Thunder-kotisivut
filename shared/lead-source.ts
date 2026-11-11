// First-touch campaign source for a single browser session.
// Only UTM parameters and the landing path are kept; no click ids or personal data.
export const LEAD_SOURCE_KEY = "thunder_lead_source";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type LeadSource = Partial<Record<(typeof UTM_KEYS)[number], string>> & { landing?: string };

type Store = Pick<Storage, "getItem" | "setItem">;

export function parseLeadSource(search: string, pathname: string): LeadSource | null {
  const params = new URLSearchParams(search);
  const source: LeadSource = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().slice(0, 100);
    if (value) source[key] = value;
  }
  if (!source.utm_source) return null;
  source.landing = pathname.slice(0, 200);
  return source;
}

export function captureLeadSource(search: string, pathname: string, store: Store): void {
  try {
    if (store.getItem(LEAD_SOURCE_KEY)) return; // keep the first touch
    const source = parseLeadSource(search, pathname);
    if (source) store.setItem(LEAD_SOURCE_KEY, JSON.stringify(source));
  } catch {
    // Storage may be blocked; attribution is optional.
  }
}

export function readLeadSource(store: Pick<Storage, "getItem">): LeadSource | null {
  try {
    const raw = store.getItem(LEAD_SOURCE_KEY);
    return raw ? (JSON.parse(raw) as LeadSource) : null;
  } catch {
    return null;
  }
}

/** Short human-readable label, e.g. "google / cpc / thunder_omakustanne_hinta". */
export function leadSourceLabel(source: LeadSource | null): string {
  if (!source?.utm_source) return "suora / orgaaninen";
  return [source.utm_source, source.utm_medium, source.utm_campaign].filter(Boolean).join(" / ");
}
