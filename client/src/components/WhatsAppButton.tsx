// Thunder Kustannus — Kelluva WhatsApp-nappi
import { useState } from "react";
import { useLang } from "@/contexts/LanguageContext";

const PHONE = "358403519546";

const FI_MESSAGE = "Hei! Haluaisin tietää lisää kirjan julkaisemisesta.";
const EN_MESSAGE = "Hi! I'd like to know more about publishing my book.";

export default function WhatsAppButton() {
  const { lang } = useLang();
  const [hovered, setHovered] = useState(false);

  const message = lang === "en" ? EN_MESSAGE : FI_MESSAGE;
  const label = lang === "en"
    ? "Let's talk about your book →"
    : "Jutellaan kirjastasi →";
  const tooltip = lang === "en"
    ? "Chat with us on WhatsApp"
    : "Kirjoita meille WhatsAppiin";

  const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tooltip}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group"
      style={{ filter: "drop-shadow(0 4px 16px rgba(37,211,102,0.35))" }}
    >
      {/* Tooltip label — näkyy hover-tilassa */}
      <span
        className="text-sm font-semibold text-white bg-[#25D366] px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0)" : "translateX(12px)",
          pointerEvents: "none",
        }}
      >
        {label}
      </span>

      {/* WhatsApp-ikoni */}
      <div
        className="w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
      >
        {/* WhatsApp SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.363.627 4.673 1.82 6.7L2.667 29.333l6.82-1.787A13.28 13.28 0 0 0 16.003 29.333c7.363 0 13.33-5.97 13.33-13.333S23.366 2.667 16.003 2.667zm0 24c-2.133 0-4.22-.573-6.053-1.66l-.433-.26-4.047 1.06 1.08-3.94-.28-.453A10.617 10.617 0 0 1 5.333 16c0-5.88 4.787-10.667 10.67-10.667S26.67 10.12 26.67 16 21.883 26.667 16.003 26.667zm5.853-7.987c-.32-.16-1.893-.933-2.187-1.04-.293-.107-.507-.16-.72.16-.213.32-.827 1.04-.013 1.253.293.107 1.013.347 1.92.213.907-.133 1.547-.507 2.173-1.04.627-.533.987-1.227 1.12-1.547.133-.32.013-.493-.107-.653-.12-.16-.293-.213-.507-.32zm-5.853 8c-1.88 0-3.72-.507-5.333-1.467l-.38-.227-3.947 1.033.947-3.467-.24-.387A10.573 10.573 0 0 1 5.333 16c0-5.88 4.787-10.667 10.67-10.667S26.67 10.12 26.67 16 21.883 26.667 16.003 26.667z" />
          <path d="M21.44 18.88c-.307-.153-1.813-.893-2.093-.993-.28-.1-.48-.153-.68.153-.2.307-.773.993-.947 1.2-.173.2-.347.22-.653.067-.307-.153-1.293-.477-2.46-1.52-.907-.813-1.52-1.813-1.7-2.12-.18-.307-.02-.473.133-.627.14-.133.307-.347.46-.52.153-.173.2-.293.307-.493.1-.2.053-.373-.027-.527-.08-.153-.68-1.64-.933-2.247-.247-.587-.493-.507-.68-.517-.173-.007-.373-.013-.573-.013-.2 0-.527.073-.8.373-.273.3-1.047 1.02-1.047 2.493s1.073 2.893 1.22 3.093c.147.2 2.107 3.213 5.107 4.507.713.307 1.267.493 1.7.633.713.227 1.367.193 1.88.12.573-.087 1.767-.72 2.02-1.42.253-.7.253-1.3.173-1.42-.08-.12-.28-.2-.587-.353z" />
        </svg>
      </div>
    </a>
  );
}
