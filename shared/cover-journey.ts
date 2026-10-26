export const COVER_JOURNEY_VERSION = "cover-v1";
export const COVER_EXCLUDED_EMAILS = [
  "opsicus@gmail.com",
  "kaarlo.kuosmanen@gmail.com",
  "haka.kekalainen@gmail.com",
  "utunen77@gmail.com",
] as const;
export type JourneyAudience = {
  email: string;
  verified: boolean;
  marketing: boolean;
  ready: boolean;
  enrolledAt: number;
  readyAt: number | null;
};
export type JourneyLists = {
  start: number;
  ready: number;
  personal: number;
  buyers: number;
};
export type BrevoContact = { emailBlacklisted?: boolean; listIds?: number[] };
export function parseJourneyLists(input: unknown): JourneyLists {
  const v = input as JourneyLists;
  if (
    !v ||
    !["start", "ready", "personal", "buyers"].every(
      k =>
        Number.isSafeInteger(v[k as keyof JourneyLists]) &&
        v[k as keyof JourneyLists] > 0
    ) ||
    new Set(Object.values(v)).size !== 4
  )
    throw Error("Invalid cover list mapping");
  return v;
}
export function journeyProjection(
  a: JourneyAudience,
  contact: BrevoContact,
  lists: JourneyLists,
  paid: boolean
) {
  const current = contact.listIds || [];
  const excluded = (COVER_EXCLUDED_EMAILS as readonly string[]).includes(
    a.email.trim().toLowerCase()
  );
  const stopped =
    excluded ||
    paid ||
    !!contact.emailBlacklisted ||
    current.includes(lists.buyers) ||
    current.includes(lists.personal);
  const desired =
    a.verified && a.marketing && !stopped
      ? a.ready
        ? lists.ready
        : lists.start
      : null;
  return {
    add: desired && !current.includes(desired) ? [desired] : [],
    remove: [lists.start, lists.ready].filter(
      id => id !== desired && current.includes(id)
    ),
    stopped,
  };
}
export const COVER_JOURNEY_FLOWS = [
  {
    key: "start",
    name: "Kansistudio 1 – tervetuloa ja apu",
    steps: [
      { touch: "welcome", delayDays: 0 },
      { touch: "unfinished", delayDays: 3 },
      { touch: "offer", delayDays: 4 },
    ],
  },
  {
    key: "ready",
    name: "Kansistudio 2 – valmis kansi",
    steps: [
      { touch: "ready", delayDays: 1 },
      { touch: "offer", delayDays: 6 },
    ],
  },
] as const;
