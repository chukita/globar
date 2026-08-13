import { getTodasLasComisiones } from "@/lib/admin-data";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const STATUS_MAP = {
  pendiente:  { label: "Pendiente",  bg: "#F7F8FA",  fg: "#9AA3B2",  border: "#E9ECEF" },
  generada:   { label: "Generada",   bg: "#E1EFF8",  fg: "#0B5A8F",  border: "#C6DDEF" },
  facturada:  { label: "Facturada",  bg: "#FFF3CD",  fg: "#856404",  border: "#FFD97D" },
  pagada:     { label: "Pagada",     bg: "#E7F5EE",  fg: "#0B6B47",  border: "#9BD3B6" },
  anulada:    { label: "Anulada",    bg: "#FCE6E9",  fg: "#9B4A57",  border: "#E7A9B3" },
} as const;

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default async function AdminComisionesPage() {
  const [cuotas, config] = await Promise.all([getTodasLasComisiones(), getConfiguracion()]);

  const totales = {
    generadas:  cuotas.filter(c => c.status === "generada").length,
    facturadas: cuotas.filter(c => c.status === "facturada").length,
    pagadas:    cuotas.filter(c => c.status === "pagada").length,
    pendientes: cuotas.filter(c => c.status === "pendiente").length,
    anuladas:   cuotas.filter(c => c.status === "anulada").length,
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Comisiones</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Estado de todas las cuotas de comisión por revendedor.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
        {[
          { label: "Generadas",  value: totales.generadas,  color: "#0B5A8F", bg: "#E1EFF8" },
          { label: "Facturadas", value: totales.facturadas, color: "#856404", bg: "#FFF3CD" },
          { label: "Pagadas",    value: totales.pagadas,    color: "#0B6B47", bg: "#E7F5EE" },
          { label: "Pendientes", value: totales.pendientes, color: "#9AA3B2", bg: "#F7F8FA" },
          { label: "Anuladas",   value: totales.anuladas,   color: "#9B4A57", bg: "#FCE6E9" },
        ].map(s => (
          <div key={s.label} className="border rounded-[14px] px-5 py-4" style={{ background: s.bg, borderColor: s.color + "33" }}>
            <div className="font-extrabold text-[28px]" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[13px] font-medium mt-1" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="overflow-x-auto">
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2] min-w-[820px]"
          style={{ display: "grid", gridTemplateColumns: ".8fr 1fr 1.2fr 1fr .7fr .7fr .9fr" }}>
          <span>Cuota</span>
          <span>Revendedor</span>
          <span>Cliente</span>
          <span>Producto</span>
          <span>Período</span>
          <span>Monto</span>
          <span className="text-right">Estado</span>
        </div>
        {cuotas.length === 0 ? (
          <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">Todavía no hay comisiones generadas.</div>
        ) : (
          cuotas.map((c) => {
            const s = STATUS_MAP[c.status];
            return (
              <div key={c.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[13.5px] min-w-[820px]"
                style={{ display: "grid", gridTemplateColumns: ".8fr 1fr 1.2fr 1fr .7fr .7fr .9fr" }}>
                <span className="text-[#9AA3B2]">{c.numeroCuota} / {config.comisionMeses}</span>
                <span className="font-medium text-[#0C2A45]">{c.revendedor}</span>
                <span className="text-[#5B6577]">{c.cliente}</span>
                <span>{c.producto}</span>
                <span className="text-[#5B6577]">{MESES[c.periodoMes - 1]} {c.periodoAnio}</span>
                <span className="font-bold">{fmtARS(Number(c.monto))}</span>
                <span className="text-right">
                  <span className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block border"
                    style={{ background: s.bg, color: s.fg, borderColor: s.border }}>
                    {s.label}
                  </span>
                </span>
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
