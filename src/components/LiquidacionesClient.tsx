"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { fmtARS } from "@/lib/constants";
import {
  confirmarLiquidacionAction,
  enviarRecordatoriosLiquidacionAction,
  aprobarFacturaLiquidacionAction,
  rechazarFacturaLiquidacionAction,
} from "@/lib/liquidaciones-actions";

type PreviewRow = {
  revendedorId: string;
  codigoVentas: string;
  nombre: string | null;
  email: string;
  cantidadCuotas: number;
  monto: number;
  cbuAlias: string | null;
  titularNombre: string | null;
  titularCuit: string | null;
  camposFaltantes: string[];
  bloqueado: boolean;
  bloqueoMotivo: string | null;
  incluible: boolean;
};

type EsperandoRow = {
  id: string;
  monto: number;
  periodoLabel: string;
  pagadaEn: string;
  facturaVenceEn: string;
  ultimoRecordatorioEn: string | null;
  recordatoriosEnviados: number;
  cantidadCuotas: number;
  status: "pagada" | "en_revision";
  comprobanteUrl: string | null;
  facturaUrl: string | null;
  facturaRecibidaEn: string | null;
  facturaRechazadaEn: string | null;
  revendedor: string;
  revendedorNombre: string | null;
  vencida: boolean;
};

type HistorialRow = {
  id: string;
  monto: number;
  periodoLabel: string;
  pagadaEn: string;
  facturaRecibidaEn: string | null;
  facturaUrl: string | null;
  comprobanteUrl: string | null;
  cantidadCuotas: number;
  status: "pagada" | "facturada" | "anulada";
  revendedor: string;
  revendedorNombre: string | null;
};

const fmtFecha = (iso: string) => new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

