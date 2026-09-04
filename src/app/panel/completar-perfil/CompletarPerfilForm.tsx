"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProvinciaLocalidadFields } from "@/components/ProvinciaLocalidadFields";

// Calculado una sola vez al cargar el módulo — Date.now() es impuro y React 19
// rechaza llamarlo durante el render, incluso en useMemo (mismo motivo que en /registro).
const MAX_FECHA_NACIMIENTO = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10);

export function CompletarPerfilForm({
  dni: dniInicial,
  fechaNacimiento: fechaInicial,
  telefono: telefonoInicial,
  provincia: provinciaInicial,
  localidad: localidadInicial,
}: {
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  provincia: string;
  localidad: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    dni: dniInicial,
    fechaNacimiento: fechaInicial,
    telefono: telefonoInicial,
    provincia: provinciaInicial,
    localidad: localidadInicial,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
      return;
    }

    router.push("/panel/perfil");
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 mt-1 cursor-pointer border-0 transition-opacity disabled:opacity-60">
        {loading ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
