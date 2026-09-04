import Link from "next/link";
import { getDashboardStats, getLiquidacionesEsperandoFacturaResumen, getUltimasVentas, periodoLabel } from "@/lib/admin-data";
import { fmtARS } from "@/lib/constants";
import { esSuscripcionActiva } from "@/lib/estadoSuscripcion";

export const dynamic = "force-dynamic";

/**
 * Función aparte para que `new Date()` no quede dentro del cuerpo del
 * componente (react-hooks/purity) — mismo patrón que panel/clientes.
 */
function conEstadoSuscripcion<T extends { ultimoPagoEn: Date }>(rows: T[]) {
  const ahora = new Date();
  return rows.map((v) => ({ ...v, activa: esSuscripcionActiva(v.ultimoPagoEn, ahora) }));
}

export default async function AdminDashboard() {
  const [stats, esperandoFactura, ultimasVentasRaw] = await Promise.all([
    getDashboardStats(),
    getLiquidacionesEsperandoFacturaResumen(),
    getUltimasVentas(),
  ]);
  const ultimasVentas = conEstadoSuscripcion(ultimasVentasRaw);

  const statCards = [
    { label: "Ventas totales",         value: String(stats.ventasTotales),          accent: "#0C2A45", sub: "todos los productos" },
    { label: "Revendedores activos",   value: String(stats.revendedoresActivos),    accent: "#0B5A8F", sub: "con cuenta activa" },
    { label: "Comisiones liquidadas",  value: fmtARS(stats.comisionesLiquidadas),   accent: "#0B6B47", sub: "acumulado histórico" },
    { label: "Facturas pendientes",    value: String(stats.facturasPendientes),     accent: "#9B4A57", sub: "liquidaciones sin factura" },
  ];

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Dashboard</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Resumen general de ventas, comisiones y pagos pendientes.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
            <div className="text-[13px] text-[#5B6577] font-medium">{s.label}</div>
            <div className="font-extrabold text-[30px] mt-2" style={{ letterSpacing: "-0.02em", color: s.accent }}>{s.value}</div>
            <div className="text-[12px] text-[#9AA3B2] mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 mt-5">
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <span className="font-semibold text-[17px]">Facturas pendientes</span>
            <Link href="/admin/liquidaciones" className="text-[13px] font-semibold text-[#0B5A8F]">Ver todas</Link>
          </div>
          {esperandoFactura.length === 0 ? (
            <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">No hay liquidaciones esperando factura.</div>
          ) : (
            esperandoFactura.map((f) => {
              const vencida = new Date(f.facturaVenceEn) < new Date();
              return (
                <div key={f.id} className="px-6 py-4 border-t border-[#F1F3F5] first:border-t-0 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold text-[14.5px]">{f.revendedorNombre} <span className="text-[#9AA3B2] font-normal">· {f.revendedor}</span></div>
                    <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                      {periodoLabel(f.periodoMes, f.periodoAnio)} · vence {new Date(f.facturaVenceEn).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-bold text-[16px] text-[#0C2A45]">{fmtARS(Number(f.monto))}</span>
                    {vencida && (
                      <span className="text-[11.5px] font-semibold bg-[#FCE6E9] text-[#9B4A57] rounded-[9px] px-2.5 py-1">Vencida</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#EEF0F2] flex items-center justify-between">
            <span className="font-semibold text-[17px]">Últimas ventas</span>
            <Link href="/admin/ventas" className="text-[13px] font-semibold text-[#0B5A8F]">Ver todas</Link>
          </div>
          {ultimasVentas.length === 0 ? (
            <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">Todavía no hay ventas registradas.</div>
          ) : (
            ultimasVentas.map((v) => (
              <div key={v.id} className="px-6 py-3.5 border-t border-[#F1F3F5] first:border-t-0">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[14px]">{v.cliente}</div>
                    <div className="text-[12px] text-[#9AA3B2] mt-0.5">{v.producto} · {v.revendedor ?? "sin revendedor"}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[12px] text-[#9AA3B2]">{new Date(v.fecha).toLocaleDateString("es-AR")}</div>
                    <div className={`text-[11.5px] font-semibold mt-0.5 ${v.activa ? "text-[#0B6B47]" : "text-[#9AA3B2]"}`}>
                      {v.activa ? "Activa" : "Inactiva"}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
