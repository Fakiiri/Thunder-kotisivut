import { Link } from "wouter";
import { paymentLinkFor, klarnaEnabled } from "@/lib/payments";
import { useLang } from "@/contexts/LanguageContext";
import type { ReactNode } from "react";
import { trackPurchaseClick, type PurchasePlacement } from "@/lib/purchase-analytics";
import { isOrderPackageId, ORDER_PACKAGES } from "../../../shared/commerce";

export function KlarnaNote() {
  const { lang } = useLang();
  if (!klarnaEnabled || !["digi", "printti", "premium", "joulu990"].some(id => paymentLinkFor(id))) return null;
  return <p className="text-sm text-muted-foreground text-center mt-4">
    {lang === "en"
      ? "Pay in full or in instalments with Klarna. Your available payment options and terms are shown at checkout."
      : "Maksa kerralla tai osissa Klarnalla. Näet sinulle tarjolla olevat maksuvaihtoehdot ja niiden ehdot maksusivulla."}
  </p>;
}

export default function PackagePurchase({ packageId, className, children, placement, fallbackHref = "/tarjouspyynto" }: {
  packageId: string; className?: string; children: ReactNode;
  placement: PurchasePlacement; fallbackHref?: string;
}) {
  const { lang } = useLang();
  const href = paymentLinkFor(packageId);
  const label = isOrderPackageId(packageId) ? ORDER_PACKAGES[packageId].name : "paketti";
  return <>
    {href
      ? <a href={href} className={className} onClick={event => trackPurchaseClick(event, { packageId, placement, checkout: true })}>{lang === "en" ? "Order package" : `Tilaa ${label}`}</a>
      : <Link href={fallbackHref} className={className} onClick={event => trackPurchaseClick(event, { packageId, placement, checkout: false })}>{children}</Link>}
  </>;
}