export function LiquidacionesClient({
  periodo,
  preview,
  esperando,
  historial,
}: {
  periodo: string;
  preview: PreviewRow[];
  esperando: EsperandoRow[];
  historial: HistorialRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const comprobanteRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const incluibles = preview.filter((r) => r.incluible);
  const excluidos = preview.filter((r) => !r.incluible);
  const totalAincluir = incluibles.reduce((s, r) => s + r.monto, 0);

  async function confirmar(row: PreviewRow) {
    setError(null);
    setMsg(null);
    setBusy(row.revendedorId);
    try {
      const res = await confirmarLiquidacionAction(row.revendedorId);
      if ("nada" in res) {
        setMsg(`${row.codigoVentas}: no había cuotas pendientes de liquidar.`);
      } else {
        const file = comprobanteRefs.current[row.revendedorId]?.files?.[0];
        if (file) {
          const form = new FormData();
          form.append("archivo", file);
          const up = await fetch(`/api/admin/liquidaciones/${res.liquidacionId}/comprobante`, { method: "POST", body: form });
          if (!up.ok) {
            const b = await up.json().catch(() => null);
            setError(`Pago confirmado pero el comprobante no se subió: ${b?.error ?? "error"}. Subilo desde el historial.`);
          }
        }
        setMsg(`Liquidación de ${row.codigoVentas} confirmada por ${fmtARS(row.monto)}.`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al confirmar la liquidación.");
    } finally {
      setBusy(null);
    }
  }

  async function recordar(id?: string) {
    setError(null);
    setMsg(null);
    setBusy(id ?? "todos");
    try {
      const res = await enviarRecordatoriosLiquidacionAction(id);
      setMsg(
        `${res.enviados} recordatorio${res.enviados !== 1 ? "s" : ""} enviado${res.enviados !== 1 ? "s" : ""}` +
        (res.bloqueadosNuevos > 0 ? ` · ${res.bloqueadosNuevos} revendedor(es) entraron en bloqueo` : ""),
      );
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al enviar recordatorios.");
    } finally {
      setBusy(null);
    }
  }

  async function aprobarFactura(id: string) {
    setError(null);
    setMsg(null);
    setBusy(id);
    try {
      await aprobarFacturaLiquidacionAction(id);
      setMsg("Factura aprobada. La liquidación quedó cerrada.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al aprobar la factura.");
    } finally {
      setBusy(null);
    }
  }

  async function rechazarFactura(id: string) {
    const motivo = window.prompt("Motivo del rechazo (se le manda al revendedor):");
    if (motivo === null) return;
    if (motivo.trim().length < 3) {
      setError("El motivo del rechazo es obligatorio.");
      return;
    }
    setError(null);
    setMsg(null);
    setBusy(id);
    try {
      await rechazarFacturaLiquidacionAction(id, motivo);
      setMsg("Factura rechazada. El revendedor tiene que subir una nueva.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al rechazar la factura.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">{error}</div>
      )}
      {msg && (
        <div className="bg-[#E7F5EE] border border-[#9BD3B6] rounded-xl px-4 py-3 text-[13.5px] text-[#0B6B47] font-medium">{msg}</div>
      )}

      {/* ── Sección 1: generar liquidación ───────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2">
          <h2 className="font-bold text-[19px] m-0">Liquidación de {periodo}</h2>
          {incluibles.length > 0 && (
            <span className="text-[13px] text-[#5B6577]">
              {incluibles.length} revendedor{incluibles.length !== 1 ? "es" : ""} · total {fmtARS(totalAincluir)}
            </span>
          )}
        </div>

        {preview.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[16px] py-10 text-center text-[14px] text-[#9AA3B2] mt-3">
            No hay comisiones acumuladas para liquidar.
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-3">
            {incluibles.map((r) => (
              <div key={r.revendedorId} className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold text-[15px]">
                      {r.nombre ?? r.email} <span className="text-[#9AA3B2] font-normal">· {r.codigoVentas}</span>
                    </div>
                    <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                      {r.cantidadCuotas} cuota{r.cantidadCuotas !== 1 ? "s" : ""} · {r.titularNombre} · {r.titularCuit} · {r.cbuAlias}
                    </div>
                  </div>
                  <div className="font-extrabold text-[22px] text-[#0C2A45] flex-shrink-0">{fmtARS(r.monto)}</div>
                </div>

                <div className="flex items-center gap-3 mt-4 flex-wrap">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    ref={(el) => { comprobanteRefs.current[r.revendedorId] = el; }}
                    className="text-[12.5px]"
                  />
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => confirmar(r)}
                    className="font-semibold text-[13.5px] bg-[#0E6BA8] text-white border-0 rounded-xl px-4 py-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {busy === r.revendedorId ? "Confirmando…" : `Confirmar pago de ${fmtARS(r.monto)}`}
                  </button>
                  <span className="text-[12px] text-[#9AA3B2]">Comprobante opcional</span>
                </div>
              </div>
            ))}

            {excluidos.map((r) => (
              <div key={r.revendedorId} className="bg-[#F7F8FA] border border-[#E9ECEF] rounded-[16px] p-5 opacity-90">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold text-[15px] text-[#5B6577]">
                      {r.nombre ?? r.email} <span className="text-[#9AA3B2] font-normal">· {r.codigoVentas}</span>
                    </div>
                    <div className="text-[12.5px] text-[#9B4A57] mt-1">
                      No entra: {r.bloqueado ? r.bloqueoMotivo : `falta ${r.camposFaltantes.join(", ")}`}
                    </div>
                    <div className="text-[12px] text-[#9AA3B2] mt-0.5">
                      {r.cantidadCuotas} cuota{r.cantidadCuotas !== 1 ? "s" : ""} acumulada{r.cantidadCuotas !== 1 ? "s" : ""} — se cobran cuando se ponga al día
                    </div>
                  </div>
                  <div className="font-bold text-[18px] text-[#9AA3B2] flex-shrink-0">{fmtARS(r.monto)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Sección 2: esperando factura ─────────────────────────────────── */}
      <section>
        <div className="flex items-end justify-between flex-wrap gap-2">
          <h2 className="font-bold text-[19px] m-0">Esperando factura</h2>
          {esperando.length > 0 && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => recordar()}
              className="font-semibold text-[13px] border border-[#0E6BA8] text-[#0E6BA8] bg-white rounded-xl px-3.5 py-2 cursor-pointer disabled:opacity-50"
            >
              {busy === "todos" ? "Enviando…" : "Enviar todos los recordatorios"}
            </button>
          )}
        </div>

        {esperando.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[16px] py-10 text-center text-[14px] text-[#9AA3B2] mt-3">
            Ninguna liquidación pendiente de factura.
          </div>
        ) : (
          <div className="bg-white border border-[#E9ECEF] rounded-[16px] mt-3 overflow-hidden">
            {esperando.map((e, i) => (
              <div key={e.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div className="min-w-0">
                  <div className="font-semibold text-[14.5px]">
                    {e.revendedorNombre} <span className="text-[#9AA3B2] font-normal">· {e.revendedor}</span>
                  </div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                    {e.periodoLabel} · pagada {fmtFecha(e.pagadaEn)} · vence {fmtFecha(e.facturaVenceEn)}
                    {e.status === "en_revision" && e.facturaRecibidaEn && ` · factura subida ${fmtFecha(e.facturaRecibidaEn)}`}
                    {e.status === "pagada" && e.facturaRechazadaEn && ` · factura rechazada ${fmtFecha(e.facturaRechazadaEn)}`}
                    {e.recordatoriosEnviados > 0 && ` · ${e.recordatoriosEnviados} recordatorio${e.recordatoriosEnviados !== 1 ? "s" : ""}`}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  {e.comprobanteUrl && (
                    <a href={`/api/admin/liquidaciones/${e.id}/comprobante`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-[#0B5A8F]">
                      Ver comprobante
                    </a>
                  )}
                  {e.status === "en_revision" ? (
                    <span className="text-[11.5px] font-semibold bg-[#FFF3CD] text-[#856404] rounded-[9px] px-2.5 py-1">En revisión</span>
                  ) : e.vencida && (
                    <span className="text-[11.5px] font-semibold bg-[#FCE6E9] text-[#9B4A57] rounded-[9px] px-2.5 py-1">Bloquea al revendedor</span>
                  )}
                  <span className="font-bold text-[15px]">{fmtARS(e.monto)}</span>
                  {e.status === "en_revision" ? (
                    <>
                      {e.facturaUrl && (
                        <a href={`/api/admin/liquidaciones/${e.id}/factura`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-[#0B5A8F]">
                          Ver factura
                        </a>
                      )}
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => aprobarFactura(e.id)}
                        className="text-[12.5px] font-semibold border-0 text-white bg-[#1B9462] rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {busy === e.id ? "…" : "Aprobar"}
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => rechazarFactura(e.id)}
                        className="text-[12.5px] font-semibold border border-[#E7A9B3] text-[#9B4A57] bg-white rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                      >
                        Rechazar
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => recordar(e.id)}
                      className="text-[12.5px] font-semibold border border-[#DCE0E5] text-[#5B6577] bg-white rounded-[9px] px-3 py-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {busy === e.id ? "…" : "Enviar recordatorio"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Sección 3: historial ─────────────────────────────────────────── */}
      <section>
        <h2 className="font-bold text-[19px] m-0">Historial</h2>
        {historial.length === 0 ? (
          <p className="text-[14px] text-[#9AA3B2] mt-3">Todavía no hay liquidaciones facturadas.</p>
        ) : (
          <div className="bg-white border border-[#E9ECEF] rounded-[16px] mt-3 overflow-hidden">
            {historial.map((h, i) => (
              <div key={h.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div className="min-w-0">
                  <div className="font-semibold text-[14.5px]">
                    {h.revendedorNombre} <span className="text-[#9AA3B2] font-normal">· {h.revendedor}</span>
                    {h.status === "anulada" && <span className="ml-2 text-[11.5px] font-semibold bg-[#FCE6E9] text-[#9B4A57] rounded-[9px] px-2 py-0.5">Anulada</span>}
                  </div>
                  <div className="text-[12.5px] text-[#9AA3B2] mt-0.5">
                    {h.periodoLabel} · pagada {fmtFecha(h.pagadaEn)}
                    {h.facturaRecibidaEn && ` · factura ${fmtFecha(h.facturaRecibidaEn)}`}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                  {h.facturaUrl && (
                    <a href={`/api/admin/liquidaciones/${h.id}/factura`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-[#0B5A8F]">
                      Ver factura
                    </a>
                  )}
                  {h.comprobanteUrl && (
                    <a href={`/api/admin/liquidaciones/${h.id}/comprobante`} target="_blank" rel="noopener noreferrer" className="text-[12.5px] font-semibold text-[#0B5A8F]">
                      Ver comprobante
                    </a>
                  )}
                  <span className="font-bold text-[15px]">{fmtARS(h.monto)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
