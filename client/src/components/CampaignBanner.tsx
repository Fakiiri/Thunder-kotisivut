import { Link } from "wouter";
import { useEffect, useState } from "react";
import { CAMPAIGN_END, campaignIsActive } from "../../../shared/campaign";
import { trackPurchaseClick } from "@/lib/purchase-analytics";
import { paymentLinkFor } from "@/lib/payments";
import { KLARNA_CONFIRMED_PACKAGES } from "../../../shared/payment-links";
import "./campaign-banner.css";

// Remove this component's import and <CampaignBanner /> from Home to remove the campaign.
export default function CampaignBanner() {
  const paymentLink = paymentLinkFor("joulu990");
  const [active, setActive] = useState(() => campaignIsActive());
  useEffect(() => {
    const timer = window.setTimeout(() => setActive(false), Math.max(0, CAMPAIGN_END - Date.now()));
    return () => window.clearTimeout(timer);
  }, []);
  if (!active) return null;
  return (
    <section className="tk-campaign" aria-labelledby="tk-campaign-title">
      <div className="tk-campaign__inner">
        <div className="tk-campaign__copy">
          <p className="tk-campaign__eyebrow">JOULUN JULKAISUKAMPANJA · VOIMASSA 25.10.2026 ASTI</p>
          <h2 id="tk-campaign-title">Sinun kirjasi.<br /><em>Joulumyyntiin.</em></h2>
          <p className="tk-campaign__lead">Anna käsikirjoituksellesi kirjan muoto. Tilaa 100 kirjan julkaisupaketti — me hoidamme kannen, taiton, painatuksen ja julkaisun verkkokauppoihin.</p>
          <ul className="tk-campaign__features">
            <li>100 kappaletta A5-kirjoja</li>
            <li>Alle 256 sivua</li>
            <li>Kannen ja sisäsivujen taitto</li>
            <li>Julkaisu verkkokauppoihin</li>
            <li>Kotiintoimitus</li>
          </ul>
          {paymentLink
            ? <a className="tk-campaign__cta" href={paymentLink} onClick={event => trackPurchaseClick(event, { packageId: "joulu990", placement: "home_campaign", checkout: true })}>Tilaa kirjasi nyt · 990 € <span aria-hidden="true">→</span></a>
            : <Link className="tk-campaign__cta" href="/tarjouspyynto">Kysy syyskampanjasta <span aria-hidden="true">→</span></Link>}
          {paymentLink && KLARNA_CONFIRMED_PACKAGES.includes("joulu990") && <p className="tk-campaign__note">Voit maksaa myös Klarnalla. Näet sinulle tarjolla olevat maksuvaihtoehdot maksusivulla.</p>}
          <p className="tk-campaign__note">Maksu turvallisesti Stripen kautta. Otamme yhteyttä yhden arkipäivän kuluessa. Julkaisuaikataulu sovitaan teoskohtaisesti.</p>
        </div>
        <div className="tk-campaign__offer">
          <div className="tk-campaign__book" aria-hidden="true"><span>SINUN<br />KIRJASI</span><small>THUNDER KUSTANNUS</small></div>
          <div className="tk-campaign__price"><span>KOKO PAKETTI VAIN</span><strong>990 <small>€</small></strong><span>sis. alv</span></div>
          <svg className="tk-campaign__mistletoe" aria-hidden="true" viewBox="0 0 100 110" fill="none"><path d="M50 100 C48 75 54 45 69 15 M51 74 C40 58 29 45 17 34" stroke="#b5c69b" strokeWidth="3" strokeLinecap="round"/><ellipse cx="67" cy="33" rx="8" ry="20" transform="rotate(28 67 33)" fill="#91ad7e"/><ellipse cx="46" cy="48" rx="8" ry="19" transform="rotate(-30 46 48)" fill="#769665"/><ellipse cx="74" cy="60" rx="8" ry="19" transform="rotate(52 74 60)" fill="#91ad7e"/><ellipse cx="26" cy="42" rx="7" ry="18" transform="rotate(-45 26 42)" fill="#91ad7e"/><ellipse cx="35" cy="67" rx="7" ry="17" transform="rotate(-54 35 67)" fill="#769665"/><circle cx="53" cy="65" r="5" fill="#fff8eb"/><circle cx="62" cy="71" r="5" fill="#fff8eb"/><circle cx="53" cy="77" r="5" fill="#fff8eb"/></svg>
        </div>
      </div>
    </section>
  );
}
