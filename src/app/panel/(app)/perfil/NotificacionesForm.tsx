"use client";

import { useState } from "react";

export function NotificacionesForm({
  notifFacturaPagada: notifFacturaPagadaInicial,
  notifComisionGenerada: notifComisionGeneradaInicial,
}: {
  notifFacturaPagada: boolean;
  notifComisionGenerada: boolean;
}) {
  const [notifFacturaPagada, setNotifFacturaPagada] = useState(notifFacturaPagadaInicial);
  const [notifComisionGenerada, setNotifComisionGenerada] = useState(notifComisionGeneradaInicial);
  const [saving, setSaving] = useState(false);

  async function toggle(field: "notifFacturaPagada" | "notifComisionGenerada", value: boolean) {
    setSaving(true);
    if (field === "notifFacturaPagada") setNotifFacturaPagada(value);
    else setNotifComisionGenerada(value);

    await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    }).catch(() => {});
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={notifFacturaPagada}
          disabled={saving}
          onChange={(e) => toggle("notifFacturaPagada", e.target.checked)}
          className="w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
        />
        <span className="text-[14px] text-[#0C2A45]">Avisarme por email cuando me paguen una factura</span>
      </label>
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={notifComisionGenerada}
          disabled={saving}
          onChange={(e) => toggle("notifComisionGenerada", e.target.checked)}
          className="w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
        />
        <span className="text-[14px] text-[#0C2A45]">Avisarme por email cuando se genere una nueva cuota de comisión</span>
      </label>
    </div>
  );
}
