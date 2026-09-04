"use client";

import { useState } from "react";

export function DatosCobroForm({
  currentCbuAlias,
  currentTitularNombre,
  currentTitularCuit,
  currentPuedeFacturar,
}: {
  currentCbuAlias: string;
  currentTitularNombre: string;
  currentTitularCuit: string;
  currentPuedeFacturar: boolean;
}) {
  const [editing, setEditing] = useState(!currentCbuAlias);
  const [cbuAlias, setCbuAlias] = useState(currentCbuAlias);
  const [titularNombre, setTitularNombre] = useState(currentTitularNombre);
  const [titularCuit, setTitularCuit] = useState(currentTitularCuit);
  const [puedeFacturar, setPuedeFacturar] = useState(currentPuedeFacturar);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cbuAlias, titularNombre, titularCuit, puedeFacturar }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar."); return; }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[15px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10";
  const labelClass = "block text-[12.5px] text-[#9AA3B2] font-medium mb-1.5";

  const faltaAlgo = !cbuAlias || !titularNombre || !titularCuit || !puedeFacturar;

  if (!editing) {
    return (
      <div className="flex flex-col gap-4">
        {faltaAlgo && (
          <div className="bg-[#FFF3CD] border border-[#FFD97D] rounded-xl px-4 py-3 text-[13px] text-[#856404] leading-relaxed">
            Te faltan datos de cobro. Necesitás CBU/alias, titular de la cuenta y CUIT/CUIL cargados
            (y tus datos personales completos) para entrar en la liquidación mensual y cobrar tus comisiones.
          </div>
        )}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">CBU o alias</div>
            <div className="text-[15px] font-mono font-semibold text-[#0C2A45] mt-1 tracking-wide">{cbuAlias || "—"}</div>
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">A nombre de</div>
            <div className="text-[15px] font-semibold text-[#0C2A45] mt-1">{titularNombre || "—"}</div>
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">CUIT/CUIL</div>
            <div className="text-[15px] font-semibold text-[#0C2A45] mt-1">{titularCuit || "—"}</div>
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">Puede emitir factura</div>
            <div className="text-[15px] font-semibold text-[#0C2A45] mt-1">{puedeFacturar ? "Sí" : "No"}</div>
          </div>
        </div>
        <button onClick={() => setEditing(true)}
          className="self-start font-semibold text-[13.5px] text-[#0B5A8F] bg-[#E1EFF8] border-0 rounded-xl px-4 py-2.5 cursor-pointer">
          {saved ? "¡Guardado!" : "Editar datos de cobro"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-[480px]">
      <div className="bg-[#FFF8E6] border border-[#F0DCA0] rounded-xl px-4 py-3 text-[13px] text-[#8A6D1E] leading-relaxed">
        La cuenta de cobro tiene que estar a nombre de la misma persona que emite la factura: el CBU/alias, el titular
        y el CUIT/CUIL de acá son los que van a figurar en cada factura a Grupo Globaliza. Sin estos datos no entrás en la liquidación mensual.
      </div>
      <div>
        <label className={labelClass}>CBU o alias</label>
        <input
          type="text"
          value={cbuAlias}
          onChange={(e) => setCbuAlias(e.target.value.trim())}
          placeholder="22 dígitos, o alias tipo juan.perez.mp"
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>A nombre de quién está la cuenta</label>
        <input type="text" value={titularNombre} onChange={(e) => setTitularNombre(e.target.value)}
          placeholder="Nombre y apellido del titular" className={inputClass} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer select-none mt-1">
        <input
          type="checkbox"
          checked={puedeFacturar}
          onChange={(e) => setPuedeFacturar(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
        />
        <span className="text-[13.5px] text-[#0C2A45] leading-snug">
          Puedo emitir facturas por mis comisiones de venta{" "}
          <span className="text-[#9AA3B2] font-normal">(monotributo u otro régimen)</span>
        </span>
      </label>

      {puedeFacturar && (
        <div>
          <label className={labelClass}>CUIT/CUIL <span className="text-[#9B4A57]">(obligatorio para facturar)</span></label>
          <input type="text" value={titularCuit} onChange={(e) => setTitularCuit(e.target.value)}
            placeholder="20-12345678-9" className={inputClass} />
        </div>
      )}

      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-2.5 text-[13px] text-[#9B4A57]">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="font-semibold text-[14px] bg-[#0E6BA8] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar"}
        </button>
        {currentCbuAlias && (
          <button onClick={() => {
            setCbuAlias(currentCbuAlias);
            setTitularNombre(currentTitularNombre);
            setTitularCuit(currentTitularCuit);
            setPuedeFacturar(currentPuedeFacturar);
            setEditing(false);
            setError("");
          }} className="font-semibold text-[14px] bg-white text-[#5B6577] border border-[#DCE0E5] rounded-xl px-5 py-2.5 cursor-pointer">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
