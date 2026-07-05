import { MOCK_REVENDEDORES } from "@/lib/mock-admin";
import { fmtARS } from "@/lib/constants";

export default function AdminRevendedoresPage() {
  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Revendedores</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">Gestión de revendedores activos e inactivos.</p>
        </div>
        <button className="font-semibold text-sm bg-[#0E6BA8] text-white rounded-[10px] px-4 py-2.5 cursor-pointer border-0">
          + Nuevo revendedor
        </button>
      </div>

      {/* Resumen */}
      <div className="flex gap-4 mt-6">
        {[
          { label: "Activos",   value: MOCK_REVENDEDORES.filter(r => r.activo).length,  color: "#0B6B47" },
          { label: "Inactivos", value: MOCK_REVENDEDORES.filter(r => !r.activo).length, color: "#9AA3B2" },
          { label: "Total",     value: MOCK_REVENDEDORES.length,                         color: "#0C2A45" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-[14px] px-5 py-3.5 flex items-center gap-3">
            <span className="font-extrabold text-[22px]" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[13px] text-[#5B6577]">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-5 overflow-hidden">
        <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr .9fr .8fr .7fr .7fr" }}>
          <span>Nombre</span>
          <span>Email</span>
          <span>Zona</span>
          <span>Código</span>
          <span>Ventas</span>
          <span className="text-right">Estado</span>
        </div>
        {MOCK_REVENDEDORES.map((r) => (
          <div key={r.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14px]"
            style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr .9fr .8fr .7fr .7fr" }}>
            <div>
              <div className="font-semibold">{r.nombre}</div>
              <div className="text-[11.5px] text-[#9AA3B2] mt-0.5">{fmtARS(r.ingreso)} cobrado</div>
            </div>
            <span className="text-[#5B6577] text-[13px]">{r.email}</span>
            <span className="text-[#5B6577]">{r.zona}</span>
            <span className="font-mono text-[12.5px] font-semibold text-[#0B5A8F] bg-[#E1EFF8] px-2 py-1 rounded-lg">{r.codigo}</span>
            <span className="font-semibold">{r.ventas}</span>
            <span className="text-right">
              <span className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block"
                style={{
                  background: r.activo ? "#E7F5EE" : "#EEF0F2",
                  color: r.activo ? "#0B6B47" : "#5B6577",
                }}>
                {r.activo ? "Activo" : "Inactivo"}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
