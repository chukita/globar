"use client";

/** Modal de confirmación simple (sin type-to-confirm) para acciones reversibles. */
export function ConfirmarModal({
  open,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  confirmando,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  confirmando?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,42,69,.55)" }}>
      <div className="bg-white rounded-[20px] p-7 max-w-[420px] w-full">
        <div className="font-extrabold text-[19px] text-[#0C2A45]" style={{ letterSpacing: "-0.02em" }}>
          {titulo}
        </div>
        <p className="text-[13.5px] text-[#5B6577] mt-2.5 leading-relaxed">{mensaje}</p>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 font-semibold text-[14px] bg-white text-[#5B6577] border border-[#DCE0E5] rounded-xl py-2.5 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmando}
            className="flex-1 font-semibold text-[14px] bg-[#0E6BA8] text-white border-0 rounded-xl py-2.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {confirmando ? "Confirmando…" : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
