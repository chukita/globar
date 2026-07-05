"use client";

import { useState } from "react";
import { MOCK_FACTURAS } from "@/lib/mock-admin";
import { fmtARS } from "@/lib/constants";

type Factura = typeof MOCK_FACTURAS[number];

export default function AdminFacturasPage() {
  const [facturas, setFacturas] = useState(MOCK_FACTURAS);
  const [pagando, setPagando] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<string | null>(null);

  const pendientes = facturas.filter(f => !f.pagada);
  const pagadas    = facturas.filter(f => f.pagada);

  async function marcarPagada(id: string) {
    setPagando(id);
    // TODO: reemplazar con llamada a API route
    await new Promise(r => setTimeout(r, 800));
    setFacturas(prev => prev.map(f => f.id === id ? { ...f, pagada: true } : f));
    setPagando(null);
    setConfirmando(null);
  }

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Facturas</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
            Facturas subidas por revendedores. Realizá la transferencia y marcalas como pagadas.
          </p>
        </div>
      </div>

      {/* Pendientes */}
      <div className="mt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="font-bold text-[17px] m-0">Por pagar</h2>
          {pendientes.length > 0 && (
            <span className="text-[12px] font-bold bg-[#FCE6E9] text-[#9B4A57] rounded-full px-2.5 py-0.5">
              {pendientes.length}
            </span>
          )}
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F5EE] mx-auto flex items-center justify-center text-[24px] text-[#1B9462] font-bold">✓</div>
            <p className="text-[15px] text-[#5B6577] mt-4 mb-0">No hay facturas pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendientes.map(f => (
              <FacturaCard
                key={f.id}
                factura={f}
                confirmando={confirmando === f.id}
                pagando={pagando === f.id}
                onConfirmar={() => setConfirmando(f.id)}
                onCancelar={() => setConfirmando(null)}
                onPagar={() => marcarPagada(f.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagadas */}
      {pagadas.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-[17px] mb-4 text-[#9AA3B2]">Pagadas</h2>
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
            {pagadas.map((f, i) => (
              <div key={f.id} className="px-6 py-4 flex items-center justify-between gap-4"
                style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div>
                  <div className="font-semibold text-[14.5px] text-[#5B6577]">{f.revendedor}</div>
                  <div className="text-[12.5px] text-[#B0B8C4] mt-0.5">{f.nota} · Subida {f.subida}</div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="font-bold text-[16px] text-[#9AA3B2]">{fmtARS(f.monto)}</span>
                  <span className="text-[12px] font-semibold bg-[#E7F5EE] text-[#0B6B47] rounded-full px-3 py-1.5">
                    Pagada
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FacturaCard({ factura, confirmando, pagando, onConfirmar, onCancelar, onPagar }: {
  factura: Factura;
  confirmando: boolean;
  pagando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  onPagar: () => void;
}) {
  return (
    <div className="bg-white border-2 border-[#E9ECEF] rounded-[18px] overflow-hidden"
      style={{ borderColor: confirmando ? "#0E6BA8" : "#E9ECEF" }}>
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold text-[18px]">{factura.revendedor}</span>
              <span className="text-[12px] font-semibold bg-[#FCE6E9] text-[#9B4A57] rounded-full px-2.5 py-1">
                Pendiente de pago
              </span>
            </div>
            <p className="text-[14px] text-[#5B6577] mt-1.5 mb-0">{factura.nota}</p>
            <div className="flex items-center gap-4 mt-3 text-[13px] text-[#9AA3B2]">
              <span>Subida el {factura.subida}</span>
              <span>·</span>
              <span>{factura.cuotas} cuota{factura.cuotas > 1 ? "s" : ""}</span>
              <span>·</span>
              <a href="#" className="text-[#0E6BA8] font-medium flex items-center gap-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
                </svg>
                {factura.archivo}
              </a>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-extrabold text-[28px] text-[#0C2A45]" style={{ letterSpacing: "-0.02em" }}>
              {fmtARS(factura.monto)}
            </div>
            <div className="text-[12px] text-[#9AA3B2] mt-0.5">a transferir a nombre del revendedor</div>
          </div>
        </div>
      </div>

      {/* Acción */}
      <div className="px-6 py-4 border-t border-[#F1F3F5] bg-[#FAFBFC] flex items-center justify-between gap-4 flex-wrap">
        {!confirmando ? (
          <>
            <p className="text-[13px] text-[#9AA3B2] m-0">
              Realizá la transferencia bancaria antes de marcarla como pagada.
            </p>
            <button onClick={onConfirmar}
              className="font-semibold text-[14px] bg-[#0E6BA8] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer">
              Marcar como pagada
            </button>
          </>
        ) : (
          <>
            <p className="text-[13.5px] font-semibold text-[#0C2A45] m-0">
              ¿Confirmás que ya realizaste la transferencia de <strong>{fmtARS(factura.monto)}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={onCancelar} disabled={pagando}
                className="font-semibold text-[14px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 cursor-pointer">
                Cancelar
              </button>
              <button onClick={onPagar} disabled={pagando}
                className="font-semibold text-[14px] bg-[#0B6B47] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-60">
                {pagando ? "Guardando…" : "Sí, confirmar pago"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
