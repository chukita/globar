import Link from "next/link";
import { MOCK_TOTALS, MOCK_FACTURAS, MOCK_VENTAS } from "@/lib/mock-admin";
import { fmtARS, COMMISSION_PER_MONTH } from "@/lib/constants";

const STAT_CARDS = [
  { label: "Ventas totales",          value: String(MOCK_TOTALS.ventasTotales),     accent: "#0C2A45", sub: "todos los productos" },
  { label: "Revendedores activos",    value: String(MOCK_TOTALS.revendedoresActivos), accent: "#0B5A8F", sub: "con ventas registradas" },
  { label: "Comisiones pagadas",      value: MOCK_TOTALS.comisionesPagadas,         accent: "#0B6B47", sub: "acumulado histórico" },
  { label: "Facturas por pagar",      value: String(MOCK_TOTALS.facturasPendientes), accent: "#9B4A57", sub: MOCK_TOTALS.comisionesPorPagar + " pendientes" },
];

export default function AdminDashboard() {
  const facturasPendientes = MOCK_FACTURAS.filter(f => !f.pagada);
  const ultimasVentas = MOCK_VENTAS.slice(0, 5);

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Dashboard</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Resumen general de ventas, comisiones y pagos pendientes.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
            <div className="text-[13px] text-[#5B6577] font-medium">{s.label}</div>
            <div className="font-extrabold text-[30px] mt-2" style={{ letterSpacing: "-0.02em", color: s.accent }}>{s.value}</div>
            <div className="text-[12px] text-[#9AA3B2] mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1.2fr_1fr] gap-5 mt-5">

        {/* Facturas pendientes */}
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <span className="font-semibold text-[17px]">Facturas por pagar</span>
            <Link href="/admin/facturas" className="text-[13px] font-semibold text-[#0B5A8F]">Ver todas</Link>
          </div>
          {facturasPendientes.length === 0 ? (
            <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">No hay facturas pendientes.</div>
          ) : (
            facturasPendientes.map((f) => (
              <div key={f.id} className="px-6 py-4 border-t border-[#F1F3F5] first:border-t-0 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[14.5px]">{f.revendedor}</div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">{f.nota} · Subida {f.subida}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-bold text-[16px] text-[#0C2A45]">{fmtARS(f.monto)}</span>
                  <Link href="/admin/facturas"
                    className="text-[12.5px] font-semibold bg-[#0E6BA8] text-white rounded-[9px] px-3.5 py-2">
                    Pagar
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Últimas ventas */}
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <span className="font-semibold text-[17px]">Últimas ventas</span>
            <Link href="/admin/ventas" className="text-[13px] font-semibold text-[#0B5A8F]">Ver todas</Link>
          </div>
          {ultimasVentas.map((v) => (
            <div key={v.id} className="px-6 py-3.5 border-t border-[#F1F3F5] first:border-t-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[14px]">{v.cliente}</div>
                  <div className="text-[12px] text-[#9AA3B2] mt-0.5">{v.producto} · {v.revendedor}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-[12px] text-[#9AA3B2]">{v.fecha}</div>
                  <div className={`text-[11.5px] font-semibold mt-0.5 ${v.activa ? "text-[#0B6B47]" : "text-[#9AA3B2]"}`}>
                    {v.activa ? "Activa" : "Inactiva"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
