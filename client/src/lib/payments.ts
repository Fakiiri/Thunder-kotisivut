import { PUBLIC_PAYMENT_LINKS } from "../../../shared/payment-links";

const links: Record<string, string | undefined> = {
  digi: import.meta.env.VITE_STRIPE_DIGI_PAYMENT_LINK || PUBLIC_PAYMENT_LINKS.digi,
  printti: import.meta.env.VITE_STRIPE_PRINTTI_PAYMENT_LINK || PUBLIC_PAYMENT_LINKS.printti,
  premium: import.meta.env.VITE_STRIPE_PREMIUM_PAYMENT_LINK || PUBLIC_PAYMENT_LINKS.premium,
  printed: import.meta.env.VITE_STRIPE_PRINTED_PAYMENT_LINK,
  audio: import.meta.env.VITE_STRIPE_AUDIO_PAYMENT_LINK,
  ebook: import.meta.env.VITE_STRIPE_EBOOK_PAYMENT_LINK,
  joulu990: import.meta.env.VITE_STRIPE_JOULU990_PAYMENT_LINK || PUBLIC_PAYMENT_LINKS.joulu990,
};

export function paymentLinkFor(packageId: string): string | undefined {
  const value = links[packageId]?.trim();
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "buy.stripe.com" &&
      !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export const klarnaEnabled = import.meta.env.VITE_KLARNA_ENABLED !== "false";
