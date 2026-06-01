import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSEO } from "@/hooks/useSEO";

export default function ArvioRedirect() {
  useSEO({
    title: "Ilmainen arvio — Thunder Kustannus",
    description: "Pyydä ilmainen arvio kirjaprojektistasi.",
    canonical: "/tarjouspyynto",
    noIndex: true,
  });

  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/tarjouspyynto");
  }, [setLocation]);

  return null;
}
