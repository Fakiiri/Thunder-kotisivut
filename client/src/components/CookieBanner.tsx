// Thunder Kustannus — Cookie-suostumusbanneri
// GDPR-yhteensopiva, Google Consent Mode v2 -integraatio
// Design: tumma banneri sivun alaosassa, oranssi CTA, selkeä teksti

import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Shield } from "lucide-react";

type ConsentState = {
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "thunder_cookie_consent";
const STORAGE_VERSION = "1";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateGoogleConsent(consent: ConsentState) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: consent.analytics ? "granted" : "denied",
    ad_storage: consent.marketing ? "granted" : "denied",
    ad_user_data: consent.marketing ? "granted" : "denied",
    ad_personalization: consent.marketing ? "granted" : "denied",
  });
}

function saveConsent(consent: ConsentState) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ version: STORAGE_VERSION, ...consent, timestamp: Date.now() })
  );
  updateGoogleConsent(consent);
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({ analytics: false, marketing: false });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.version === STORAGE_VERSION) {
          // Suostumus jo annettu — päivitetään Google Consent
          updateGoogleConsent({ analytics: parsed.analytics, marketing: parsed.marketing });
          return;
        }
      } catch {}
    }
    // Ei aiempaa suostumusta — näytetään banneri pienen viiveen jälkeen
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    const c = { analytics: true, marketing: true };
    saveConsent(c);
    setVisible(false);
  };

  const handleRejectAll = () => {
    const c = { analytics: false, marketing: false };
    saveConsent(c);
    setVisible(false);
  };

  const handleSaveChoices = () => {
    saveConsent(consent);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Evästeasetukset"
      aria-modal="true"
      className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300"
    >
      {/* Backdrop blur overlay */}
      <div className="bg-[#0f0f0f]/95 backdrop-blur-sm border-t border-white/10 shadow-2xl">
        <div className="container max-w-5xl py-5">
          {/* Main row */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1">
              <Shield className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white text-sm font-semibold mb-0.5">
                  Käytämme evästeitä
                </p>
                <p className="text-white/60 text-xs leading-relaxed max-w-xl">
                  Käytämme analytiikkaevästeitä sivuston kehittämiseen. Et ole velvollinen hyväksymään muita kuin välttämättömät evästeet.{" "}
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-orange-400 underline underline-offset-2 hover:text-orange-300 transition-colors inline-flex items-center gap-0.5"
                  >
                    {showDetails ? "Piilota asetukset" : "Muokkaa asetuksia"}
                    {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all"
              >
                Hylkää kaikki
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-400 rounded-lg transition-all"
              >
                Hyväksy kaikki
              </button>
              <button
                onClick={() => setVisible(false)}
                aria-label="Sulje"
                className="p-1.5 text-white/40 hover:text-white/80 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Expanded settings */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Välttämättömät */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-semibold">Välttämättömät</span>
                  <span className="text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">Aina päällä</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Sivuston perustoiminnot, kuten lomakkeet ja navigaatio. Ei voi poistaa käytöstä.
                </p>
              </div>

              {/* Analytiikka */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-semibold">Analytiikka</span>
                  <button
                    role="switch"
                    aria-checked={consent.analytics}
                    onClick={() => setConsent(c => ({ ...c, analytics: !c.analytics }))}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                      consent.analytics ? "bg-orange-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        consent.analytics ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Google Analytics — auttaa meitä ymmärtämään miten sivustoa käytetään, jotta voimme parantaa sitä.
                </p>
              </div>

              {/* Markkinointi */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-semibold">Markkinointi</span>
                  <button
                    role="switch"
                    aria-checked={consent.marketing}
                    onClick={() => setConsent(c => ({ ...c, marketing: !c.marketing }))}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                      consent.marketing ? "bg-orange-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        consent.marketing ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Kohdennettu mainonta ja uudelleenmarkkinointi. Käytetään vain jos otat Google Ads -mainonnan käyttöön.
                </p>
              </div>

              {/* Tallenna valinnat */}
              <div className="md:col-span-3 flex justify-end mt-1">
                <button
                  onClick={handleSaveChoices}
                  className="px-5 py-2 text-xs font-bold text-white border border-orange-500 hover:bg-orange-500/20 rounded-lg transition-all"
                >
                  Tallenna omat valinnat
                </button>
              </div>
            </div>
          )}

          {/* Privacy link */}
          <p className="text-white/30 text-xs mt-3">
            Lisätietoja:{" "}
            <a href="/tietosuoja" className="underline hover:text-white/60 transition-colors">
              Tietosuojaseloste
            </a>{" "}
            ·{" "}
            <a href="/sopimusehdot" className="underline hover:text-white/60 transition-colors">
              Käyttöehdot
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
