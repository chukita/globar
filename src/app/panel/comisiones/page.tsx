import { auth } from "@/lib/auth";
import { ensureRevendedor } from "@/lib/revendedor";
import { getComisionesDelRevendedor, getVentasDelRevendedor, getRevendedorStats } from "@/lib/panel-data";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const STATUS_MAP = {
  pendiente: { label: "Pendiente", bg: "#FCE6E9", fg: "#9B4A57" },
  generada:  { label: "Por cobrar", bg: "#0C2A45", fg: "#FFFFFF" },
  facturada: { label: "Facturada", bg: "#FFF4E0", fg: "#8A5A0B" },
  pagada:    { label: "Pagado",    bg: "#E1EFF8", fg: "#0B5A8F" },
} as const;

const SALE_STATUS = {
  activa:     { label: "Comisión activa", bg: "#E1EFF8", fg: "#0B5A8F", dot: "#0E6BA8" },
  finalizada: { label: "Finalizada",      bg: "#EEF0F2", fg: "#5B6577", dot: "#9AA3B2" },
} as const;

export default async function ComisionesPage() {
  const session = await auth();
  const revendedor = await ensureRevendedor(session!.user!.id!, session!.user!.name, session!.user!.email!);
  const [comisiones, ventas, stats, config] = await Promise.all([
    getComisionesDelRevendedor(revendedor.id),
    getVentasDelRevendedor(revendedor.id),
    getRevendedorStats(revendedor.id),
    getConfiguracion(),
  ]);

  const porCobrar = comisiones.filter((c) => c.status === "generada");
  const totalPorCobrar = porCobrar.reduce((sum, c) => sum + Number(c.monto), 0);

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Estado de comisiones</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Seguimiento de tus comisiones por cobrar y el historial de ventas.</p>
        </div>
      </div>

      {/* Por cobrar banner */}
      {porCobrar.length > 0 && (
        <div className="mt-6 bg-[#0C2A45] rounded-[18px] px-[26px] py-[22px] flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[30px] w-[220px] h-[220px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-[13px] flex items-center justify-center"
              style={{ background: "rgba(14,107,168,.24)" }}>
              <span className="w-3.5 h-3.5 rounded-full bg-[#0E6BA8]" />
            </div>
            <div>
              <div className="text-[13px] text-[#9DB0C4] font-semibold">Comisiones por cobrar</div>
              <div className="font-semibold text-[17px] text-white mt-0.5">{porCobrar.length} cuota{porCobrar.length !== 1 ? "s" : ""} generada{porCobrar.length !== 1 ? "s" : ""}</div>
            </div>
          </div>
          <div className="relative text-right">
            <div className="font-extrabold text-[30px] text-[#BBD9EE]" style={{ letterSpacing: "-0.02em" }}>
              {fmtARS(totalPorCobrar)}
            </div>
            <div className="text-[12.5px] text-[#9DB0C4]">Subí la factura en &quot;Facturas&quot; para cobrarlas</div>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {[
          { label: "Cobrado (histórico)",  value: fmtARS(stats.comisionesCobradas),   sub: "cuotas pagadas",             accent: "#0B5A8F" },
          { label: "Por cobrar",           value: fmtARS(stats.comisionesPendientes), sub: `${porCobrar.length} cuotas`, accent: "#0C2A45" },
          { label: "Comisión vigente",     value: `${fmtARS(Number(config.comisionMonto))} × ${config.comisionMeses}`, sub: "monto × meses por venta", accent: "#9B4A57" },
        ].map((t) => (
          <div key={t.label} className="bg-white border border-[#E9ECEF] rounded-2xl p-[22px]">
            <div className="text-[13px] text-[#5B6577] font-medium">{t.label}</div>
            <div className="font-extrabold text-[26px] mt-2" style={{ letterSpacing: "-0.02em", color: t.accent }}>{t.value}</div>
            <div className="text-[12.5px] text-[#9AA3B2] mt-1">{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Commissions table */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">Comisiones por cuota</div>
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
          <span>Período</span><span>Cliente</span><span>Producto</span><span>Monto</span><span className="text-right">Estado</span>
        </div>
        {comisiones.length === 0 ? (
          <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">Todavía no tenés comisiones generadas.</div>
        ) : (
          comisiones.map((r) => {
            const s = STATUS_MAP[r.status];
            return (
              <div key={r.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
                style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
                <span className="font-semibold">{MESES[r.periodoMes - 1]} {r.periodoAnio}</span>
                <span className="text-[#5B6577]">{r.cliente}</span>
                <span className="text-[#0C2A45] font-medium">{r.producto}</span>
                <span className="font-bold">{fmtARS(Number(r.monto))}</span>
                <span className="text-right">
                  <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-block"
                    style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Sales history */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] flex items-center justify-between">
          <span className="font-semibold text-[17px]">Historial de ventas</span>
          <span className="text-[12.5px] text-[#9AA3B2]">Registradas automáticamente</span>
        </div>
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
          <span>Fecha</span><span>Producto</span><span>Cliente</span><span>Progreso</span><span className="text-right">Estado</span>
        </div>
        {ventas.length === 0 ? (
          <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">Todavía no registraste ventas.</div>
        ) : (
          ventas.map((v) => {
            const st = SALE_STATUS[v.activa ? "activa" : "finalizada"];
            return (
              <div key={v.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
                style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
                <span className="text-[#5B6577]">{new Date(v.vendidoEn).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <span className="font-semibold">{v.producto}</span>
                <span className="text-[#0C2A45]">{v.cliente}</span>
                <span className="text-[#9AA3B2] text-[13px]">Cuota {v.cuotasGeneradas} de {config.comisionMeses}</span>
                <span className="text-right">
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5"
                    style={{ background: st.bg, color: st.fg }}>
                    <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: st.dot }} />
                    {st.label}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
