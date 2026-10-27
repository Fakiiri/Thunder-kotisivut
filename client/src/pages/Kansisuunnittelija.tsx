import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  FileUp,
  ImagePlus,
  LayoutTemplate,
  LockKeyhole,
  Move,
  Palette,
  Redo2,
  RotateCcw,
  ShieldCheck,
  Type,
  Undo2,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import CoverCanvas from "@/components/cover/CoverCanvas";
import CoverProduction from "@/components/cover/CoverProduction";
import CoverOrder from "@/components/cover/CoverOrder";
import CoverAccount from "@/components/cover/CoverAccount";
import CoverPreflight from "@/components/cover/CoverPreflight";
import CoverServiceHelp from "@/components/cover/CoverServiceHelp";
import CoverPrintNext from "@/components/cover/CoverPrintNext";
import {
  coverGeometry,
  formatMm,
  productionSchema,
  printEntry,
  type Production,
} from "@shared/print-production";
import { coverPdf, canvasJpeg } from "@/lib/cover/pdf";
import { useSEO } from "@/hooks/useSEO";
import {
  templates,
  createProject,
  applyTemplate,
  projectSchema,
  safeFilename,
  COVER_HEIGHT,
  coverWidth,
  coverLayout,
  textLabels,
  type CoverProject,
  type CoverView,
  type TextKey,
} from "@/lib/cover/model";
import { coverWarnings, renderCover } from "@/lib/cover/render";
import {
  downloadBlob,
  loadDraft,
  storeDraft,
  readImage,
  validateProjectImage,
} from "@/lib/cover/storage";
import "./Kansisuunnittelija.css";

