import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Hinnat from "./pages/Hinnat";
import Tarjouspyynto from "./pages/Tarjouspyynto";
import Oppaat from "./pages/Oppaat";
import Opas from "./pages/Opas";
import Meista from "./pages/Meista";
import Sopimusehdot from "./pages/Sopimusehdot";
import Yhteystiedot from "./pages/Yhteystiedot";
import CookieBanner from "./components/CookieBanner";
import LataaSivu from "./pages/LataaSivu";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hinnat" component={Hinnat} />
      <Route path="/tarjouspyynto" component={Tarjouspyynto} />
      <Route path="/oppaat" component={Oppaat} />
      <Route path="/oppaat/:slug" component={Opas} />
      <Route path="/meista" component={Meista} />
      <Route path="/sopimusehdot" component={Sopimusehdot} />
      <Route path="/tietosuoja" component={Sopimusehdot} />
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
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
