import Link from "next/link";
import { Logo } from "./Logo";
import { SOPORTE_WHATSAPP } from "@/lib/constants";
import { waLink } from "@/lib/telefono";

export function Footer() {
  return (
    <div className="bg-[#0C2A45]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-14 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        <div>
          <Logo size="sm" />
          <p className="text-[13.5px] text-[#8595A8] leading-relaxed mt-4 max-w-[240px]">
            Plataforma argentina de reventa de productos digitales SaaS.
          </p>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Producto</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <Link href="/#como-funciona" className="hover:text-white">Cómo funciona</Link>
            <Link href="/#productos" className="hover:text-white">Productos</Link>
            <Link href="/#calculadora" className="hover:text-white">Calculadora</Link>
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Revendedores</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <Link href="/registro" className="hover:text-white">Registrarse</Link>
            <Link href="/login" className="hover:text-white">Ingresar</Link>
            <Link href="/panel/comisiones" className="hover:text-white">Comisiones</Link>
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Legal</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <Link href="/terminos" className="hover:text-white">Términos</Link>
            <Link href="/privacidad" className="hover:text-white">Privacidad</Link>
            <a href="mailto:hola@glob.ar" className="hover:text-white">Contacto</a>
            <a href={waLink(SOPORTE_WHATSAPP)} target="_blank" rel="noreferrer" className="hover:text-white">WhatsApp</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.08]">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-5 text-[12.5px] text-[#6B7B8E]">
          © 2026 glob.ar — Hecho en Argentina 🇦🇷
        </div>
      </div>
    </div>
  );
}
