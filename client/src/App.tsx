import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Hinnat from "./pages/Hinnat";
import Kirjat from "./pages/Kirjat";
import Tarjouspyynto from "./pages/Tarjouspyynto";
import Oppaat from "./pages/Oppaat";
import Opas from "./pages/Opas";
import Meista from "./pages/Meista";
import Sopimusehdot from "./pages/Sopimusehdot";
import Yhteystiedot from "./pages/Yhteystiedot";
import CookieBanner from "./components/CookieBanner";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import LataaSivu from "./pages/LataaSivu";
import ArvioRedirect from "./pages/ArvioRedirect";
import TietosuojaRedirect from "./pages/TietosuojaRedirect";
import TilausKiitos from "./pages/TilausKiitos";
import Asiantuntijakirja from "./pages/Asiantuntijakirja";
import Julkaisutesti from "./pages/Julkaisutesti";
import QuizPrivacy from "./pages/QuizPrivacy";
const Kansisuunnittelija = lazy(() => import("./pages/Kansisuunnittelija"));
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hinnat" component={Hinnat} />
      {Kansisuunnittelija && (
        <Route path="/kansisuunnittelija">
          <Suspense
            fallback={<div className="p-24">Avataan kansistudiota…</div>}
          >
            <Kansisuunnittelija />
          </Suspense>
        </Route>
      )}
      <Route path="/julkaisutesti" component={Julkaisutesti} />
      <Route path="/asiantuntijakirja" component={Asiantuntijakirja} />
      <Route path="/tilaus-kiitos" component={TilausKiitos} />
      <Route path="/kiitos" component={TilausKiitos} />
      <Route path="/kirjat" component={Kirjat} />
      <Route path="/tarjouspyynto" component={Tarjouspyynto} />
      <Route path="/arvio" component={ArvioRedirect} />
      <Route path="/oppaat" component={Oppaat} />
      <Route path="/oppaat/:slug" component={Opas} />
      <Route path="/meista" component={Meista} />
      <Route path="/sopimusehdot" component={Sopimusehdot} />
      <Route path="/tietosuoja" component={QuizPrivacy} />
      <Route path="/yhteystiedot" component={Yhteystiedot} />
      <Route path="/lataa-opas" component={LataaSivu} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
          <CookieBanner />
          <WhatsAppButton />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
