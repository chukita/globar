"use client";

import { useState } from "react";

export function CbuForm({ currentCbu }: { currentCbu: string }) {
  const [cbu, setCbu] = useState(currentCbu);
  const [editing, setEditing] = useState(!currentCbu);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cbu }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar."); return; }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3">
          <span className="text-[15px] font-mono font-semibold text-[#0C2A45] tracking-widest">
            {cbu || "—"}
          </span>
        </div>
        <button onClick={() => setEditing(true)}
          className="font-semibold text-[13.5px] text-[#0B5A8F] bg-[#E1EFF8] border-0 rounded-xl px-4 py-3 cursor-pointer whitespace-nowrap">
          {saved ? "¡Guardado!" : "Editar CBU"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={cbu}
        onChange={(e) => setCbu(e.target.value.replace(/\D/g, "").slice(0, 22))}
        placeholder="22 dígitos — ej: 0000000000000000000000"
        className="w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[15px] font-mono tracking-widest text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10"
      />
      <div className="flex items-center gap-2 text-[12.5px] text-[#9AA3B2]">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cbu.length === 22 ? "#1B9462" : "#E3E8ED" }} />
        {cbu.length}/22 dígitos
      </div>
      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-2.5 text-[13px] text-[#9B4A57]">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving || cbu.length !== 22}
          className="font-semibold text-[14px] bg-[#0E6BA8] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar CBU"}
        </button>
        {currentCbu && (
          <button onClick={() => { setCbu(currentCbu); setEditing(false); setError(""); }}
            className="font-semibold text-[14px] bg-white text-[#5B6577] border border-[#DCE0E5] rounded-xl px-5 py-2.5 cursor-pointer">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
