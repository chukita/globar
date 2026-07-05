"use client";

import { useState, useRef } from "react";
import { fmtARS, COMMISSION_PER_MONTH } from "@/lib/constants";

// Mock — reemplazar con fetch a /api/panel/facturas y cuotas del revendedor
const MOCK_CUOTAS_GENERADAS = [
  { id: "c3",  producto: "agendaonline", cliente: "Centro Odontológico Sur", mes: "Ago 2026", cuota: 3, monto: COMMISSION_PER_MONTH / 2 },
  { id: "c8",  producto: "nume",         cliente: "Bodegón Las Tinajas",     mes: "Ago 2026", cuota: 2, monto: COMMISSION_PER_MONTH / 2 },
  { id: "c12", producto: "agendaonline", cliente: "Peluquería Bloom",        mes: "Jul 2026", cuota: 3, monto: COMMISSION_PER_MONTH / 2 },
];

const MOCK_FACTURAS_ENVIADAS = [
  { id: "f1", monto: COMMISSION_PER_MONTH, cuotas: 2, nota: "Cuotas junio y julio agendaonline", subida: "28 Jun 2026", pagada: false },
  { id: "f2", monto: COMMISSION_PER_MONTH / 2, cuotas: 1, nota: "Cuota julio nume",              subida: "29 Jun 2026", pagada: false },
];

type Cuota = typeof MOCK_CUOTAS_GENERADAS[number];

