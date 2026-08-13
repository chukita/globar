"use client";

import { useState } from "react";

export function ConfiguracionForm({
  comisionMonto,
  comisionMeses,
  notifAdminEmails,
  notifRevendedorNuevo,
  notifFacturaSubida,
}: {
  comisionMonto: number;
  comisionMeses: number;
  notifAdminEmails: string;
  notifRevendedorNuevo: boolean;
  notifFacturaSubida: boolean;
}) {
  const [monto, setMonto] = useState(String(comisionMonto));
  const [meses, setMeses] = useState(String(comisionMeses));
  const [emails, setEmails] = useState(notifAdminEmails);
  const [avisoRevendedorNuevo, setAvisoRevendedorNuevo] = useState(notifRevendedorNuevo);
  const [avisoFacturaSubida, setAvisoFacturaSubida] = useState(notifFacturaSubida);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/admin/configuracion", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comisionMonto: Number(monto),
        comisionMeses: Number(meses),
        notifAdminEmails: emails,
        notifRevendedorNuevo: avisoRevendedorNuevo,
        notifFacturaSubida: avisoFacturaSubida,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.error ?? "No se pudo guardar la configuración");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 max-w-[520px]">
      <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em]">Comisión de revendedores</div>
      <p className="text-[13.5px] text-[#5B6577] mt-1.5 mb-0">
        Se aplica a todas las cuotas generadas a partir de ahora. Las cuotas ya generadas no se recalculan.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
        <label className="block">
          <span className="text-[12.5px] text-[#5B6577] font-medium">Monto por cuota (ARS)</span>
          <input
            type="number"
            min={1}
            step="1"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            className="mt-1.5 w-full bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#0C2A45]"
          />
        </label>
        <label className="block">
          <span className="text-[12.5px] text-[#5B6577] font-medium">Cantidad de cuotas (meses)</span>
          <input
            type="number"
            min={1}
            step="1"
            value={meses}
            onChange={(e) => setMeses(e.target.value)}
            required
            className="mt-1.5 w-full bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#0C2A45]"
          />
        </label>
      </div>

      <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em] mt-7">Notificaciones al superadmin</div>
      <p className="text-[13.5px] text-[#5B6577] mt-1.5 mb-0">
        Emails que reciben el aviso de &ldquo;nuevo revendedor&rdquo; y &ldquo;factura subida&rdquo;. No hay usuario de superadmin ligado a una cuenta, así que hay que indicarlo acá.
      </p>
      <label className="block mt-5">
        <span className="text-[12.5px] text-[#5B6577] font-medium">Destinatarios (separados por coma)</span>
        <input
          type="text"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="admin@glob.ar, otro@glob.ar"
          className="mt-1.5 w-full bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#0C2A45]"
        />
      </label>

      <div className="flex flex-col gap-3 mt-4">
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={avisoRevendedorNuevo}
            onChange={(e) => setAvisoRevendedorNuevo(e.target.checked)}
            className="w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
          />
          <span className="text-[14px] text-[#0C2A45]">Avisarme cuando se registra un nuevo revendedor</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={avisoFacturaSubida}
            onChange={(e) => setAvisoFacturaSubida(e.target.checked)}
            className="w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
          />
          <span className="text-[14px] text-[#0C2A45]">Avisarme cuando un revendedor sube una factura</span>
        </label>
      </div>

      {error && <div className="mt-4 text-[13.5px] text-[#9B4A57] font-medium">{error}</div>}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 font-semibold text-[14.5px] bg-[#0E6BA8] text-white border-0 rounded-xl py-3 w-full cursor-pointer disabled:opacity-60"
      >
        {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar cambios"}
      </button>
    </form>
  );
}