type Tab = "templates" | "texts" | "design" | "image";
const tabs: { id: Tab; name: string; icon: typeof Type }[] = [
  { id: "templates", name: "Pohjat", icon: LayoutTemplate },
  { id: "texts", name: "Tekstit", icon: Type },
  { id: "design", name: "Ulkoasu", icon: Palette },
  { id: "image", name: "Oma kuva", icon: ImagePlus },
];
const keys: TextKey[] = ["title", "subtitle", "author", "back", "spine"];
const limits = {
  title: 120,
  subtitle: 180,
  author: 100,
  back: 1800,
  spine: 180,
};
type History = {
  past: CoverProject[];
  present: CoverProject;
  future: CoverProject[];
};
function Thumbnail({ id }: { id: CoverProject["template"] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current)
      renderCover(ref.current, createProject(id), "front", { thumbnail: true });
  }, [id]);
  return <canvas ref={ref} width={180} height={251} aria-hidden="true" />;
}
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <label className="cover-slider">
      <span>
        {label}
        <output>
          {Math.round(value * 100) / 100}
          {suffix}
        </output>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  );
}
export default function Kansisuunnittelija() {
  useSEO({
    title: "Kirjan kannen suunnittelu – maksuton kansisuunnittelija",
    description:
      "Kokeile kahdeksaa kansipohjaa ja luonnostele oman kirjasi kansi. Kuvat ja luonnokset säilyvät omalla laitteellasi.",
    canonical: "/kansisuunnittelija",
    noIndex: import.meta.env.DEV,
  });
  const [history, setHistory] = useState<History>(() => ({
    past: [],
    present: createProject(),
    future: [],
  }));
  const p = history.present;
  const currentProject = useRef(p);
  currentProject.current = p;
  const [privateMode, setPrivateMode] = useState(false);
  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [intakeAvailable, setIntakeAvailable] = useState(false);
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);
  const showPrivateTools = import.meta.env.DEV || cloudAvailable;
  useEffect(() => {
    let active = true;
    fetch("/api/cover/status", { cache: "no-store" })
      .then(r => (r.ok ? r.json() : null))
      .then(status => {
        if (active) {
          setIntakeAvailable(status?.submissionEnabled === true);
          setCheckoutAvailable(status?.checkoutEnabled === true);
          setCloudAvailable(
            status?.available === true && status?.loginEnabled === true
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [cloudVersion, setCloudVersion] = useState<{
    id: string;
    json: string;
  } | null>(null);
  const [loaded, setLoaded] = useState(false),
    [tab, setTab] = useState<Tab>("templates"),
    [view, setView] = useState<CoverView>("spread");
  const [selected, setSelected] = useState<TextKey>("title"),
    [guides, setGuides] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [status, setStatus] = useState("Avataan luonnosta…"),
    [busy, setBusy] = useState(false),
    [warnings, setWarnings] = useState<string[]>([]);
  const [decodedImage, setDecodedImage] = useState<HTMLImageElement | null>(
    null
  );
  const fileInput = useRef<HTMLInputElement>(null),
    projectInput = useRef<HTMLInputElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const generation = useRef(0),
    working = useRef(false);
  const onReady = useCallback(
    (image: HTMLImageElement | null) => setDecodedImage(image),
    []
  );
  const onError = useCallback((message: string) => setError(message), []);
  const update = useCallback((next: CoverProject, record = true) => {
    setHistory(h => ({
      past: record ? [...h.past, h.present].slice(-40) : h.past,
      present: next,
      future: [],
    }));
    setNotice("");
    setError("");
  }, []);
  const checkpoint = useCallback(
    () =>
      setHistory(h => ({
        ...h,
        past: [...h.past, h.present].slice(-40),
        future: [],
      })),
    []
  );
  const undo = useCallback(
    () =>
      setHistory(h =>
        h.past.length
          ? {
              past: h.past.slice(0, -1),
              present: h.past[h.past.length - 1],
              future: [h.present, ...h.future],
            }
          : h
      ),
    []
  );
  const redo = useCallback(
    () =>
      setHistory(h =>
        h.future.length
          ? {
              past: [...h.past, h.present],
              present: h.future[0],
              future: h.future.slice(1),
            }
          : h
      ),
    []
  );
  useEffect(() => {
    let active = true;
    const query = new URLSearchParams(window.location.search);
    const selection = productionSchema.safeParse({
      format: query.get("format"),
      paper: query.get("paper"),
      pages: Number(query.get("pages")),
      quantity: Number(query.get("quantity")),
      interior: "ready",
    });
    loadDraft()
      .then(async draft => {
        if (!active) return;
        if (draft) {
          const checked = await validateProjectImage(draft);
          if (selection.success) checked.production = selection.data;
          if (active) {
            setHistory({ past: [], present: checked, future: [] });
            setNotice(
              "Edellinen luonnoksesi on avattu. Voit jatkaa siitä, mihin jäit."
            );
          }
        }
      })
      .catch(() => {
        if (active)
          setError(
            "Selaintallennusta ei voitu avata. Voit silti suunnitella ja ladata työtiedoston omalle laitteellesi."
          );
      })
      .finally(() => {
        if (active && selection.success)
          setHistory(h => ({
            ...h,
            present: { ...h.present, production: selection.data },
          }));
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    if (privateMode) {
      setStatus("Yksityinen projekti · tallenna muutokset omaan projektiin");
      return;
    }
    const current = ++generation.current;
    setStatus("Tallennetaan tähän selaimeen…");
    const timer = setTimeout(() => {
      storeDraft(p)
        .then(() => {
          if (current === generation.current)
            setStatus("Tallennettu tähän selaimeen");
        })
        .catch(() => {
          if (current === generation.current)
            setStatus(
              "Automaattitallennus ei onnistu. Lataa työtiedosto talteen."
            );
        });
    }, 650);
    return () => clearTimeout(timer);
  }, [p, loaded, privateMode]);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = COVER_HEIGHT;
    const boxes = renderCover(canvas, p, "spread", { image: decodedImage });
    setWarnings(coverWarnings(p, boxes));
  }, [p, decodedImage]);
  function saveProject() {
    downloadBlob(
      new Blob([JSON.stringify(p, null, 2)], { type: "application/json" }),
      safeFilename(p.title) + ".thunder-kansi.json"
    );
    setNotice(
      "Työtiedosto ladattiin. Avaa se myöhemmin kohdasta Avaa luonnos. Se sisältää myös lisäämäsi kuvan."
    );
  }
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveProject();
        return;
      }
      if ((e.target as HTMLElement).closest("input,textarea,select")) return;
      if (e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [p, undo, redo]);
  function position<K extends keyof CoverProject["positions"][TextKey]>(
    key: K,
    value: CoverProject["positions"][TextKey][K]
  ) {
    update({
      ...p,
      positions: {
        ...p.positions,
        [selected]: { ...p.positions[selected], [key]: value },
      },
    });
  }
  async function upload(file?: File) {
    if (!file || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      const image = await readImage(file);
      update({
        ...currentProject.current,
        image,
        photo: { zoom: 1, x: 50, y: 50, shade: 30 },
      });
      setNotice(
        "Kuva lisättiin vain tähän selaimeen. Alkuperäinen kuvatiedosto säilyy muuttumattomana."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kuvaa ei voitu avata.");
    } finally {
      working.current = false;
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function open(file?: File) {
    if (!file || working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      if (file.size > 24 * 1024 * 1024)
        throw new Error("Työtiedosto on liian suuri (enintään 24 Mt).");
      const parsed = projectSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success)
        throw new Error(
          "Tiedosto ei ole tuettu Thunder-kansiluonnos. Valitse tästä työkalusta ladattu .thunder-kansi.json-tiedosto."
        );
      const next = await validateProjectImage(parsed.data);
      update(next);
      setNotice(
        "Luonnos avattiin. Voit palata edelliseen työhön Peru-painikkeella."
      );
    } catch (e) {
      setError(
        e instanceof Error && !(e instanceof SyntaxError)
          ? e.message
          : "Tiedostoa ei voitu lukea. Valitse Thunder-kansiluonnos."
      );
    } finally {
      working.current = false;
      setBusy(false);
      if (projectInput.current) projectInput.current.value = "";
    }
  }

  async function makePdf() {
    await Promise.all(
      [
        '400 16px "Thunder Cover Serif"',
        '700 16px "Thunder Cover Serif"',
        '400 16px "Thunder Cover Sans"',
        '700 16px "Thunder Cover Sans"',
      ].map(font => document.fonts.load(font))
    );
    if (p.image && !decodedImage) throw new Error("Odota kuvan avautumista.");
    const g = coverGeometry(p.production),
      canvas = document.createElement("canvas");
    canvas.width = Math.round((g.sheetWidthMm / 25.4) * 300);
    canvas.height = Math.round((g.sheetHeightMm / 25.4) * 300);
    if (canvas.width * canvas.height > 24_000_000)
      throw new Error(
        "Kansiaineisto on liian suuri selaimessa käsiteltäväksi."
      );
    renderCover(canvas, p, "spread", { image: decodedImage });
    return coverPdf(
      await canvasJpeg(canvas),
      canvas.width,
      canvas.height,
      p.production
    );
  }
  async function exportPdf() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      downloadBlob(
        await makePdf(),
        safeFilename(p.title) + "-kansiluonnos-RGB-5mm.pdf"
      );
      setNotice(
        "RGB-kansiluonnos ladattiin oikeissa millimetrimitoissa ja 5 mm:n leikkuuvaroilla. Se tarvitsee vielä tuotantotaiton ennen painoa."
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "PDF:n muodostaminen epäonnistui."
      );
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  async function exportPreview() {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      if (p.image && !decodedImage)
        throw new Error("Odota, että kuva on avautunut esikatseluun.");
      const canvas = document.createElement("canvas");
      const layout = coverLayout(p, view);
      const w = layout.canvasWidth;
      canvas.width = view === "spread" ? 1866 : 1200;
      const scale = canvas.width / w;
      const footer = 64;
      canvas.height = Math.round(layout.canvasHeight * scale) + footer;
      renderCover(canvas, p, view, { image: decodedImage });
      const c = canvas.getContext("2d")!;
      c.fillStyle = "#f7f3ed";
      c.fillRect(0, canvas.height - footer, canvas.width, footer);
      c.fillStyle = "#51483e";
      c.font = "18px Arial";
      c.textAlign = "center";
      c.fillText(
        "THUNDER KUSTANNUS · KANSILUONNOS · EI PAINOVALMIS",
        canvas.width / 2,
        canvas.height - 35
      );
      c.font = "14px Arial";
      c.fillText(
        "Koko " +
          formatMm(layout.sheetWidthMm) +
          " × " +
          formatMm(layout.sheetHeightMm) +
          " · selkä " +
          formatMm(layout.spineMm) +
          " · leikkuuvarat 5 mm.",
        canvas.width / 2,
        canvas.height - 14
      );
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Esikatselun lataaminen ei onnistunut.");
      downloadBlob(
        blob,
        safeFilename(p.title) +
          "-" +
          (view === "front"
            ? "etukansi"
            : view === "back"
              ? "takakansi"
              : "koko-kansi") +
          "-luonnos.png"
      );
      setNotice(
        "Esikatselu ladattiin PNG-kuvana. Lataa myös työtiedosto, jos haluat jatkaa muokkaamista myöhemmin."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lataus ei onnistunut.");
    } finally {
      working.current = false;
      setBusy(false);
    }
  }
  const activeTemplate = templates.find(t => t.id === p.template)!;
  const pos = p.positions[selected];
  const geometry = coverGeometry(p.production);
  return (
    <div className="cover-page manus-no-record">
      <Navbar />
      <div className="cover-preview-strip">
        <LockKeyhole size={14} />{" "}
        {import.meta.env.DEV
          ? "PAIKALLINEN ESIKATSELU"
          : "MAKSUTON KANSISUUNNITTELIJA"}{" "}
        · Kuviasi ja kansiluonnostasi ei julkaista
      </div>
      <header className="cover-heading">
        <div>
          <p className="cover-eyebrow">THUNDERIN KANSISTUDIO</p>
          <h1>Kansisuunnittelija</h1>
          <p>
            Valitse kirjan tiedot, suunnittele koko kansi ja tarkista
            painatushinta.
          </p>
        </div>
        <span className="cover-free">
          <ShieldCheck size={17} /> Maksuton kokeilu
          <br />
          <small>
            {privateMode
              ? "Oma yksityinen projekti"
              : "Kokeile ilman kirjautumista"}
          </small>
        </span>
      </header>
      <main
        id="kansistudio"
        className="cover-workspace"
        aria-busy={!loaded || busy}
      >
        {showPrivateTools && (
          <CoverAccount
            project={p}
            privateMode={privateMode}
            onSaved={(id, saved) =>
              setCloudVersion({ id, json: JSON.stringify(saved) })
            }
            onLoad={next => {
              setPrivateMode(true);
              setHistory({
                past: [],
                present: projectSchema.parse(next),
                future: [],
              });
              setNotice("");
            }}
            onPrivate={() => {
              setPrivateMode(true);
              void storeDraft(null);
            }}
            onLogout={() => {
              setPrivateMode(false);
              setCloudVersion(null);
              setHistory({ past: [], present: createProject(), future: [] });
              setNotice("");
              void storeDraft(null);
            }}
          />
        )}
        <CoverProduction
          production={p.production}
          disabled={!loaded || busy}
          onChange={production => update({ ...p, production })}
        />
        <div className="cover-toolbar">
          <div className="cover-toolbar-title">
            <BookOpen size={20} />
            <strong>Oma kansiluonnos</strong>
            <span role="status">{status}</span>
          </div>
          <div className="cover-tools">
            <button
              onClick={undo}
              disabled={!history.past.length || busy || !loaded}
              title="Peru (Ctrl/Cmd + Z)"
              aria-label="Peru"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!history.future.length || busy || !loaded}
              title="Tee uudelleen"
              aria-label="Tee uudelleen"
            >
              <Redo2 size={18} />
            </button>
            <span className="cover-divider" />
            <button
              aria-label="Avaa luonnos"
              onClick={() => projectInput.current?.click()}
              disabled={busy || !loaded}
            >
              <FileUp size={16} />
              <span>Avaa luonnos</span>
            </button>
            <button
              aria-label="Lataa työtiedosto"
              onClick={saveProject}
              disabled={busy || !loaded}
            >
              <ArrowDownToLine size={16} />
              <span>Lataa työtiedosto</span>
            </button>
            <button
              className="cover-primary"
              onClick={() => {
                setNotice("");
                setError("");
                dialog.current?.showModal();
              }}
              disabled={busy || !loaded}
            >
              Lataa kansi <ArrowRight size={17} />
            </button>
          </div>
        </div>
        <input
          ref={projectInput}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={e => void open(e.target.files?.[0])}
        />
        {error && (
          <div className="cover-message cover-error" role="alert">
            {error}
            <button
              aria-label="Sulje virheilmoitus"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {notice && (
          <div className="cover-message" role="status">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button aria-label="Sulje ilmoitus" onClick={() => setNotice("")}>
              <X size={16} />
            </button>
          </div>
        )}
        <div className="cover-editor-grid">
          <aside className="cover-sidebar" aria-label="Kannen muokkaus">
            <div
              className="cover-tabs"
              role="tablist"
              aria-label="Muokkauksen vaihe"
            >
              {tabs.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  id={"tab-" + id}
                  role="tab"
                  aria-controls={"panel-" + id}
                  aria-selected={tab === id}
                  tabIndex={tab === id ? 0 : -1}
                  onClick={() => setTab(id)}
                  onKeyDown={e => {
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        e.key
                      )
                    )
                      return;
                    e.preventDefault();
                    const i = tabs.findIndex(t => t.id === tab);
                    const next =
                      e.key === "Home"
                        ? tabs[0]
                        : e.key === "End"
                          ? tabs[3]
                          : tabs[(i + (e.key === "ArrowRight" ? 1 : 3)) % 4];
                    setTab(next.id);
                    document.getElementById("tab-" + next.id)?.focus();
                  }}
                >
                  <Icon size={18} />
                  {name}
                </button>
              ))}
            </div>
            <div
              role="tabpanel"
              id={"panel-" + tab}
              aria-labelledby={"tab-" + tab}
              className="cover-panel"
            >
              <fieldset disabled={!loaded || busy} className="cover-fields">
                {tab === "templates" && (
                  <>
                    <p className="cover-panel-kicker">01 / LÖYDÄ OMA TYYLISI</p>
                    <h2>Mistä sinun tarinasi alkaa?</h2>
                    <p className="cover-help">
                      Kaikki pohjat ovat muokattavissa. Pohjan vaihtaminen
                      säilyttää omat tekstisi ja kuvasi.
                    </p>
                    <div className="cover-template-grid">
                      {templates.map(t => (
                        <button
                          key={t.id}
                          className={
                            "cover-template " +
                            (p.template === t.id ? "is-selected" : "")
                          }
                          aria-pressed={p.template === t.id}
                          onClick={() => update(applyTemplate(p, t.id))}
                        >
                          <Thumbnail id={t.id} />
                          <span>
                            <strong>{t.name}</strong>
                            <small>{t.genre}</small>
                          </span>
                          {p.template === t.id && (
                            <i>
                              <Check size={13} />
                            </i>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {tab === "texts" && (
                  <>
                    <p className="cover-panel-kicker">02 / SINUN SANASI</p>
                    <h2>Nimi, tekijä ja tarina.</h2>
                    <div className="cover-text-select">
                      {keys.map(k => (
                        <button
                          key={k}
                          className={selected === k ? "active" : ""}
                          onClick={() => {
                            setSelected(k);
                            if (k === "back") setView("back");
                            else if (k === "spine") setView("spread");
                            else if (view === "back") setView("front");
                          }}
                        >
                          {textLabels[k]}
                        </button>
                      ))}
                    </div>
                    <label className="cover-field">
                      <span>
                        {textLabels[selected]}
                        {selected === "subtitle" && (
                          <small>Vapaaehtoinen</small>
                        )}
                      </span>
                      <textarea
                        name={"private-cover-" + selected}
                        rows={selected === "back" ? 9 : 3}
                        maxLength={limits[selected]}
                        value={p[selected]}
                        onChange={e =>
                          update({ ...p, [selected]: e.target.value })
                        }
                        placeholder={
                          selected === "subtitle"
                            ? "Kirjoita halutessasi alaotsikko"
                            : textLabels[selected]
                        }
                      />
                      <small>
                        {p[selected].length} / {limits[selected]}
                      </small>
                    </label>
                    <Slider
                      label="Kirjasinkoko"
                      suffix=" pt"
                      value={
                        Math.round(
                          ((((pos.size * geometry.widthMm) / 600) * 72) /
                            25.4) *
                            10
                        ) / 10
                      }
                      min={Math.ceil(
                        (((12 * geometry.widthMm) / 600) * 72) / 25.4
                      )}
                      max={Math.floor(
                        (((96 * geometry.widthMm) / 600) * 72) / 25.4
                      )}
                      step={0.5}
                      onChange={v =>
                        position(
                          "size",
                          v / (((geometry.widthMm / 600) * 72) / 25.4)
                        )
                      }
                    />
                    <label className="cover-field">
                      <span>Tasaus</span>
                      <select
                        value={pos.align}
                        onChange={e =>
                          position("align", e.target.value as typeof pos.align)
                        }
                      >
                        <option value="left">Vasemmalle</option>
                        <option value="center">Keskelle</option>
                        <option value="right">Oikealle</option>
                      </select>
                    </label>
                    <Slider
                      label="Sijainti sivusuunnassa"
                      value={Math.round(pos.x * 100)}
                      min={8}
                      max={92}
                      suffix=" %"
                      onChange={v => position("x", v / 100)}
                    />
                    <Slider
                      label="Sijainti korkeussuunnassa"
                      value={Math.round(pos.y * 100)}
                      min={6}
                      max={92}
                      suffix=" %"
                      onChange={v => position("y", v / 100)}
                    />
                    <p className="cover-help">
                      <Move size={14} /> Voit myös tarttua tekstiin kannessa ja
                      vetää. Nuolinäppäimet siirtävät valittua tekstiä.
                    </p>
                  </>
                )}
                {tab === "design" && (
                  <>
                    <p className="cover-panel-kicker">
                      03 / VIIMEISTELE TUNNELMA
                    </p>
                    <h2>Värit ja kirjasin.</h2>
                    <p className="cover-help">
                      Pohjan koristeet mukautuvat valitsemaasi korostusväriin.
                    </p>
                    <div className="cover-color-fields">
                      {(
                        [
                          ["bg", "Taustaväri"],
                          ["ink", "Tekstin väri"],
                          ["accent", "Korostusväri"],
                        ] as const
                      ).map(([key, label]) => (
                        <label key={key}>
                          <input
                            type="color"
                            value={p[key]}
                            aria-label={label}
                            onChange={e =>
                              update({ ...p, [key]: e.target.value })
                            }
                          />
                          <span>
                            {label}
                            <small>{p[key].toUpperCase()}</small>
                          </span>
                        </label>
                      ))}
                    </div>
                    <label className="cover-field">
                      <span>Kirjasintyyli</span>
                      <select
                        value={p.font}
                        onChange={e =>
                          update({
                            ...p,
                            font: e.target.value as CoverProject["font"],
                          })
                        }
                      >
                        <option value="serif">Klassinen — Noto Serif</option>
                        <option value="sans">Selkeä — Noto Sans</option>
                      </select>
                    </label>
                    <div
                      className="cover-font-sample"
                      style={{
                        fontFamily:
                          p.font === "serif"
                            ? '"Thunder Cover Serif", Georgia, serif'
                            : '"Thunder Cover Sans", Arial, sans-serif',
                      }}
                    >
                      Tarina, joka jää.
                      <br />
                      <small>Aa Bb Cc · Å Ä Ö · 123</small>
                    </div>
                    <button
                      className="cover-secondary"
                      onClick={() =>
                        update({
                          ...p,
                          bg: activeTemplate.bg,
                          ink: activeTemplate.ink,
                          accent: activeTemplate.accent,
                        })
                      }
                    >
                      <RotateCcw size={15} /> Palauta pohjan värit
                    </button>
                  </>
                )}
                {tab === "image" && (
                  <>
                    <p className="cover-panel-kicker">04 / OMA NÄKÖKULMASI</p>
                    <h2>Sinun kuvasi kanteen.</h2>
                    <p className="cover-help">
                      Kuva korvaa etukannen pohjakuvion. Valitse kuva, jonka
                      käyttöön sinulla on lupa.
                    </p>
                    <button
                      className="cover-upload"
                      onClick={() => fileInput.current?.click()}
                    >
                      <ImagePlus size={30} />
                      <strong>
                        {p.image ? "Vaihda kuva" : "Valitse kuva laitteeltasi"}
                      </strong>
                      <span>JPG tai PNG · enintään 12 Mt / 24 MP</span>
                    </button>
                    <input
                      ref={fileInput}
                      hidden
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={e => void upload(e.target.files?.[0])}
                    />
                    {p.image && (
                      <>
                        <Slider
                          label="Kuvan suurennus"
                          value={p.photo.zoom}
                          min={1}
                          max={3}
                          step={0.05}
                          suffix=" ×"
                          onChange={v =>
                            update({ ...p, photo: { ...p.photo, zoom: v } })
                          }
                        />
                        <Slider
                          label="Rajaus vasen–oikea"
                          value={p.photo.x}
                          min={0}
                          max={100}
                          suffix=" %"
                          onChange={v =>
                            update({ ...p, photo: { ...p.photo, x: v } })
                          }
                        />
                        <Slider
                          label="Rajaus ylös–alas"
                          value={p.photo.y}
                          min={0}
                          max={100}
                          suffix=" %"
                          onChange={v =>
                            update({ ...p, photo: { ...p.photo, y: v } })
                          }
                        />
                        <Slider
                          label="Kuvan tummennus"
                          value={p.photo.shade}
                          min={0}
                          max={85}
                          suffix=" %"
                          onChange={v =>
                            update({ ...p, photo: { ...p.photo, shade: v } })
                          }
                        />
                        <button
                          className="cover-secondary"
                          onClick={() => update({ ...p, image: null })}
                        >
                          <X size={15} /> Poista kuva ja palauta pohjakuvio
                        </button>
                      </>
                    )}
                    <p className="cover-privacy">
                      <LockKeyhole size={16} />{" "}
                      {privateMode
                        ? "Kuva tallentuu vain omaan yksityiseen projektiisi."
                        : showPrivateTools
                          ? "Kuva pysyy laitteellasi, kunnes valitset yksityisen projektitallennuksen."
                          : "Kuva pysyy omalla laitteellasi."}
                      Se pysyy tässä selaimessa ja lataamassasi työtiedostossa.
                    </p>
                  </>
                )}
              </fieldset>
            </div>
          </aside>
          <section className="cover-stage" aria-label="Kannen esikatselu">
            <div className="cover-stage-toolbar">
              <div
                className="cover-view-switch"
                aria-label="Esikatselun näkymä"
              >
                {(
                  [
                    ["front", "Etukansi"],
                    ["back", "Takakansi"],
                    ["spread", "Koko kansi"],
                  ] as const
                ).map(([key, name]) => (
                  <button
                    key={key}
                    aria-pressed={view === key}
                    className={view === key ? "active" : ""}
                    onClick={() => {
                      setView(key);
                      if (key === "back") setSelected("back");
                      if (key === "front" && selected === "back")
                        setSelected("title");
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
              <label className="cover-guide-toggle">
                <input
                  type="checkbox"
                  checked={guides}
                  onChange={e => setGuides(e.target.checked)}
                />
                Turva-alueet
              </label>
            </div>
            <div
              className={
                "cover-canvas-space " + (view === "spread" ? "is-spread" : "")
              }
            >
              <span className="cover-stage-caption">
                {view === "spread"
                  ? "TAKAKANSI / SELKÄ / ETUKANSI"
                  : formatMm(geometry.sheetWidthMm) +
                    " × " +
                    formatMm(geometry.sheetHeightMm) +
                    " · LEIKKUUVARAT 5 mm"}
              </span>
              {view === "spread" && (
                <div className="cover-sheet-labels">
                  <span>
                    TAKAKANSI
                    <br />
                    {formatMm(geometry.widthMm)} × {formatMm(geometry.heightMm)}
                  </span>
                  <span>
                    SELKÄ
                    <br />
                    {formatMm(geometry.spineMm)}
                  </span>
                  <span>
                    ETUKANSI
                    <br />
                    {formatMm(geometry.widthMm)} × {formatMm(geometry.heightMm)}
                  </span>
                </div>
              )}
              {loaded ? (
                <CoverCanvas
                  project={p}
                  view={view}
                  guides={guides}
                  selected={selected}
                  onSelect={key => {
                    setSelected(key);
                    setTab("texts");
                  }}
                  onChange={update}
                  onCheckpoint={checkpoint}
                  onReady={onReady}
                  onError={onError}
                />
              ) : (
                <p role="status">Avataan luonnosta…</p>
              )}
              <span className="cover-stage-bottom">
                {geometry.widthMm} × {geometry.heightMm} mm · SELKÄ{" "}
                {formatMm(geometry.spineMm)} <span>•</span>{" "}
                {activeTemplate.name}
              </span>
            </div>
            <div className="cover-stage-note">
              <ShieldCheck size={18} />
              <p>
                {view === "spread"
                  ? "Kannen selkä ja koko tulevat hintalaskurin hinnastosta. Leikkuuvara on 5 mm jokaisella ulkoreunalla. Oranssi katkoviiva näyttää tekstien turva-alueen."
                  : privateMode
                    ? "Tallenna muutokset omaan projektiin, jotta voit jatkaa toisella laitteella."
                    : "Kokeile rauhassa. Luonnos säilyy tässä selaimessa. Lataa työtiedosto talteen, jotta voit jatkaa myös toisella laitteella."}
              </p>
            </div>
          </section>
        </div>
        <div className="cover-checks">
          <div>
            <span className="cover-panel-kicker">ENNEN KUIN JATKAT</span>
            <h2>Pieni tarkistus, parempi kansi.</h2>
          </div>
          <div>
            {warnings.length ? (
              <ul>
                {warnings.map(w => (
                  <li key={w}>
                    <span className="cover-warning-dot" /> {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <CheckCircle2 size={18} /> Luonnoksen sijoittelu- ja
                kontrastitarkistuksissa ei löytynyt huomautettavaa.
              </p>
            )}
            <p className="cover-help">
              Tarkistukset auttavat luonnostelussa. Ne eivät korvaa painotalon
              aineistotarkistusta. RGB-luonnos vaatii aina tuotantotaiton ennen
              painoa.
            </p>
          </div>
        </div>
      </main>
      {import.meta.env.DEV || intakeAvailable ? (
        <CoverOrder
          intake={intakeAvailable}
          checkoutAvailable={checkoutAvailable}
          projectId={cloudVersion?.id || null}
          dirty={!!cloudVersion && cloudVersion.json !== JSON.stringify(p)}
          project={p}
          createPdf={makePdf}
          onInteriorChange={() =>
            update({
              ...currentProject.current,
              production: {
                ...currentProject.current.production,
                interior: "layout",
              },
            })
          }
        />
      ) : (
        <CoverPrintNext production={p.production} />
      )}
      {showPrivateTools && (
        <CoverPreflight
          projectId={cloudVersion?.id || null}
          dirty={!!cloudVersion && cloudVersion.json !== JSON.stringify(p)}
        />
      )}
      <CoverServiceHelp />
      <section className="cover-next">
        <div>
          <p className="cover-eyebrow">MUUT JULKAISUPALVELUT</p>
          <h2>Tarvitsetko myös kirjan julkaisun?</h2>
          <p>
            Voit luonnostella itse ja antaa ammattilaisen auttaa julkaisun
            seuraavissa vaiheissa.
          </p>
        </div>
        <div>
          <Link href="/hinnat" className="cover-primary">
            Tutustu julkaisupaketteihin <ArrowRight size={17} />
          </Link>
          <Link href="/tarjouspyynto" className="cover-text-link">
            Kysy apua oman kirjasi julkaisuun <ChevronRight size={16} />
          </Link>
        </div>
      </section>
      <footer className="cover-local-footer">
        <LockKeyhole size={15} />
        <p>
          {privateMode
            ? "Tämä on yksityinen projekti. Tallenna muutokset omaan projektiin ennen uloskirjautumista."
            : showPrivateTools
              ? "Luonnos tallentuu tähän selaimeen. Selaintietojen poistaminen voi poistaa sen. Lataa työtiedosto talteen tai valitse yksityinen projektitallennus."
              : "Luonnos tallentuu tähän selaimeen. Selaintietojen poistaminen voi poistaa sen. Lataa työtiedosto talteen, jotta voit jatkaa myöhemmin."}
        </p>
        <button
          onClick={() => {
            if (
              window.confirm(
                "Poistetaanko tähän selaimeen tallennettu kansiluonnos ja aloitetaanko tyhjästä? Lataa ensin työtiedosto, jos haluat säilyttää nykyisen työn."
              )
            ) {
              update(createProject());
              setNotice(
                "Uusi luonnos aloitettu. Edelliseen voi vielä palata Peru-painikkeella."
              );
            }
          }}
          disabled={busy || !loaded}
        >
          Aloita uusi luonnos
        </button>
      </footer>
      <dialog ref={dialog} className="cover-finish">
        <button
          className="cover-dialog-close"
          aria-label="Sulje"
          onClick={() => dialog.current?.close()}
        >
          <X size={21} />
        </button>
        <p className="cover-eyebrow">HYVÄ ALKU KIRJALLESI</p>
        <h2>Ota luonnoksesi talteen.</h2>
        <p>
          Esikatselukuva sopii kannen arvioimiseen. Työtiedostolla voit jatkaa
          muokkaamista myöhemmin.
        </p>
        <button
          className="cover-primary"
          onClick={() => void exportPreview()}
          disabled={busy}
        >
          <ArrowDownToLine size={18} />
          {busy
            ? "Valmistellaan…"
            : "Lataa " +
              (view === "front"
                ? "etukannen"
                : view === "back"
                  ? "takakannen"
                  : "koko kannen") +
              " esikatselu"}
        </button>
        <button
          className="cover-secondary"
          aria-label="Lataa työtiedosto"
          onClick={saveProject}
          disabled={busy}
        >
          <ArrowDownToLine size={18} />
          Lataa muokattava työtiedosto
        </button>
        {(notice || error) && (
          <p role={error ? "alert" : "status"}>{error || notice}</p>
        )}
        <button
          className="cover-secondary"
          onClick={() => void exportPdf()}
          disabled={busy}
        >
          Lataa RGB-kansiluonnos PDF:nä (5 mm)
        </button>
        <a
          href="#kannen-tilaus"
          className="cover-primary"
          onClick={() => dialog.current?.close()}
        >
          Jatka painatuspaketin tietoihin
        </a>
        <p className="cover-dialog-warning">
          PDF sisältää takakannen, selän, etukannen ja 5 mm:n leikkuuvarat yllä
          ilmoitetuissa millimetrimitoissa. Tämä on RGB-kuvaksi rasteroitu
          luonnos, ei painovalmis PDF. Ennen painoa tarvitaan
          CMYK-tuotantotaitto, tekstien terävyyden ja kuvien tarkkuuden
          tarkistus. ISBN lisätään tuotannossa. Jos sisus taitetaan vielä,
          sivumäärä ja selkä vahvistetaan taiton jälkeen. Säilytä alkuperäiset
          kuvat.
        </p>
        <Link
          href="/tarjouspyynto"
          className="cover-text-link"
          onClick={() => dialog.current?.close()}
        >
          Haluan apua julkaisun toteuttamiseen <ArrowRight size={16} />
        </Link>
        <small>
          Luonnos ei siirry yhteydenottolomakkeelle automaattisesti.
        </small>
        <button
          className="cover-text-link"
          onClick={() => dialog.current?.close()}
        >
          <ArrowLeft size={15} />
          Jatka suunnittelua
        </button>
      </dialog>
    </div>
  );
}
