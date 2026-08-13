"use client";

import { useState } from "react";

export function ContactoForm() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "", web: "" });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);

    const res = await fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));

    setEnviando(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo enviar. Probá de nuevo.");
      return;
    }

    setEnviado(true);
    setForm({ nombre: "", email: "", mensaje: "", web: "" });
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

  if (enviado) {
    return (
      <div className="bg-white border border-[#E9ECEF] rounded-[22px] p-10 text-center max-w-[520px] mx-auto">
        <div className="w-12 h-12 rounded-full bg-[#E7F5EE] mx-auto flex items-center justify-center text-[22px] text-[#1B9462] font-bold">✓</div>
        <p className="font-semibold text-[16px] mt-4 mb-1">¡Gracias por escribirnos!</p>
        <p className="text-[14px] text-[#5B6577] m-0">Te respondemos a la brevedad.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-[#E9ECEF] rounded-[22px] p-8 sm:p-10 max-w-[520px] mx-auto flex flex-col gap-4">
      {/* Honeypot — oculto para personas, visible para bots */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label htmlFor="web">No completar</label>
        <input id="web" type="text" tabIndex={-1} autoComplete="off" value={form.web} onChange={(e) => set("web", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Nombre</label>
        <input type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
          required placeholder="Tu nombre" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
          required placeholder="tu@email.com" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Mensaje</label>
        <textarea value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)}
          required rows={4} placeholder="¿En qué te podemos ayudar?" className={inputClass} />
      </div>

      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
          {error}
        </div>
      )}

      <button type="submit" disabled={enviando}
        className="font-semibold text-[15px] bg-[#0E6BA8] text-white border-0 rounded-xl py-3.5 cursor-pointer disabled:opacity-60">
        {enviando ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}
