import { useState, useEffect } from "react";
import type { CoverProject } from "@/lib/cover/model";
import { COVER_CONSENT_TEXT } from "@shared/cover-funnel";
type Saved = { id: string; revision: number; title: string; expires: number };
async function api(path: string, body?: unknown, method?: string) {
  const r = await fetch("/api/cover" + path, {
    method: method || (body ? "POST" : "GET"),
    headers: body ? { "Content-Type": "application/json" } : {},
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw Error(data.error || "Toiminto ei ole juuri nyt käytössä.");
  return data;
}
export default function CoverAccount({
  project,
  privateMode,
  onLoad,
  onPrivate,
  onLogout,
  onSaved,
}: {
  project: CoverProject;
  privateMode: boolean;
  onLoad: (p: CoverProject) => void;
  onPrivate: () => void;
  onSaved: (id: string, project: CoverProject) => void;
  onLogout: () => void;
}) {
  const [available, setAvailable] = useState(false),
    [loginEnabled, setLoginEnabled] = useState(false),
    [email, setEmail] = useState(""),
    [user, setUser] = useState(""),
    [marketing, setMarketing] = useState(false),
    [saved, setSaved] = useState<Saved[]>([]),
    [current, setCurrent] = useState<{ id: string; revision: number } | null>(
      null
    ),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api("/status")
      .then(s => {
        if (active) {
          setAvailable(s.available);
          setLoginEnabled(s.loginEnabled);
        }
      })
      .catch(() => {});
    api("/session")
      .then(s => {
        if (active) setUser(s.authenticated ? s.email : "");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (user)
      api("/projects")
        .then(d => setSaved(d.projects))
        .catch(e => setError(e.message));
    else {
      setSaved([]);
      setCurrent(null);
    }
  }, [user]);
  useEffect(() => {
    const check = () => {
      if (document.visibilityState === "visible" && privateMode)
        api("/session")
          .then(s => {
            if (!s.authenticated) {
              setUser("");
              setCurrent(null);
              onLogout();
              setError(
                "Kirjautuminen vanheni. Avaa projekti uudella käyttölinkillä."
              );
            }
          })
          .catch(() => {});
    };
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, [privateMode, onLogout]);
  async function action(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Toiminto epäonnistui.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="cover-account manus-no-record"
      aria-labelledby="cover-account-heading"
    >
      <div>
        <p className="cover-eyebrow">OMA PROJEKTISI TALTEEN</p>
        <h2 id="cover-account-heading">Jatka silloin kun sinulle sopii.</h2>
        <p>
          Sähköpostiosoitteen avulla saat henkilökohtaisen käyttölinkin ja voit
          avata tallentamasi projektin myös toisella laitteella. Salasanaa ei
          tarvita.
        </p>
        <p>
          Tallennamme valitsemasi projektin tätä käyttöä varten. Emme julkaise
          kansiluonnostasi tai käytä kuviasi ja tekstejäsi markkinointiin. Voit
          pyytää ammattilaisen apua erikseen.
        </p>
      </div>
      {!available ? (
        <p>
          Yksityinen projektitallennus on tässä versiossa vielä pois käytöstä.
          Voit suunnitella ja ladata työtiedoston omalle laitteellesi.
        </p>
      ) : user ? (
        <div>
          <p>
            Kirjautunut: <strong>{user}</strong>
          </p>
          <button
            className="cover-primary"
            disabled={busy}
            onClick={() =>
              void action(async () => {
                const data = await api("/projects", {
                  project,
                  ...(current || {}),
                });
                setCurrent(data);
                onSaved(data.id, project);
                onPrivate();
                setSaved((await api("/projects")).projects);
                setStatus(
                  "Projekti tallennettiin yksityisesti. Voit jatkaa sitä toisella laitteella."
                );
              })
            }
          >
            {busy
              ? "Tallennetaan…"
              : current
                ? "Tallenna projektin muutokset"
                : "Tallenna omaksi projektiksi"}
          </button>
          <ul>
            {saved.map(p => (
              <li key={p.id}>
                <button
                  className="cover-text-link"
                  onClick={() =>
                    void action(async () => {
                      const d = await api("/projects/" + p.id);
                      onLoad(d.project);
                      onSaved(d.id, d.project);
                      onPrivate();
                      setCurrent({ id: d.id, revision: d.revision });
                      setStatus("Oma projekti avattiin.");
                    })
                  }
                >
                  {p.title} · avaa projekti
                </button>
                <button
                  className="cover-text-link"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Poistetaanko tämä tallennettu projekti? Lataa ensin työtiedosto, jos haluat säilyttää sen."
                      )
                    )
                      void action(async () => {
                        await api("/projects/" + p.id, undefined, "DELETE");
                        setSaved((await api("/projects")).projects);
                        if (current?.id === p.id) {
                          setCurrent(null);
                          onLogout();
                        }
                        setStatus("Projekti poistettiin palvelusta.");
                      });
                  }}
                >
                  Poista
                </button>
              </li>
            ))}
          </ul>
          <button
            className="cover-secondary"
            onClick={() => {
              if (
                !privateMode ||
                window.confirm(
                  "Kirjaudutaanko ulos? Tallenna muutokset tai lataa työtiedosto ensin."
                )
              )
                void action(async () => {
                  await api("/logout", {});
                  setUser("");
                  setCurrent(null);
                  onLogout();
                });
            }}
          >
            Kirjaudu ulos
          </button>
          <p>
            Enintään 5 projektia. Tallennettu projekti poistuu 90 päivän
            kuluttua viimeisestä tallennuksesta. Voit poistaa sen myös itse.
            Lataa työtiedosto omalle laitteellesi pitkäaikaista säilytystä
            varten.
          </p>
        </div>
      ) : (
        <form
          onSubmit={e => {
            e.preventDefault();
            void action(async () => {
              await api("/access/request", { email, marketing, website: "" });
              setStatus(
                "Jos käyttölinkin toimittaminen onnistuu, löydät sen sähköpostistasi. Tarkista myös roskapostikansio. Linkki on voimassa 15 minuuttia."
              );
            });
          }}
        >
          <label>
            Sähköpostiosoite
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </label>
          <label className="cover-account-consent">
            <input
              type="checkbox"
              checked={marketing}
              onChange={e => setMarketing(e.target.checked)}
            />
            <span>{COVER_CONSENT_TEXT}</span>
          </label>
          <p>
            Käyttölinkki ja projektin tallennus eivät edellytä
            markkinointilupaa.
          </p>
          <button className="cover-primary" disabled={busy || !loginEnabled}>
            Lähetä käyttölinkki
          </button>
          {!loginEnabled && (
            <p>Sähköpostilähetyksiä ei ole vielä otettu käyttöön.</p>
          )}
        </form>
      )}
      {status && <p role="status">{status}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
