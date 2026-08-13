"use client";

import { useState } from "react";

/**
 * Modal de eliminación con type-to-confirm: hay que escribir el código
 * exacto para habilitar el botón — mismo patrón que ya usa agendaonline
 * para borrar una cuenta (estándar en acciones destructivas irreversibles,
 * lo usan GitHub, Stripe, Vercel, etc).
 */
export function ConfirmarEliminacionModal({
  open,
  titulo,
  advertencia,
  codigoEsperado,
  confirmando,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  titulo: string;
  advertencia: string;
  codigoEsperado: string;
  confirmando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState("");

  if (!open) return null;

  const coincide = input === codigoEsperado;

  function cerrar() {
    setInput("");
    onCancel();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,42,69,.55)" }}>
      <div className="bg-white rounded-[20px] p-7 max-w-[440px] w-full">
        <div className="font-extrabold text-[19px] text-[#0C2A45]" style={{ letterSpacing: "-0.02em" }}>
          {titulo}
        </div>
        <p className="text-[13.5px] text-[#5B6577] mt-2.5 leading-relaxed">{advertencia}</p>

        <label className="block mt-5">
          <span className="text-[13px] text-[#0C2A45]">
            Para confirmar, escribí exactamente <span className="font-mono font-semibold">{codigoEsperado}</span>:
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={codigoEsperado}
            autoFocus
            autoComplete="off"
            className="mt-1.5 w-full border border-[#DCE0E5] rounded-xl px-4 py-2.5 text-[14.5px] font-mono text-[#0C2A45] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10"
          />
        </label>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={cerrar}
            className="flex-1 font-semibold text-[14px] bg-white text-[#5B6577] border border-[#DCE0E5] rounded-xl py-2.5 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!coincide || confirmando}
            className="flex-1 font-semibold text-[14px] bg-[#9B4A57] text-white border-0 rounded-xl py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmando ? "Eliminando…" : "Eliminar definitivamente"}
          </button>
        </div>
      </div>
    </div>
  );
}
