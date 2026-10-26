import { GuidesProvider } from "./contexts/GuidesContext";
import type { Guide } from "../../shared/guides";
import { renderToString } from "react-dom/server";
import { Router, Route, Switch } from "wouter";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ServerSEO, type SEOProps } from "./hooks/useSEO";
import Home from "./pages/Home";
import Hinnat from "./pages/Hinnat";
import Meista from "./pages/Meista";
import Kirjat from "./pages/Kirjat";
import Oppaat from "./pages/Oppaat";
import Opas from "./pages/Opas";
import Asiantuntijakirja from "./pages/Asiantuntijakirja";
import Julkaisutesti from "./pages/Julkaisutesti";
import Kansisuunnittelija from "./pages/Kansisuunnittelija";
import QuizPrivacy from "./pages/QuizPrivacy";
import { GUIDES } from "./lib/data";

const paths = new Set([
  "/",
  "/hinnat",
  "/meista",
  "/kirjat",
  "/oppaat",
  "/asiantuntijakirja",
  "/julkaisutesti",
  "/kansisuunnittelija",
  "/tietosuoja",
]);
export function renderPage(
  url: string,
  guides: Guide[] = GUIDES
): { body: string; seo: SEOProps } | null {
  const pathname =
    new URL(url, "https://thunderkustannus.fi").pathname.replace(/\/+$/, "") ||
    "/";
  if (
    !paths.has(pathname) &&
    !guides.some(guide => pathname === `/oppaat/${guide.slug}`)
  )
    return null;
  const metadata: { current?: SEOProps } = {};
  const body = renderToString(
    <ServerSEO.Provider value={metadata}>
      <LanguageProvider>
        <GuidesProvider initialGuides={guides}>
          <ThemeProvider defaultTheme="dark">
            <Router ssrPath={pathname}>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/hinnat" component={Hinnat} />
                <Route path="/julkaisutesti" component={Julkaisutesti} />
                <Route
                  path="/kansisuunnittelija"
                  component={Kansisuunnittelija}
                />
                <Route path="/tietosuoja" component={QuizPrivacy} />
                <Route path="/meista" component={Meista} />
                <Route path="/kirjat" component={Kirjat} />
                <Route path="/oppaat" component={Oppaat} />
                <Route path="/oppaat/:slug" component={Opas} />
                <Route
                  path="/asiantuntijakirja"
                  component={Asiantuntijakirja}
                />
              </Switch>
            </Router>
          </ThemeProvider>
        </GuidesProvider>
      </LanguageProvider>
    </ServerSEO.Provider>
  );
  if (!metadata.current)
    throw new Error(`Missing page metadata for ${pathname}`);
  return {
    body,
    seo: {
      ...metadata.current,
      noIndex:
        metadata.current.noIndex ||
        import.meta.env.VITE_EDITORIAL_PREVIEW === "true",
    },
  };
}
