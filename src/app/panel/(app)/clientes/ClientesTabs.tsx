"use client";

import { useState } from "react";

interface Suscripto {
  id: string;
  cliente: string;
  clienteEmail: string | null;
  producto: string;
  vendidoEn: Date;
  suscripcionActiva: boolean;
  diasSinPagar: number;
}

interface Registrado {
  id: string;
  cliente: string;
  clienteEmail: string;
  producto: string;
  registradoEn: Date;
  yaSuscribio: boolean;
}

const formatFecha = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

export function ClientesTabs({ suscriptos, registrados }: { suscriptos: Suscripto[]; registrados: Registrado[] }) {
  const [tab, setTab] = useState<"suscriptos" | "registrados">("suscriptos");

  return (
    <div>
      <div className="flex gap-2 mt-6">
        <TabButton active={tab === "suscriptos"} onClick={() => setTab("suscriptos")}>
          Suscriptos ({suscriptos.length})
        </TabButton>
        <TabButton active={tab === "registrados"} onClick={() => setTab("registrados")}>
          Registrados ({registrados.length})
        </TabButton>
      </div>

      {tab === "suscriptos" ? (
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-4 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">
            {suscriptos.length} {suscriptos.length === 1 ? "suscripto" : "suscriptos"}
          </div>
          {suscriptos.length === 0 ? (
            <div className="px-6 py-8 text-[14.5px] text-[#9AA3B2]">Todavía no tenés clientes pagos.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2] min-w-[680px]"
                style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
                <span>Cliente</span><span>Email</span><span>Producto</span><span>Alta</span><span className="text-right">Suscripción</span>
              </div>
              {suscriptos.map((c) => (
                <div key={c.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px] min-w-[680px]"
                  style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
                  <span className="font-semibold text-[#0C2A45] truncate">{c.cliente}</span>
                  <span className="text-[#5B6577] truncate">{c.clienteEmail ?? "—"}</span>
                  <span className="text-[#0C2A45] font-medium">{c.producto}</span>
                  <span className="text-[#9AA3B2] text-[13px]">{formatFecha(c.vendidoEn)}</span>
                  <span className="text-right">
                    <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-flex items-center gap-1.5"
                      style={{
                        background: c.suscripcionActiva ? "#E7F5EE" : "#FFF3CD",
                        color: c.suscripcionActiva ? "#0B6B47" : "#7A6020",
                      }}>
                      {c.suscripcionActiva ? (
                        <>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6.5L4.8 8.8L9.5 3.5" stroke="#0B6B47" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Activa
                        </>
                      ) : (
                        `Vencida hace ${c.diasSinPagar} días`
                      )}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-4 overflow-hidden">
          <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">
            {registrados.length} {registrados.length === 1 ? "registrado" : "registrados"}
          </div>
          {registrados.length === 0 ? (
            <div className="px-6 py-8 text-[14.5px] text-[#9AA3B2]">Todavía no se registró nadie con tu link.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2] min-w-[680px]"
                style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
                <span>Cliente</span><span>Email</span><span>Producto</span><span>Registro</span><span className="text-right">Estado</span>
              </div>
              {registrados.map((r) => (
                <div key={r.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px] min-w-[680px]"
                  style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
                  <span className="font-semibold text-[#0C2A45] truncate">{r.cliente}</span>
                  <span className="text-[#5B6577] truncate">{r.clienteEmail}</span>
                  <span className="text-[#0C2A45] font-medium">{r.producto}</span>
                  <span className="text-[#9AA3B2] text-[13px]">{formatFecha(r.registradoEn)}</span>
                  <span className="text-right">
                    <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-block"
                      style={{
                        background: r.yaSuscribio ? "#E7F5EE" : "#F0F2F5",
                        color: r.yaSuscribio ? "#0B6B47" : "#9AA3B2",
                      }}>
                      {r.yaSuscribio ? "Ya es cliente" : "Sin suscripción todavía"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="text-[13.5px] font-semibold rounded-full px-4 py-2 cursor-pointer border-0"
      style={{
        background: active ? "#0C2A45" : "#F0F2F5",
        color: active ? "#FFFFFF" : "#5B6577",
      }}
    >
      {children}
    </button>
  );
}
