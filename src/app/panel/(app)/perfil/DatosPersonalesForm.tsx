"use client";

import { useState } from "react";
import { ProvinciaLocalidadFields } from "@/components/ProvinciaLocalidadFields";

const MAX_FECHA_NACIMIENTO = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10);

export function DatosPersonalesForm({
  dni: dniInicial,
  fechaNacimiento: fechaInicial,
  provincia: provinciaInicial,
  localidad: localidadInicial,
  telefono: telefonoInicial,
}: {
  dni: string;
  fechaNacimiento: string;
  provincia: string;
  localidad: string;
  telefono: string;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    dni: dniInicial,
    fechaNacimiento: fechaInicial,
    provincia: provinciaInicial,
    localidad: localidadInicial,
    telefono: telefonoInicial,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    const res = await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "Error al guardar."); return; }
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[12.5px] text-[#9AA3B2] font-medium mb-1.5";

  if (!editing) {
    return (
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <DataRow label="DNI" value={form.dni || "—"} />
        <DataRow label="Fecha de nacimiento" value={form.fechaNacimiento ? formatFecha(form.fechaNacimiento) : "—"} />
        <DataRow label="Provincia" value={form.provincia || "—"} />
        <DataRow label="Localidad" value={form.localidad || "—"} />
        <DataRow label="Teléfono" value={form.telefono || "—"} />
        <div className="border-b border-[#EEF0F2] pb-4 flex items-end">
          <button onClick={() => setEditing(true)}
            className="font-semibold text-[13.5px] text-[#0B5A8F] bg-[#E1EFF8] border-0 rounded-xl px-4 py-2.5 cursor-pointer">
            {saved ? "¡Guardado!" : "Editar datos"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-[520px]">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>DNI</label>
          <input type="text" value={form.dni} onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))}
            maxLength={8} placeholder="12345678" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Fecha de nacimiento</label>
          <input type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)}
            max={MAX_FECHA_NACIMIENTO} className={inputClass} />
        </div>
      </div>

      <ProvinciaLocalidadFields
        provincia={form.provincia}
        localidad={form.localidad}
        onProvinciaChange={(v) => set("provincia", v)}
        onLocalidadChange={(v) => set("localidad", v)}
        inputClass={inputClass}
        labelClass={labelClass}
      />

      <div>
        <label className={labelClass}>Teléfono</label>
        <input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
          placeholder="11 2345-6789" className={inputClass} />
      </div>

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
        <button onClick={() => {
          setForm({ dni: dniInicial, fechaNacimiento: fechaInicial, provincia: provinciaInicial, localidad: localidadInicial, telefono: telefonoInicial });
          setEditing(false);
          setError("");
        }} className="font-semibold text-[14px] bg-white text-[#5B6577] border border-[#DCE0E5] rounded-xl px-5 py-2.5 cursor-pointer">
          Cancelar
        </button>
      </div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#EEF0F2] pb-4">
      <div className="text-[12.5px] text-[#9AA3B2]">{label}</div>
      <div className="text-[15px] font-semibold mt-1 text-[#0C2A45]">{value}</div>
    </div>
  );
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
