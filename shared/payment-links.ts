// Public checkout configuration. Never add Stripe secrets here.
export const PUBLIC_PAYMENT_LINKS = {
  digi: "https://buy.stripe.com/4gM28rg8f9pr7wL9SP8g001",
  printti: "https://buy.stripe.com/eVqcN5e078ln04j5Cz8g002",
  premium: "https://buy.stripe.com/bJe8wPg8f0SVbN18OL8g003",
  joulu990: "https://buy.stripe.com/00w4gz4px0SV4kz7KH8g000",
};

// Santeri confirmed Klarna on the campaign and Printti checkout pages.
export const KLARNA_CONFIRMED_PACKAGES = ["joulu990", "printti"] as const;
