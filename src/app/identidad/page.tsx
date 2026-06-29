import { Logo } from "@/components/Logo";
import { PALETTE, PRODUCTS, MONTHLY_PRICE, COMMISSION_PER_MONTH, fmtARS } from "@/lib/constants";

export default function IdentidadPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      {/* Nav */}
      <div className="sticky top-0 z-[90] flex items-center gap-[18px] px-5 py-2.5 bg-[#0C2A45] border-b border-white/[0.08] flex-wrap">
        <div className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-[#8595A8] text-xs ml-0.5">sistema de diseño</span>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-8 py-14 pb-24">
        <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8]">Sistema visual</div>
        <h1 className="font-extrabold text-[46px] leading-[1.04] mt-2.5 mb-0 max-w-[640px]" style={{ letterSpacing: "-0.025em" }}>
          La identidad de glob.ar
        </h1>
        <p className="text-[17px] text-[#5B6577] max-w-[560px] mt-3.5 mb-0 leading-[1.55]">
          Moderna, confiable y con energía de startup. Azul de protagonista, rosa como acento cálido y una tipografía clara.
        </p>

        {/* Logo + Typography */}
        <div className="mt-11 grid gap-5" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-9">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2]">Logo</div>
            <div className="flex items-center gap-4 mt-6">
              <Logo size="lg" darkText />
            </div>
            <div className="flex gap-3.5 mt-7">
              <div className="flex-1 bg-[#0C2A45] rounded-[14px] p-[22px] flex items-center justify-center">
                <Logo size="sm" />
              </div>
              <div className="w-[72px] bg-[#FADADD] rounded-[14px] flex items-center justify-center relative">
                <span className="font-bold text-[#9B4A57] text-[34px]">g</span>
                <span className="absolute right-3 bottom-3.5 w-[7px] h-[7px] rounded-full bg-[#9B4A57]" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-9">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2]">Tipografía</div>
            <div className="mt-5">
              <div className="text-xs text-[#9AA3B2] font-semibold">Open Sans — títulos · Bold/Extrabold</div>
              <div className="font-extrabold text-[40px] leading-none mt-1.5" style={{ letterSpacing: "-0.02em" }}>Aa Gg 123</div>
            </div>
            <div className="mt-6 border-t border-[#EEF0F2] pt-5">
              <div className="text-xs text-[#9AA3B2] font-semibold">Open Sans — cuerpo · Regular/Medium</div>
              <div className="text-base leading-relaxed mt-2 text-[#5B6577]">
                Vendé herramientas digitales y cobrá comisiones recurrentes. El texto se mantiene legible en cualquier tamaño.
              </div>
            </div>
          </div>
        </div>

        {/* Palette */}
        <div className="mt-5 bg-white border border-[#E9ECEF] rounded-[20px] p-9">
          <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2]">Paleta</div>
          <div className="grid grid-cols-6 gap-3.5 mt-5">
            {PALETTE.map((c) => (
              <div key={c.hex} className="rounded-[14px] overflow-hidden border border-[#EEF0F2]">
                <div className="h-[74px] flex items-end p-2.5 text-[11px] font-semibold" style={{ background: c.hex, color: c.fg }}>
                  {c.hex}
                </div>
                <div className="px-3 py-2.5 text-xs font-semibold text-[#5B6577]">{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons + Card */}
        <div className="mt-5 grid grid-cols-2 gap-5">
          <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-9">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2]">Botones</div>
            <div className="flex flex-wrap gap-3 items-center mt-5">
              <span className="font-semibold text-[15px] bg-[#0E6BA8] text-white rounded-xl px-[22px] py-3">Empezá gratis</span>
              <span className="font-semibold text-[15px] bg-[#0C2A45] text-white rounded-xl px-[22px] py-3">Ver panel</span>
              <span className="font-semibold text-[15px] bg-[#FADADD] text-[#9B4A57] rounded-xl px-[22px] py-3">Rosa</span>
              <span className="font-semibold text-[15px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-[21px] py-[11px]">Secundario</span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2] mt-7">Badges de estado</div>
            <div className="flex flex-wrap gap-2.5 mt-4">
              <span className="text-[12.5px] font-semibold bg-[#E1EFF8] text-[#0B5A8F] rounded-full px-3 py-1.5">Pagado</span>
              <span className="text-[12.5px] font-semibold bg-[#0C2A45] text-white rounded-full px-3 py-1.5">Próximo</span>
              <span className="text-[12.5px] font-semibold bg-[#FCE6E9] text-[#9B4A57] rounded-full px-3 py-1.5">Pendiente</span>
            </div>
          </div>
          <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-9">
            <div className="text-xs font-semibold uppercase tracking-[.1em] text-[#9AA3B2]">Card de producto</div>
            <div className="mt-5 border border-[#E9ECEF] rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[19px]">agendaonline</span>
                <span className="text-[11.5px] font-semibold bg-[#E1EFF8] text-[#0B5A8F] rounded-full px-3 py-1">Turnos</span>
              </div>
              <p className="text-sm text-[#5B6577] leading-relaxed my-2.5">Sistema de reservas y gestión de turnos.</p>
              <div className="flex justify-between items-end border-t border-[#EEF0F2] pt-3.5">
                <div>
                  <div className="text-[11px] text-[#9AA3B2]">Suscripción</div>
                  <div className="font-bold text-[20px]">{fmtARS(MONTHLY_PRICE)}<span className="text-xs text-[#9AA3B2] font-medium">/mes</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#9AA3B2]">Tu comisión</div>
                  <div className="font-bold text-[20px] text-[#0B5A8F]">{fmtARS(COMMISSION_PER_MONTH)}<span className="text-xs text-[#9AA3B2] font-medium">/mes</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
