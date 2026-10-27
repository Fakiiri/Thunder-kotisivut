import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";
import { formatMoney } from "@shared/print-production";
import {
  PAGE_PRICE_POLICY_VERSION,
  PAGE_PRICE_NOTICE,
} from "@shared/page-settlement";
type PaymentView = {
  id: string;
  state: string;
  sourceDigest: string;
  title: string;
  deliveryAddress: string;
  totalCents: number;
  printCents: number;
  layoutCents: number;
  deliveryCents: number;
  pages: number;
  quantity: number;
  format: string;
  pagePolicyVersion: string;
  pagePolicyNotice: string;
  expires?: number;
};
export default function KansiMaksu() {
  const { id = "" } = useParams<{ id: string }>();
  const [data, setData] = useState<PaymentView | null>(null),
    [unauthorized, setUnauthorized] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [accepted, setAccepted] = useState(false),
    [email, setEmail] = useState(""),
    [notice, setNotice] = useState("");
  useSEO({
    title: "Kirjan painatus – maksaminen",
    description: "Tarkista kirjasi painatuspyyntö ja maksu.",
    canonical: "/kansi-maksu/" + id,
    noIndex: true,
  });
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/cover/checkout/" + id, { cache: "no-store" });
      if (r.status === 401) {
        setUnauthorized(true);
        setData(null);
        return;
      }
      const body = await r.json().catch(() => null);
      if (!r.ok)
        throw Error(
          body?.error || "Maksu ei ole vielä käytössä. Ota yhteyttä Santeriin."
        );
      setData(body);
      setUnauthorized(false);
      setError("");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Maksutietojen haku epäonnistui."
      );
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!data || !["creating", "open"].includes(data.state)) return;
    const timer = setInterval(() => void load(), 5000),
      stop = setTimeout(() => clearInterval(timer), 120000);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [data?.state, load]);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/cover/access/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          marketing: false,
          website: "",
          returnPath: "/kansi-maksu/" + id,
        }),
      });
      if (!r.ok)
        throw Error("Käyttölinkkiä ei voitu lähettää. Yritä myöhemmin.");
      setNotice(
        "Avaa sähköpostiisi saapuva henkilökohtainen käyttölinkki. Vahvistamisen jälkeen palaat tähän maksuun."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kirjautuminen ei onnistunut.");
    } finally {
      setBusy(false);
    }
  }
  async function pay() {
    if (!data || !accepted || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/cover/checkout/" + id, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceDigest: data.sourceDigest,
          pagePolicyVersion: PAGE_PRICE_POLICY_VERSION,
          priceTermsAccepted: true,
        }),
      });
      const result = await r.json();
      if (!r.ok) throw Error(result.error || "Maksua ei voitu avata.");
      if (result.paid || result.processing) {
        await load();
        setNotice(
          result.processing
            ? "Maksun vahvistusta odotetaan. Älä tee toista maksua."
            : ""
        );
        return;
      }
      const url = new URL(result.url);
      if (
        url.protocol !== "https:" ||
        url.hostname !== "checkout.stripe.com" ||
        url.username ||
        url.password
      )
        throw Error("Maksulinkkiä ei voitu tarkistaa.");
      window.location.assign(url.href);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Maksusivua ei voitu avata.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container max-w-3xl pt-36 pb-24 manus-no-record">
        {import.meta.env.DEV && (
          <p className="text-sm font-bold mb-5">
            PAIKALLINEN ESIKATSELU · ei oikeita maksuja
          </p>
        )}
        <p className="text-sm uppercase tracking-widest text-orange-700 mb-3">
          Thunder Kustannus
        </p>
        <h1 className="thunder-heading text-4xl mb-7">Kirjasi painatus</h1>
        {unauthorized && (
          <form onSubmit={login} className="rounded-2xl border p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Avaa oma maksusi</h2>
            <p>
              Vahvista sama sähköpostiosoite, jolla lähetit käsikirjoituksen.
              Salasanaa ei tarvita.
            </p>
            <label className="block">
              Sähköpostiosoite
              <input
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="block w-full border rounded-lg p-3 mt-2"
              />
            </label>
            <button
              disabled={busy}
              className="rounded-lg bg-orange-600 text-white px-6 py-3 font-semibold"
            >
              Lähetä henkilökohtainen käyttölinkki
            </button>
          </form>
        )}
        {data && (
          <section className="rounded-2xl border p-6 sm:p-8 space-y-5">
            <h2 className="text-2xl font-semibold">{data.title}</h2>
            <p>
              {data.quantity} pehmeäkantista kirjaa ·{" "}
              {data.format.replace("x", " × ")} mm · ilmoitettu sivumäärä{" "}
              {data.pages}
            </p>
            <p>
              <strong>Toimitusosoite:</strong> {data.deliveryAddress}
            </p>
            <dl className="space-y-3">
              <div className="flex justify-between gap-4">
                <dt>Painatus</dt>
                <dd>{formatMoney(data.printCents)}</dd>
              </div>
              {data.layoutCents > 0 && (
                <div className="flex justify-between gap-4">
                  <dt>Sisäsivujen taitto</dt>
                  <dd>{formatMoney(data.layoutCents)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt>Kotiintoimitus</dt>
                <dd>{formatMoney(data.deliveryCents)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t pt-4 font-bold text-xl">
                <dt>Maksettava nyt, sis. alv</dt>
                <dd>{formatMoney(data.totalCents)}</dd>
              </div>
            </dl>
            {data.state === "paid" ? (
              <div
                role="status"
                className="rounded-xl bg-green-50 p-5 text-green-950"
              >
                <h3 className="font-bold text-xl">Maksu on vahvistettu.</h3>
                <p>
                  Käsikirjoitus on meillä jo. Saat tilausvahvistuksen
                  sähköpostiisi. Otamme yhteyttä yhden arkipäivän kuluessa ja
                  tarkistamme toteutuksen ennen painatusta.
                </p>
              </div>
            ) : data.state === "review" ? (
              <p role="status">
                Maksuyritys tarvitsee tarkistuksen. Ota yhteyttä Santeriin ennen
                uutta maksua.
              </p>
            ) : (
              <>
                <div className="rounded-xl bg-orange-50 text-stone-900 p-5">
                  <h3 className="font-bold mb-2">
                    Sivumäärä ja lopullinen hinta
                  </h3>
                  <p>{PAGE_PRICE_NOTICE}</p>
                </div>
                <p>
                  Maksu ei käynnistä painatusta automaattisesti. Tarkistamme
                  käsikirjoituksen, kannen ja toteutuksen ennen tuotantoa.
                </p>
                <label className="flex gap-3 items-start">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={accepted}
                    onChange={e => setAccepted(e.target.checked)}
                  />
                  <span>
                    Olen tarkistanut kirjan tiedot ja toimitusosoitteen sekä
                    hyväksyn yllä olevan sivumäärään perustuvan hintaehdon.
                  </span>
                </label>
                <button
                  disabled={!accepted || busy}
                  onClick={() => void pay()}
                  className="w-full rounded-xl bg-orange-600 text-white font-bold px-6 py-4 disabled:opacity-50"
                >
                  {busy
                    ? "Avataan maksua…"
                    : "Siirry maksamaan " + formatMoney(data.totalCents)}
                </button>
                <p className="text-sm text-muted-foreground">
                  Maksu avautuu Stripen suojatulle sivulle. Saatavilla olevat
                  maksutavat näet siellä, myös Klarna silloin kun se on
                  tarjolla.
                </p>
              </>
            )}
          </section>
        )}
        {notice && (
          <p role="status" className="mt-5">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-5 text-red-800">
            {error}
          </p>
        )}
        <div className="mt-8 space-y-3">
          <button
            onClick={() => void load()}
            className="underline font-semibold"
          >
            Päivitä maksun tila
          </button>
          <p>
            Tarvitsetko apua?{" "}
            <a
              className="underline"
              href="https://wa.me/358403519546"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kysy Santerilta WhatsAppissa
            </a>
            .
          </p>
          <Link href="/kansisuunnittelija" className="underline">
            Takaisin kansisuunnittelijaan
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
