import { Logo } from "./Logo";

export function Footer() {
  return (
    <div className="bg-[#0C2A45]">
      <div className="max-w-[1180px] mx-auto px-8 py-14 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        <div>
          <Logo size="sm" />
          <p className="text-[13.5px] text-[#8595A8] leading-relaxed mt-4 max-w-[240px]">
            Plataforma argentina de reventa de productos digitales SaaS.
          </p>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Producto</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <span>Cómo funciona</span>
            <span>Productos</span>
            <span>Calculadora</span>
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Revendedores</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <span>Registrarse</span>
            <span>Ingresar</span>
            <span>Comisiones</span>
          </div>
        </div>
        <div>
          <div className="text-[13px] font-semibold text-white mb-3.5">Legal</div>
          <div className="flex flex-col gap-2.5 text-[13.5px] text-[#8595A8]">
            <span>Términos</span>
            <span>Privacidad</span>
            <span>Contacto</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/[0.08]">
        <div className="max-w-[1180px] mx-auto px-8 py-5 text-[12.5px] text-[#6B7B8E]">
          © 2026 glob.ar — Hecho en Argentina 🇦🇷
        </div>
      </div>
    </div>
  );
}
