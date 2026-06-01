import { useEffect } from "react";
import { useLocation } from "wouter";
import { useSEO } from "@/hooks/useSEO";

export default function TietosuojaRedirect() {
  useSEO({
    title: "Tietosuoja — Thunder Kustannus",
    description: "Thunder Kustannuksen tietosuojaseloste.",
    canonical: "/sopimusehdot",
    noIndex: true,
  });

  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/sopimusehdot");
  }, [setLocation]);

  return null;
}
