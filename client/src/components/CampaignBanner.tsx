import { Link } from "wouter";
import "./campaign-banner.css";

// Remove this component's import and <CampaignBanner /> from Home to remove the campaign.
export default function CampaignBanner() {
  // Campaign ends at midnight Finnish time, after 15 October 2026.
  if (Date.now() >= Date.parse("2026-10-16T00:00:00+03:00")) return null;
  return (
    <section className="tk-campaign" aria-labelledby="tk-campaign-title">
      <div className="tk-campaign__inner">
        <div className="tk-campaign__copy">
          <p className="tk-campaign__eyebrow">SYYSKAMPANJA · VOIMASSA 15.10.2026 ASTI</p>
          <h2 id="tk-campaign-title">Sinun kirjasi.<br /><em>Joulumyyntiin.</em></h2>
          <p className="tk-campaign__lead">Joulu on kirjamyynnin vilkkainta aikaa. Haluatko oman kirjasi mukaan? Ota yhteyttä nyt.</p>
          <ul className="tk-campaign__features">
            <li>100 kappaletta A5-kirjoja</li>
            <li>Alle 256 sivua</li>
            <li>Kannen ja sisäsivujen taitto</li>
            <li>Julkaisu verkkokauppoihin</li>
            <li>Kotiintoimitus</li>
          </ul>
          <Link className="tk-campaign__cta" href="https://www.thunderkustannus.fi/tarjouspyynto">Kysy syyskampanjasta <span aria-hidden="true">→</span></Link>
          <p className="tk-campaign__note">Julkaisuaikataulu sovitaan teoskohtaisesti.</p>
        </div>
        <div className="tk-campaign__offer">
          <div className="tk-campaign__book" aria-hidden="true"><span>OMA<br />KIRJASI</span><small>THUNDER KUSTANNUS</small></div>
          <div className="tk-campaign__price"><span>KOKO PAKETTI VAIN</span><strong>990 <small>€</small></strong><span>sis. alv</span></div>
          <span className="tk-campaign__star" aria-hidden="true">✦</span>
        </div>
      </div>
    </section>
  );
}
