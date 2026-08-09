import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, cuotas, ventas, productos, users } from "@/db/schema";
import { eq, and, inArray, sum } from "drizzle-orm";
import { redirect } from "next/navigation";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const MES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const STATUS_MAP = {
  pendiente:  { label: "Pendiente",  bg: "#FCE6E9", fg: "#9B4A57" },
  generada:   { label: "A facturar", bg: "#FFF3CD", fg: "#7A6020" },
  facturada:  { label: "Facturada",  bg: "#E1EFF8", fg: "#0B5A8F" },
  pagada:     { label: "Pagado",     bg: "#E7F5EE", fg: "#0B6B47" },
} as const;

export default async function ComisionesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  if (!rev) {
    return (
      <div className="p-10">
        <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Estado de comisiones</h1>
        <p className="text-[14.5px] text-[#5B6577] mt-4">Todavía no tenés ventas registradas.</p>
      </div>
    );
  }

  // Todas las cuotas del revendedor con info de venta y producto
  const rows = await db
    .select({
      cuotaId:      cuotas.id,
      numeroCuota:  cuotas.numeroCuota,
      monto:        cuotas.monto,
      periodoMes:   cuotas.periodoMes,
      periodoAnio:  cuotas.periodoAnio,
      status:       cuotas.status,
      ventaId:      ventas.id,
      clienteNombre: ventas.clienteNombre,
      vendidoEn:    ventas.vendidoEn,
      productoNombre: productos.nombre,
    })
    .from(cuotas)
    .innerJoin(ventas, eq(cuotas.ventaId, ventas.id))
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(eq(cuotas.revendedorId, rev.id))
    .orderBy(cuotas.periodoAnio, cuotas.periodoMes, cuotas.numeroCuota);

  // Totales
  const cobrado = rows.filter(r => r.status === "pagada").reduce((a, r) => a + parseFloat(r.monto), 0);
  const pendiente = rows.filter(r => r.status !== "pagada").reduce((a, r) => a + parseFloat(r.monto), 0);
  const aFacturar = rows.filter(r => r.status === "generada").reduce((a, r) => a + parseFloat(r.monto), 0);

  // Próximo pago: cuotas generadas del mes más próximo
  const generadas = rows.filter(r => r.status === "generada");
  const proximoMes = generadas.length > 0
    ? `${MES[generadas[0].periodoMes - 1]} ${generadas[0].periodoAnio}`
    : null;
  const proximoMonto = generadas
    .filter(r => r.periodoMes === generadas[0]?.periodoMes && r.periodoAnio === generadas[0]?.periodoAnio)
    .reduce((a, r) => a + parseFloat(r.monto), 0);

  // Ventas únicas con progreso
  const ventasMap = new Map<string, { fecha: Date; producto: string; cliente: string; cuotasPagadas: number; total: number }>();
  for (const r of rows) {
    if (!ventasMap.has(r.ventaId)) {
      ventasMap.set(r.ventaId, { fecha: r.vendidoEn, producto: r.productoNombre, cliente: r.clienteNombre, cuotasPagadas: 0, total: 0 });
    }
    const v = ventasMap.get(r.ventaId)!;
    v.total++;
    if (r.status === "pagada") v.cuotasPagadas++;
  }
  const ventasList = [...ventasMap.entries()].map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const TOTALS = [
    { label: "Cobrado",          value: fmtARS(cobrado),    sub: `${rows.filter(r => r.status === "pagada").length} cuotas acreditadas`, accent: "#0B5A8F" },
    { label: "A facturar",       value: fmtARS(aFacturar),  sub: `${generadas.length} cuotas listas para facturar`,                     accent: "#7A6020" },
    { label: "Total pendiente",  value: fmtARS(pendiente),  sub: `${rows.filter(r => r.status !== "pagada").length} cuotas programadas`, accent: "#9B4A57" },
  ];

  const formatFecha = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Estado de comisiones</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Seguimiento de tus comisiones por cobrar y el historial de ventas.</p>
        </div>
      </div>

      {/* Próximo pago banner */}
      {proximoMes && (
        <div className="mt-6 bg-[#0C2A45] rounded-[18px] px-[26px] py-[22px] flex items-center justify-between flex-wrap gap-4 relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[30px] w-[220px] h-[220px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-[13px] flex items-center justify-center" style={{ background: "rgba(14,107,168,.24)" }}>
              <span className="w-3.5 h-3.5 rounded-full bg-[#0E6BA8]" />
            </div>
            <div>
              <div className="text-[13px] text-[#9DB0C4] font-semibold">Cuotas listas para facturar</div>
              <div className="font-semibold text-[17px] text-white mt-0.5">{proximoMes} · {generadas.filter(r => r.periodoMes === generadas[0].periodoMes && r.periodoAnio === generadas[0].periodoAnio).length} cuotas</div>
            </div>
          </div>
          <div className="relative text-right">
            <div className="font-extrabold text-[30px] text-[#BBD9EE]" style={{ letterSpacing: "-0.02em" }}>
              {fmtARS(proximoMonto)}
            </div>
            <div className="text-[12.5px] text-[#9DB0C4]">Subí tu factura para cobrar</div>
          </div>
        </div>
      )}

      {/* Totales */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {TOTALS.map((t) => (
          <div key={t.label} className="bg-white border border-[#E9ECEF] rounded-2xl p-[22px]">
            <div className="text-[13px] text-[#5B6577] font-medium">{t.label}</div>
            <div className="font-extrabold text-[30px] mt-2" style={{ letterSpacing: "-0.02em", color: t.accent }}>{t.value}</div>
            <div className="text-[12.5px] text-[#9AA3B2] mt-1">{t.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabla de cuotas */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">Cuotas de comisión</div>
        {rows.length === 0 ? (
          <div className="px-6 py-8 text-[14.5px] text-[#9AA3B2]">No hay cuotas registradas todavía.</div>
        ) : (
          <>
            <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
              style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
              <span>Período</span><span>Cliente</span><span>Producto</span><span>Monto</span><span className="text-right">Estado</span>
            </div>
            {rows.map((r, i) => {
              const s = STATUS_MAP[r.status];
              return (
                <div key={r.cuotaId} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
                  style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 1.2fr .9fr 1fr" }}>
                  <span className="font-semibold">{MES[r.periodoMes - 1]} {r.periodoAnio}</span>
                  <span className="text-[#5B6577] truncate">{r.clienteNombre}</span>
                  <span className="text-[#0C2A45] font-medium">{r.productoNombre}</span>
                  <span className="font-bold">{fmtARS(parseFloat(r.monto))}</span>
                  <span className="text-right">
                    <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-block"
                      style={{ background: s.bg, color: s.fg }}>{s.label}</span>
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Historial de ventas */}
      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] flex items-center justify-between">
          <span className="font-semibold text-[17px]">Historial de ventas</span>
          <span className="text-[12.5px] text-[#9AA3B2]">Registradas automáticamente</span>
        </div>
        {ventasList.length === 0 ? (
          <div className="px-6 py-8 text-[14.5px] text-[#9AA3B2]">No hay ventas registradas todavía.</div>
        ) : (
          <>
            <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
              style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
              <span>Fecha</span><span>Producto</span><span>Cliente</span><span>Progreso</span><span className="text-right">Estado</span>
            </div>
            {ventasList.map((v) => {
              const finalizada = v.cuotasPagadas === v.total;
              return (
                <div key={v.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
                  style={{ display: "grid", gridTemplateColumns: ".9fr 1.1fr 1.4fr 1fr 1fr" }}>
                  <span className="text-[#5B6577]">{formatFecha(v.fecha)}</span>
                  <span className="font-semibold">{v.producto}</span>
                  <span className="text-[#0C2A45] truncate">{v.cliente}</span>
                  <span className="text-[#9AA3B2] text-[13px]">Cuota {v.cuotasPagadas} de {v.total}</span>
                  <span className="text-right">
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-full px-3 py-1.5"
                      style={{
                        background: finalizada ? "#EEF0F2" : "#E1EFF8",
                        color: finalizada ? "#5B6577" : "#0B5A8F",
                      }}>
                      <span className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                        style={{ background: finalizada ? "#9AA3B2" : "#0E6BA8" }} />
                      {finalizada ? "Finalizada" : "Activa"}
                    </span>
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
