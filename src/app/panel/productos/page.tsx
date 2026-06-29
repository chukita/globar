import Link from "next/link";
import { COMMISSION_PER_MONTH, COMMISSION_PER_SALE, fmtARS } from "@/lib/constants";

export default function ProductosPage() {
  return (
    <div className="p-10 max-w-[920px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Mis productos</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Solo podés ofrecer los productos para los que completaste la capacitación y fuiste dado de alta en el sistema.
      </p>

      {/* Flow explainer */}
      <div className="mt-6 bg-white border border-[#E9ECEF] rounded-[18px] px-6 py-[22px] flex items-center gap-2.5 flex-wrap">
        {[
          { n: "1", label: "Aprobá la capacitación", done: false },
          { n: "2", label: "Quedás dado de alta en el sistema", done: false },
          { n: "3", label: "Podés ofrecer el producto y cobrar comisiones", done: true },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="w-7 h-px bg-[#DCE0E5] flex-shrink-0" />}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-extrabold"
                style={{ background: step.done ? "#0E6BA8" : "#E1EFF8", color: step.done ? "#fff" : "#0B5A8F" }}>
                {step.n}
              </div>
              <span className="text-[13.5px]" style={{ fontWeight: step.done ? 600 : 500, color: step.done ? "#0C2A45" : "#5B6577" }}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Product cards */}
      <div className="grid grid-cols-2 gap-5 mt-6">

        {/* agendaonline — habilitado */}
        <div className="bg-white border-2 border-[#9BD3B6] rounded-[22px] p-7 relative overflow-hidden">
          <div className="absolute -top-10 -right-8 w-[150px] h-[150px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(27,148,98,.1),transparent 70%)" }} />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-[13px] bg-[#E1EFF8] flex items-center justify-center font-extrabold text-[20px] text-[#0B5A8F]">a</div>
              <span className="text-xs font-bold bg-[#E7F5EE] text-[#0B6B47] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-[#1B9462]" />
                Habilitado
              </span>
            </div>
            <h2 className="font-extrabold text-[22px] mt-4 mb-0.5" style={{ letterSpacing: "-0.02em" }}>agendaonline</h2>
            <div className="text-[13px] text-[#9AA3B2]">agendaonline.com.ar</div>
            <p className="text-[14.5px] text-[#5B6577] leading-[1.55] mt-3 mb-0">
              Sistema de reservas y gestión de turnos. Podés ofrecer este producto y registrar ventas con tu código.
            </p>
            <div className="mt-4 bg-[#F1F8F4] border border-[#C6E8D4] rounded-xl px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[11.5px] text-[#5B8A6A] font-semibold">Comisión por venta</div>
                <div className="font-extrabold text-[22px] text-[#0B6B47]">{fmtARS(COMMISSION_PER_SALE)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11.5px] text-[#5B8A6A] font-semibold">Por mes × 3</div>
                <div className="font-bold text-base text-[#1B9462]">{fmtARS(COMMISSION_PER_MONTH)}</div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-4">
              <Link href="/panel/perfil"
                className="flex-1 font-semibold text-sm bg-[#0E6BA8] text-white rounded-xl py-3 text-center">
                Ver mi código
              </Link>
              <Link href="/panel/comisiones"
                className="flex-1 font-semibold text-sm bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl py-[11px] text-center">
                Ver comisiones
              </Link>
            </div>
          </div>
        </div>

        {/* nume — bloqueado */}
        <div className="bg-[#FAFBFC] border border-[#E9ECEF] rounded-[22px] p-7 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-[13px] bg-[#FCE6E9] flex items-center justify-center font-extrabold text-[20px] text-[#9B4A57]">n</div>
              <span className="text-xs font-bold bg-[#F7F8FA] text-[#9AA3B2] border border-[#E9ECEF] rounded-full px-3 py-1.5 flex items-center gap-1.5">
                <span className="w-[7px] h-[7px] rounded-full bg-[#C8D0D8]" />
                No habilitado
              </span>
            </div>
            <h2 className="font-extrabold text-[22px] mt-4 mb-0.5 text-[#6B7280]" style={{ letterSpacing: "-0.02em" }}>nume</h2>
            <div className="text-[13px] text-[#B0B8C4]">nume.com.ar</div>
            <p className="text-[14.5px] text-[#9AA3B2] leading-[1.55] mt-3 mb-0">
              Carta digital para restaurantes. Para ofrecer este producto necesitás aprobar la capacitación correspondiente.
            </p>
            <div className="mt-4 bg-[#F0F2F5] border border-dashed border-[#C8D0D8] rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E2E6EB] flex-shrink-0 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA3B2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#6B7280]">Requiere capacitación aprobada</div>
                <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">Completá el módulo de formación para habilitarte.</div>
              </div>
            </div>
            <div className="mt-3.5 bg-white border border-[#E9ECEF] rounded-xl px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[9px] bg-[#FCE6E9] flex items-center justify-center">
                  <span className="text-xs font-extrabold text-[#9B4A57]">!</span>
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-[#6B7280]">Capacitación pendiente</div>
                  <div className="text-xs text-[#9AA3B2]">Video + evaluación</div>
                </div>
              </div>
              <Link href="/panel/capacitacion"
                className="font-semibold text-[13px] bg-[#0E6BA8] text-white rounded-[9px] px-[15px] py-2.5 whitespace-nowrap">
                Iniciar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-[10px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[15px]">i</div>
        <p className="text-[13.5px] text-[#3F6280] leading-relaxed m-0">
          Cada producto tiene su propio módulo de capacitación. Una vez aprobado, tu código queda habilitado automáticamente para registrar ventas de ese producto.
        </p>
      </div>
    </div>
  );
}
