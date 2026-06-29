import { COMMISSION_PER_MONTH, COMMISSION_PER_SALE, fmtARS } from "@/lib/constants";

const STATUS_MAP = {
  pagado:    { label: "Pagado",    bg: "#E1EFF8", fg: "#0B5A8F" },
  proximo:   { label: "Próximo",   bg: "#0C2A45", fg: "#FFFFFF" },
  pendiente: { label: "Pendiente", bg: "#FCE6E9", fg: "#9B4A57" },
} as const;

type Status = keyof typeof STATUS_MAP;

const COMMISSIONS: { month: string; origin: string; product: string; amount: number; status: Status }[] = [
  { month: "Mayo 2026",       origin: "Venta de Marzo",  product: "agendaonline", amount: COMMISSION_PER_MONTH, status: "pagado" },
  { month: "Mayo 2026",       origin: "Venta de Abril",  product: "nume",         amount: COMMISSION_PER_MONTH, status: "pagado" },
  { month: "Junio 2026",      origin: "Venta de Abril",  product: "agendaonline", amount: COMMISSION_PER_MONTH, status: "pagado" },
  { month: "Junio 2026",      origin: "Venta de Mayo",   product: "nume",         amount: COMMISSION_PER_MONTH, status: "pagado" },
  { month: "Julio 2026",      origin: "Venta de Mayo",   product: "agendaonline", amount: COMMISSION_PER_MONTH, status: "proximo" },
  { month: "Julio 2026",      origin: "Venta de Junio",  product: "agendaonline", amount: COMMISSION_PER_MONTH, status: "proximo" },
  { month: "Julio 2026",      origin: "Venta de Junio",  product: "nume",         amount: COMMISSION_PER_MONTH, status: "proximo" },
  { month: "Agosto 2026",     origin: "Venta de Junio",  product: "agendaonline", amount: COMMISSION_PER_MONTH, status: "pendiente" },
  { month: "Agosto 2026",     origin: "Venta de Junio",  product: "nume",         amount: COMMISSION_PER_MONTH, status: "pendiente" },
  { month: "Septiembre 2026", origin: "Venta de Junio",  product: "nume",         amount: COMMISSION_PER_MONTH, status: "pendiente" },
];

const SALE_STATUS = {
  activa:     { label: "Comisión activa", bg: "#E1EFF8", fg: "#0B5A8F", dot: "#0E6BA8" },
  finalizada: { label: "Finalizada",      bg: "#EEF0F2", fg: "#5B6577", dot: "#9AA3B2" },
} as const;

type SaleStatus = keyof typeof SALE_STATUS;

const SALES: { date: string; product: string; client: string; cuota: string; st: SaleStatus }[] = [
  { date: "12 Jun 2026", product: "nume",         client: "Bodegón Las Tinajas",     cuota: "Cuota 0 de 3", st: "activa" },
  { date: "04 Jun 2026", product: "agendaonline", client: "Estudio Kinesio Norte",   cuota: "Cuota 0 de 3", st: "activa" },
  { date: "21 May 2026", product: "agendaonline", client: "Centro Odontológico Sur", cuota: "Cuota 1 de 3", st: "activa" },
  { date: "09 May 2026", product: "nume",         client: "Café Mistral",            cuota: "Cuota 1 de 3", st: "activa" },
  { date: "18 Abr 2026", product: "agendaonline", client: "Peluquería Bloom",        cuota: "Cuota 2 de 3", st: "activa" },
  { date: "28 Feb 2026", product: "nume",         client: "Parrilla Don Lucho",      cuota: "Cuota 3 de 3", st: "finalizada" },
];

const TOTALS = [
  { label: "Cobrado este año",      value: fmtARS(COMMISSION_PER_MONTH * 13), sub: "13 cuotas acreditadas",    accent: "#0B5A8F" },
  { label: "A cobrar próximo mes",  value: fmtARS(COMMISSION_PER_MONTH * 3),  sub: "Julio 2026 · 3 cuotas",   accent: "#0C2A45" },
  { label: "Total pendiente",       value: fmtARS(COMMISSION_PER_MONTH * 6),  sub: "6 cuotas programadas",     accent: "#9B4A57" },
];

export default function ComisionesPage() {
  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Estado de comisiones</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Seguimiento de tus comisiones por cobrar y el historial de ventas.</p>
        </div>
        <button className="font-semibold text-sm bg-white border border-[#DCE0E5] rounded-[10px] px-4 py-2.5 cursor-pointer">
          Exportar
        </button>
      </div>

      {/* Next payment banner */}
      <div className="mt-6 bg-[#0C2A45] rounded-[18px] px-[26px] py-[22px] flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
        <div className="absolute -top-[60px] -right-[30px] w-[220px] h-[220px] rounded-full"
          style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-[13px] flex items-center justify-center"
            style={{ background: "rgba(14,107,168,.24)" }}>
            <span className="w-3.5 h-3.5 rounded-full bg-[#0E6BA8]" />
          </div>
          <div>
            <div className="text-[13px] text-[#9DB0C4] font-semibold">Próximo pago</div>
            <div className="font-semibold text-[17px] text-white mt-0.5">Julio 2026 · en 15 días</div>
          </div>
        </div>
        <div className="relative text-right">
          <div className="font-extrabold text-[30px] text-[#BBD9EE]" style={{ letterSpacing: "-0.02em" }}>
            {fmtARS(COMMISSION_PER_SALE)}
          </div>
          <div className="text-[12.5px] text-[#9DB0C4]">3 cuotas acreditadas el 1 de julio</div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {TOTALS.map((t) => (
          <div key={t.label} className="bg-white border border-[#E9ECEF] rounded-2xl p-[22px]">
            <div className="text-[13px] text-[#5B6577] font-medium">{t.label}</div>
            <div className="font-extrabold text-[30px] mt-2" style={{ letterSpacing: "-0.02em", color: t.accent }}>{t.value}</div>
            <div className="text-[12.5px] text-[#9AA3B2] mt-1">{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Commissions table */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">Comisiones por mes</div>
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
          <span>Mes</span><span>Origen</span><span>Producto</span><span>Monto</span><span className="text-right">Estado</span>
        </div>
        {COMMISSIONS.map((r, i) => {
          const s = STATUS_MAP[r.status];
          return (
            <div key={i} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
              style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
              <span className="font-semibold">{r.month}</span>
              <span className="text-[#5B6577]">{r.origin}</span>
              <span className="text-[#0C2A45] font-medium">{r.product}</span>
              <span className="font-bold">{fmtARS(r.amount)}</span>
              <span className="text-right">
                <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-block"
                  style={{ background: s.bg, color: s.fg }}>{s.label}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Sales history */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] flex items-center justify-between">
          <span className="font-semibold text-[17px]">Historial de ventas</span>
          <span className="text-[12.5px] text-[#9AA3B2]">Registradas automáticamente</span>
        </div>
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
          <span>Fecha</span><span>Producto</span><span>Cliente</span><span>Progreso</span><span className="text-right">Comisión</span>
        </div>
        {SALES.map((s, i) => {
          const st = SALE_STATUS[s.st];
          return (
            <div key={i} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
              style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
              <span className="text-[#5B6577]">{s.date}</span>
              <span className="font-semibold">{s.product}</span>
              <span className="text-[#0C2A45]">{s.client}</span>
              <span className="text-[#9AA3B2] text-[13px]">{s.cuota}</span>
              <span className="text-right">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5"
                  style={{ background: st.bg, color: st.fg }}>
                  <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ background: st.dot }} />
                  {st.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
