export interface Guide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  content: string;
  publishDate?: string;
  metaTitle?: string;
  metaDescription?: string;
  ctaTitle?: string;
}

export function finnishDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map(type => parts.find(part => part.type === type)!.value)
    .join("-");
}

export function publishedGuides(
  guides: readonly Guide[],
  now = new Date()
): Guide[] {
  const today = finnishDate(now);
  return guides
    .filter(guide => (guide.publishDate || guide.date) <= today)
    .slice()
    .sort((a, b) =>
      (b.publishDate || b.date).localeCompare(a.publishDate || a.date)
    );
}
