import { SOPORTE_WHATSAPP } from "@/lib/constants";
import { waLink } from "@/lib/telefono";

export function FloatingWhatsApp() {
  return (
    <a
      href={`${waLink(SOPORTE_WHATSAPP)}?text=${encodeURIComponent("Hola! Tengo una consulta sobre glob.ar")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center no-underline"
      style={{ boxShadow: "0 8px 24px rgba(37,211,102,.4)" }}
    >
      <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5a6.5 6.5 0 0 0-5.6 9.77L1.5 14.5l3.33-.87A6.5 6.5 0 1 0 8 1.5Z" stroke="white" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M5.6 5.4c.15-.33.4-.33.63-.33h.5c.15 0 .35 0 .5.4.2.5.6 1.4.65 1.5.05.1.08.22.02.35-.06.13-.1.2-.2.32-.1.12-.2.22-.3.3-.1.1-.2.2-.1.4.1.2.5.9 1.1 1.4.75.7 1.35.9 1.55 1 .2.1.32.08.44-.05.13-.13.5-.58.63-.78.13-.2.26-.16.44-.1.18.07 1.14.54 1.34.64.2.1.33.15.38.23.05.1.05.5-.1.98-.16.5-.9.9-1.3.98-.44.1-.86.13-1.9-.35-1.6-.7-2.6-2.3-2.7-2.4-.1-.13-.8-1.05-.8-2 0-.94.5-1.4.66-1.6Z" fill="white"/>
      </svg>
    </a>
  );
}
