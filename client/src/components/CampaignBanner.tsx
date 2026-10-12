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
          <svg className="tk-campaign__mistletoe" aria-hidden="true" viewBox="0 0 100 110" fill="none"><path d="M50 100 C48 75 54 45 69 15 M51 74 C40 58 29 45 17 34" stroke="#b5c69b" strokeWidth="3" strokeLinecap="round"/><ellipse cx="67" cy="33" rx="8" ry="20" transform="rotate(28 67 33)" fill="#91ad7e"/><ellipse cx="46" cy="48" rx="8" ry="19" transform="rotate(-30 46 48)" fill="#769665"/><ellipse cx="74" cy="60" rx="8" ry="19" transform="rotate(52 74 60)" fill="#91ad7e"/><ellipse cx="26" cy="42" rx="7" ry="18" transform="rotate(-45 26 42)" fill="#91ad7e"/><ellipse cx="35" cy="67" rx="7" ry="17" transform="rotate(-54 35 67)" fill="#769665"/><circle cx="53" cy="65" r="5" fill="#fff8eb"/><circle cx="62" cy="71" r="5" fill="#fff8eb"/><circle cx="53" cy="77" r="5" fill="#fff8eb"/></svg>
        </div>
      </div>
    </section>
  );
}
