"use client";

import { useState } from "react";

export function ConfiguracionForm({
  comisionMonto,
  comisionMeses,
  diasLiquidacionMp,
}: {
  comisionMonto: number;
  comisionMeses: number;
  diasLiquidacionMp: number;
}) {
  const [monto, setMonto] = useState(String(comisionMonto));
  const [meses, setMeses] = useState(String(comisionMeses));
  const [diasLiquidacion, setDiasLiquidacion] = useState(String(diasLiquidacionMp));
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
        diasLiquidacionMp: Number(diasLiquidacion),
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

      <div className="grid grid-cols-2 gap-5 mt-5">
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

      <div className="mt-6 pt-5 border-t border-[#EEF0F2]">
        <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em]">Ventana antes de facturar</div>
        <p className="text-[13.5px] text-[#5B6577] mt-1.5 mb-3">
          Días desde que el cliente paga hasta que la cuota se considera firme y aparece como facturable para el
          revendedor. No es cuánto tarda Mercado Pago en liquidarte esa plata (eso puede tardar bastante más) — es
          la ventana de derecho de arrepentimiento: pasado ese plazo el cliente ya no puede darse de baja y pedir
          reembolso. Si lo bajás por debajo de lo que tarda MP en liquidarte, vas a estar adelantando la comisión
          de tu bolsillo.
        </p>
        <label className="block max-w-[220px]">
          <span className="text-[12.5px] text-[#5B6577] font-medium">Días de espera</span>
          <input
            type="number"
            min={0}
            step="1"
            value={diasLiquidacion}
            onChange={(e) => setDiasLiquidacion(e.target.value)}
            required
            className="mt-1.5 w-full bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3 text-[15px] font-semibold text-[#0C2A45]"
          />
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
