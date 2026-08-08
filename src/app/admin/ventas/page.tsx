import { getTodasLasVentas } from "@/lib/admin-data";
import { fmtARS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminVentasPage() {
  const ventas = await getTodasLasVentas();

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Ventas</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Todas las ventas registradas por código de revendedor.</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        {[
          { label: "Total ventas", value: ventas.length,                        color: "#0C2A45" },
          { label: "Activas",      value: ventas.filter(v => v.activa).length,  color: "#0B6B47" },
          { label: "Inactivas",    value: ventas.filter(v => !v.activa).length, color: "#9AA3B2" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-[14px] px-5 py-3.5 flex items-center gap-3">
            <span className="font-extrabold text-[22px]" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[13px] text-[#5B6577]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.4fr 1fr .8fr .7fr" }}>
          <span>Fecha</span>
          <span>Revendedor</span>
          <span>Cliente</span>
          <span>Producto</span>
          <span>Precio/mes</span>
          <span className="text-right">Estado</span>
        </div>
        {ventas.length === 0 ? (
          <div className="px-6 py-10 text-center text-[14px] text-[#9AA3B2]">Todavía no hay ventas registradas.</div>
        ) : (
          ventas.map((v) => (
            <div key={v.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14px]"
              style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr 1.4fr 1fr .8fr .7fr" }}>
              <span className="text-[#5B6577]">{new Date(v.fecha).toLocaleDateString("es-AR")}</span>
              <span className="font-medium">{v.revendedor ?? "—"}</span>
              <span className="text-[#0C2A45]">{v.cliente}</span>
              <span className="font-medium">{v.producto}</span>
              <span className="font-semibold">{fmtARS(Number(v.precioMensual))}</span>
              <span className="text-right">
                <span className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block"
                  style={{
                    background: v.activa ? "#E7F5EE" : "#EEF0F2",
                    color: v.activa ? "#0B6B47" : "#5B6577",
                  }}>
                  {v.activa ? "Activa" : "Inactiva"}
                </span>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
