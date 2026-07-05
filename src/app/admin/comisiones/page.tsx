import { MOCK_CUOTAS } from "@/lib/mock-admin";
import { fmtARS } from "@/lib/constants";

const STATUS_MAP = {
  pendiente:  { label: "Pendiente",  bg: "#F7F8FA",  fg: "#9AA3B2",  border: "#E9ECEF" },
  generada:   { label: "Generada",   bg: "#E1EFF8",  fg: "#0B5A8F",  border: "#C6DDEF" },
  facturada:  { label: "Facturada",  bg: "#FFF3CD",  fg: "#856404",  border: "#FFD97D" },
  pagada:     { label: "Pagada",     bg: "#E7F5EE",  fg: "#0B6B47",  border: "#9BD3B6" },
} as const;

type CuotaStatus = keyof typeof STATUS_MAP;

const FILTERS: { key: CuotaStatus | "todas"; label: string }[] = [
  { key: "todas",     label: "Todas"     },
  { key: "generada",  label: "Generadas" },
  { key: "facturada", label: "Facturadas"},
  { key: "pagada",    label: "Pagadas"   },
  { key: "pendiente", label: "Pendientes"},
];

export default function AdminComisionesPage() {
  // En producción esto vendría con searchParams para filtrar
  const cuotas = MOCK_CUOTAS;

  const totales = {
    generadas:  cuotas.filter(c => c.status === "generada").length,
    facturadas: cuotas.filter(c => c.status === "facturada").length,
    pagadas:    cuotas.filter(c => c.status === "pagada").length,
    pendientes: cuotas.filter(c => c.status === "pendiente").length,
  };

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Comisiones</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Estado de todas las cuotas de comisión por revendedor.</p>
        </div>
        <button className="font-semibold text-sm bg-white border border-[#DCE0E5] rounded-[10px] px-4 py-2.5 cursor-pointer">
          Exportar CSV
        </button>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {[
          { label: "Generadas",  value: totales.generadas,  color: "#0B5A8F", bg: "#E1EFF8" },
          { label: "Facturadas", value: totales.facturadas, color: "#856404", bg: "#FFF3CD" },
          { label: "Pagadas",    value: totales.pagadas,    color: "#0B6B47", bg: "#E7F5EE" },
          { label: "Pendientes", value: totales.pendientes, color: "#9AA3B2", bg: "#F7F8FA" },
        ].map(s => (
          <div key={s.label} className="border rounded-[14px] px-5 py-4" style={{ background: s.bg, borderColor: s.color + "33" }}>
            <div className="font-extrabold text-[28px]" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[13px] font-medium mt-1" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: ".8fr 1fr 1.2fr 1fr .7fr .7fr .9fr" }}>
          <span>Cuota</span>
          <span>Revendedor</span>
          <span>Cliente</span>
          <span>Producto</span>
          <span>Mes</span>
          <span>Monto</span>
          <span className="text-right">Estado</span>
        </div>
        {cuotas.map((c) => {
          const s = STATUS_MAP[c.status as CuotaStatus];
          return (
            <div key={c.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[13.5px]"
              style={{ display: "grid", gridTemplateColumns: ".8fr 1fr 1.2fr 1fr .7fr .7fr .9fr" }}>
              <span className="text-[#9AA3B2]">{c.cuota} / 6</span>
              <span className="font-medium text-[#0C2A45]">{c.revendedor}</span>
              <span className="text-[#5B6577]">{c.cliente}</span>
              <span>{c.producto}</span>
              <span className="text-[#5B6577]">{c.mes}</span>
              <span className="font-bold">{fmtARS(c.monto)}</span>
              <span className="text-right">
                <span className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block border"
                  style={{ background: s.bg, color: s.fg, borderColor: s.border }}>
                  {s.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
