import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { GUIDES } from "@/lib/data";
import {
  finnishDate,
  publishedGuides,
  type Guide,
} from "../../../shared/guides";

declare global {
  interface Window {
    __THUNDER_GUIDES__?: Guide[];
  }
}
const GuidesContext = createContext<Guide[] | null>(null);

export function GuidesProvider({
  children,
  initialGuides,
}: {
  children: ReactNode;
  initialGuides?: Guide[];
}) {
  const [guides, setGuides] = useState(
    () =>
      initialGuides ||
      (typeof window !== "undefined" ? window.__THUNDER_GUIDES__ : undefined) ||
      GUIDES
  );
  useEffect(() => {
    let lastDay = "";
    let cancelled = false;
    const refresh = async () => {
      const day = finnishDate();
      if (day === lastDay) return;
      try {
        const result = await fetch("/api/guides", { cache: "no-store" });
        if (!result.ok) return;
        const data = await result.json();
        if (!cancelled && Array.isArray(data.guides)) {
          setGuides(data.guides);
          lastDay = day;
        }
      } catch {
        /* Keep the already public, server-rendered content while offline. */
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return (
    <GuidesContext.Provider value={guides}>{children}</GuidesContext.Provider>
  );
}

export function useGuides() {
  return useContext(GuidesContext) || publishedGuides(GUIDES);
}
