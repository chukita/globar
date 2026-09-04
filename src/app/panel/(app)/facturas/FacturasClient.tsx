"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

type Pendiente = {
  id: string;
  periodo: string;
  monto: number;
  cantidadCuotas: number;
  pagadaEn: string;
  facturaVenceEn: string;
  facturaRecibidaEn: string | null;
  tieneFactura: boolean;
};
type Historial = Pendiente & { anulada: boolean };
type Legacy = { id: string; monto: number; nota: string; subida: string; pagada: boolean };

export function FacturasClient({
  pendientes,
  historial,
  legacy,
}: {
  pendientes: Pendiente[];
  historial: Historial[];
  legacy: Legacy[];
}) {
  const router = useRouter();
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function subir(liq: Pendiente) {
    const file = fileRefs.current[liq.id]?.files?.[0];
    setError("");
    setExito("");
    if (!file) { setError("Adjuntá el PDF de la factura."); return; }
    if (!file.type.includes("pdf")) { setError("Solo se aceptan archivos PDF."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("El archivo no puede superar 5 MB."); return; }

    setSubiendo(liq.id);
    try {
      const form = new FormData();
      form.append("archivo", file);
      form.append("liquidacionId", liq.id);
      const res = await fetch("/api/panel/facturas", { method: "POST", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error ?? "Error al subir la factura."); return; }
      setExito(`Factura de ${liq.periodo} enviada. ¡Gracias!`);
      router.refresh();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setSubiendo(null);
    }
  }

  return (
    <>
      {/* Liquidaciones esperando factura */}
      <div className="mt-6">
        <h2 className="font-bold text-[17px] m-0 mb-3">Liquidaciones cobradas — falta tu factura</h2>

        {pendientes.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F5EE] mx-auto flex items-center justify-center text-[24px] font-bold text-[#1B9462]">✓</div>
            <p className="text-[15px] text-[#5B6577] mt-4 mb-0">No tenés facturas pendientes de enviar.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendientes.map((l) => {
              const vencida = new Date(l.facturaVenceEn) < new Date();
              return (
                <div key={l.id} className="bg-white border-2 rounded-[16px] px-5 py-4" style={{ borderColor: vencida ? "#E7A9B3" : "#E9ECEF" }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-semibold text-[14.5px]">Liquidación de {l.periodo}</div>
                      <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                        {l.cantidadCuotas} cuota{l.cantidadCuotas !== 1 ? "s" : ""} · te la transferimos el {fmtFecha(l.pagadaEn)}
                      </div>
                      <div className={`text-[12.5px] mt-0.5 font-medium ${vencida ? "text-[#9B4A57]" : "text-[#5B6577]"}`}>
                        {vencida
                          ? `Venció el ${fmtFecha(l.facturaVenceEn)} — estás excluido de la próxima liquidación hasta enviarla`
                          : `Tenés tiempo hasta el ${fmtFecha(l.facturaVenceEn)}`}
                      </div>
                    </div>
                    <div className="font-extrabold text-[22px] text-[#0C2A45] flex-shrink-0">{fmtARS(l.monto)}</div>
                  </div>

                  <div className="flex items-center gap-3 mt-4 flex-wrap">
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={(el) => { fileRefs.current[l.id] = el; }}
                      className="text-[12.5px]"
                    />
                    <button
                      type="button"
                      disabled={subiendo !== null}
                      onClick={() => subir(l)}
                      className="font-semibold text-[13.5px] bg-[#0E6BA8] text-white border-0 rounded-xl px-4 py-2.5 cursor-pointer disabled:opacity-50"
                    >
                      {subiendo === l.id ? "Enviando…" : "Enviar factura en PDF"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium mt-4">{error}</div>
        )}
        {exito && (
          <div className="bg-[#E7F5EE] border border-[#9BD3B6] rounded-xl px-4 py-3 text-[13.5px] text-[#0B6B47] font-medium mt-4 flex items-center gap-2">
            <span className="font-bold">✓</span> {exito}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="mt-8">
        <h2 className="font-bold text-[17px] mb-4">Facturas enviadas</h2>
        {historial.length === 0 && legacy.length === 0 ? (
          <p className="text-[14px] text-[#9AA3B2]">Todavía no enviaste ninguna factura.</p>
        ) : (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
            {historial.map((l, i) => (
              <div key={l.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div>
                  <div className="font-semibold text-[14.5px]">Liquidación de {l.periodo}</div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                    {l.cantidadCuotas} cuota{l.cantidadCuotas !== 1 ? "s" : ""}
                    {l.facturaRecibidaEn && ` · factura enviada el ${fmtFecha(l.facturaRecibidaEn)}`}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {l.tieneFactura && (
                    <a href={`/api/panel/facturas/${l.id}/archivo`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-[#0B5A8F]">
                      Ver PDF
                    </a>
                  )}
                  <span className="font-bold text-[16px]">{fmtARS(l.monto)}</span>
                  <span className="text-[12px] font-semibold rounded-full px-3 py-1.5"
                    style={{ background: l.anulada ? "#FCE6E9" : "#E7F5EE", color: l.anulada ? "#9B4A57" : "#0B6B47" }}>
                    {l.anulada ? "Anulada" : "Facturada"}
                  </span>
                </div>
              </div>
            ))}

            {legacy.map((f, i) => (
              <div key={f.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap bg-[#FAFBFC]" style={{ borderTop: (historial.length > 0 || i > 0) ? "1px solid #F1F3F5" : "none" }}>
                <div>
                  <div className="font-semibold text-[14.5px]">{f.nota || "Factura (flujo anterior)"}</div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">Subida el {f.subida} · histórico</div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-[16px]">{fmtARS(f.monto)}</span>
                  <span className="text-[12px] font-semibold rounded-full px-3 py-1.5"
                    style={{ background: f.pagada ? "#E7F5EE" : "#FFF3CD", color: f.pagada ? "#0B6B47" : "#856404" }}>
                    {f.pagada ? "Pagada" : "En revisión"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
