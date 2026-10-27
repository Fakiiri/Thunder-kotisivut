import { createHmac, timingSafeEqual } from "node:crypto";
import { isOrderPackageId, type OrderPackageId } from "../../shared/commerce";

export type PaidOrder = {
  sessionId: string;
  eventId: string;
  packageId: OrderPackageId;
  coverRequestId?: string;
  email: string;
  name: string;
  amountTotal: number;
  currency: "eur";
};
export type LinkRule = { packageId: OrderPackageId; amountCents: number };
export type PackageLists = Partial<Record<OrderPackageId, number>>;

export function readPackageLists(raw: string | undefined): PackageLists {
  const data = JSON.parse(raw || "{}");
  if (!data || Array.isArray(data) || typeof data !== "object")
    throw Error("Invalid package list mapping");
  for (const [id, list] of Object.entries(data)) {
    if (
      !isOrderPackageId(id) ||
      !Number.isSafeInteger(list) ||
      (list as number) <= 0
    )
      throw Error("Invalid package list ID");
  }
  return data;
}

export function readLinkRules(
  raw: string | undefined
): Record<string, LinkRule> {
  const data = JSON.parse(raw || "{}") as Record<string, LinkRule>;
  if (!data || Array.isArray(data) || typeof data !== "object")
    throw Error("Invalid payment link mapping");
  for (const [id, rule] of Object.entries(data)) {
    if (
      !/^plink_[A-Za-z0-9]+$/.test(id) ||
      !isOrderPackageId(rule?.packageId) ||
      rule.packageId === "painatus" ||
      !Number.isSafeInteger(rule.amountCents) ||
      rule.amountCents <= 0
    )
      throw Error("Invalid payment link rule");
  }
  return data;
}

export function verifyStripeSignature(
  raw: Buffer,
  signature: string,
  secret: string,
  nowSeconds = Date.now() / 1000
) {
  const fields = signature.split(",").map(item => item.split("=", 2));
  const timestamps = fields.filter(([key]) => key === "t");
  if (timestamps.length !== 1 || !/^\d+$/.test(timestamps[0][1] || ""))
    return false;
  const timestamp = Number(timestamps[0][1]);
  if (!Number.isFinite(timestamp) || Math.abs(nowSeconds - timestamp) > 300)
    return false;
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(raw)
    .digest();
  return fields.some(
    ([key, value]) =>
      key === "v1" &&
      /^[a-fA-F0-9]{64}$/.test(value || "") &&
      timingSafeEqual(digest, Buffer.from(value, "hex"))
  );
}

export function paidOrderFromEvent(
  event: any,
  rules: Record<string, LinkRule>,
  live: boolean
): PaidOrder | null {
  if (
    ![
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ].includes(event?.type)
  )
    return null;
  if (event.livemode !== live) throw Error("Stripe mode mismatch");
  const session = event.data?.object;
  if (!session || session.object !== "checkout.session")
    throw Error("Invalid Checkout Session");
  if (session.payment_status !== "paid") return null;
  const rule = rules[session.payment_link];
  // Other products in the same Stripe account are not fulfilled by this service.
  if (!rule) return null;
  const email = session.customer_details?.email || session.customer_email;
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)
  ) {
    throw Error("Paid order has no valid customer email");
  }
  if (
    !/^cs_[A-Za-z0-9_]+$/.test(session.id) ||
    !/^evt_[A-Za-z0-9]+$/.test(event.id) ||
    session.currency !== "eur" ||
    session.amount_total !== rule.amountCents ||
    session.mode !== "payment"
  ) {
    throw Error("Paid order does not match configured package");
  }
  return {
    sessionId: session.id,
    eventId: event.id,
    packageId: rule.packageId,
    email: email.toLowerCase(),
    name: String(session.customer_details?.name || "").slice(0, 200),
    amountTotal: session.amount_total,
    currency: "eur",
  };
}