export default function FacturasRevendedorPage() {
  const [seleccionadas, setSeleccionadas] = useState<Set<string>>(new Set());
  const [archivo, setArchivo] = useState<File | null>(null);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [cuotasDisponibles, setCuotasDisponibles] = useState(MOCK_CUOTAS_GENERADAS);
  const fileRef = useRef<HTMLInputElement>(null);

  const montoSeleccionado = cuotasDisponibles
    .filter(c => seleccionadas.has(c.id))
    .reduce((s, c) => s + c.monto, 0);

  function toggleCuota(id: string) {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.type.includes("pdf")) {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (f && f.size > 5 * 1024 * 1024) {
      setError("El archivo no puede superar 5 MB.");
      return;
    }
    setError("");
    setArchivo(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (seleccionadas.size === 0) { setError("Seleccioná al menos una cuota."); return; }
    if (!archivo) { setError("Adjuntá el PDF de la factura."); return; }
    setError("");
    setEnviando(true);

    try {
      const form = new FormData();
      form.append("archivo", archivo);
      form.append("nota", nota);
      form.append("cuotaIds", JSON.stringify([...seleccionadas]));

      const res = await fetch("/api/panel/facturas", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al enviar la factura.");
        return;
      }

      // Quitar las cuotas facturadas del listado
      setCuotasDisponibles(prev => prev.filter(c => !seleccionadas.has(c.id)));
      setSeleccionadas(new Set());
      setArchivo(null);
      setNota("");
      if (fileRef.current) fileRef.current.value = "";
      setExito(true);
      setTimeout(() => setExito(false), 4000);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-10 max-w-[860px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Facturas</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Seleccioná las cuotas que querés cobrar, adjuntá tu factura y enviala a Grupo Globaliza.
      </p>

      {/* Info de facturación */}
      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-[9px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[14px]">i</div>
        <div className="text-[13.5px] text-[#3F6280] leading-relaxed">
          La factura debe ser a nombre de <strong>Grupo Globaliza</strong> por el monto exacto de las cuotas seleccionadas.
          Una vez que la revisemos, realizamos la transferencia y la marcamos como pagada.
        </div>
      </div>

      {/* Cuotas disponibles */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-[17px] m-0">Cuotas disponibles para facturar</h2>
          {cuotasDisponibles.length > 0 && (
            <button
              type="button"
              onClick={() => setSeleccionadas(
                seleccionadas.size === cuotasDisponibles.length
                  ? new Set()
                  : new Set(cuotasDisponibles.map(c => c.id))
              )}
              className="text-[13px] font-semibold text-[#0E6BA8] cursor-pointer"
            >
              {seleccionadas.size === cuotasDisponibles.length ? "Deseleccionar todas" : "Seleccionar todas"}
            </button>
          )}
        </div>

        {cuotasDisponibles.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F5EE] mx-auto flex items-center justify-center text-[24px] font-bold text-[#1B9462]">✓</div>
            <p className="text-[15px] text-[#5B6577] mt-4 mb-0">No tenés cuotas disponibles para facturar en este momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cuotasDisponibles.map((c) => {
              const sel = seleccionadas.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCuota(c.id)}
                  className="w-full text-left bg-white border-2 rounded-[16px] px-5 py-4 flex items-center gap-4 transition-colors cursor-pointer"
                  style={{ borderColor: sel ? "#0E6BA8" : "#E9ECEF", background: sel ? "#F1F8FC" : "#fff" }}
                >
                  {/* Checkbox visual */}
                  <div className="flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                    style={{ borderColor: sel ? "#0E6BA8" : "#CBD2DA", background: sel ? "#0E6BA8" : "#fff" }}>
                    {sel && <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[14.5px]">{c.cliente}</span>
                      <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: "#E1EFF8", color: "#0B5A8F" }}>{c.producto}</span>
                    </div>
                    <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                      Cuota {c.cuota} de 6 · {c.mes}
                    </div>
                  </div>

                  <div className="font-bold text-[18px] text-[#0C2A45] flex-shrink-0">
                    {fmtARS(c.monto)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Formulario de envío */}
      {cuotasDisponibles.length > 0 && (
        <form onSubmit={handleSubmit}>
          <div className="mt-6 bg-white border border-[#E9ECEF] rounded-[20px] p-6">
            <h2 className="font-bold text-[17px] m-0 mb-5">Adjuntá tu factura</h2>

            {/* Monto calculado */}
            <div className="bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-5 py-4 flex items-center justify-between mb-5">
              <div>
                <div className="text-[13px] text-[#9AA3B2] font-medium">Monto a facturar</div>
                <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                  {seleccionadas.size} cuota{seleccionadas.size !== 1 ? "s" : ""} seleccionada{seleccionadas.size !== 1 ? "s" : ""}
                </div>
              </div>
              <div className="font-extrabold text-[28px] text-[#0C2A45]" style={{ letterSpacing: "-0.02em" }}>
                {fmtARS(montoSeleccionado)}
              </div>
            </div>

            {/* Upload PDF */}
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#0C2A45] mb-2">
                Factura en PDF <span className="text-[#9B4A57]">*</span>
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: archivo ? "#0E6BA8" : "#DCE0E5", background: archivo ? "#F1F8FC" : "#FAFBFC" }}
              >
                {archivo ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E6BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <div className="text-left">
                      <div className="font-semibold text-[14px] text-[#0E6BA8]">{archivo.name}</div>
                      <div className="text-[12px] text-[#9AA3B2]">{(archivo.size / 1024).toFixed(0)} KB</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setArchivo(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="ml-2 text-[#9AA3B2] hover:text-[#9B4A57] text-lg leading-none cursor-pointer"
                    >×</button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-[#E1EFF8] mx-auto flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E6BA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div className="font-semibold text-[14px] text-[#0C2A45]">Hacé clic para subir el PDF</div>
                    <div className="text-[12.5px] text-[#9AA3B2] mt-1">PDF · Máx. 5 MB</div>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                onChange={handleArchivo}
                className="hidden"
              />
            </div>

            {/* Nota opcional */}
            <div className="mb-5">
              <label className="block text-[13px] font-semibold text-[#0C2A45] mb-2">
                Nota <span className="text-[#9AA3B2] font-normal">(opcional)</span>
              </label>
              <textarea
                value={nota}
                onChange={e => setNota(e.target.value)}
                rows={2}
                placeholder="Ej: Cuotas de junio y julio — agendaonline"
                className="w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] resize-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium mb-4">
                {error}
              </div>
            )}

            {exito && (
              <div className="bg-[#E7F5EE] border border-[#9BD3B6] rounded-xl px-4 py-3 text-[13.5px] text-[#0B6B47] font-medium mb-4 flex items-center gap-2">
                <span className="font-bold">✓</span> Factura enviada correctamente. La revisaremos y procesaremos la transferencia.
              </div>
            )}

            <button
              type="submit"
              disabled={enviando || seleccionadas.size === 0 || !archivo}
              className="w-full font-semibold text-[15px] bg-[#0E6BA8] text-white border-0 rounded-xl py-3.5 cursor-pointer disabled:opacity-50 transition-opacity"
            >
              {enviando ? "Enviando…" : `Enviar factura por ${fmtARS(montoSeleccionado)}`}
            </button>
          </div>
        </form>
      )}

      {/* Facturas enviadas */}
      <div className="mt-8">
        <h2 className="font-bold text-[17px] mb-4">Facturas enviadas</h2>
        {MOCK_FACTURAS_ENVIADAS.length === 0 ? (
          <p className="text-[14px] text-[#9AA3B2]">Todavía no enviaste ninguna factura.</p>
        ) : (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
            {MOCK_FACTURAS_ENVIADAS.map((f, i) => (
              <div key={f.id} className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap"
                style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div>
                  <div className="font-semibold text-[14.5px]">{f.nota}</div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                    {f.cuotas} cuota{f.cuotas > 1 ? "s" : ""} · Subida el {f.subida}
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-[16px]">{fmtARS(f.monto)}</span>
                  <span className="text-[12px] font-semibold rounded-full px-3 py-1.5"
                    style={{
                      background: f.pagada ? "#E7F5EE" : "#FFF3CD",
                      color:      f.pagada ? "#0B6B47" : "#856404",
                    }}>
                    {f.pagada ? "Pagada" : "En revisión"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
