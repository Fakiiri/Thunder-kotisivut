import { leadSourceLabel, readLeadSource } from "../../../shared/lead-source";

/** ?source=ig-bio wins, otherwise the first-touch UTM label of this session. */
export function magnetSource(search: string, store: Pick<Storage, "getItem"> | null): string {
  const param = new URLSearchParams(search).get("source");
  if (param && /^[a-zA-Z0-9_-]{1,80}$/.test(param)) return param;
  return leadSourceLabel(store ? readLeadSource(store) : null);
}
