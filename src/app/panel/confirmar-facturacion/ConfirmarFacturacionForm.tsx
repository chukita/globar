"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ConfirmarFacturacionForm() {
  const router = useRouter();
  const [puedeFacturar, setPuedeFacturar] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!puedeFacturar) {
      setError("Necesitás poder emitir factura por tus comisiones para continuar.");
      return;
    }
    if (!terms) {
      setError("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/panel/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ puedeFacturar: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo guardar. Intentá de nuevo.");
      setLoading(false);
      return;
    }
    router.push("/panel/productos");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={puedeFacturar} onChange={(e) => setPuedeFacturar(e.target.checked)} required
          className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0" />
        <span className="text-[13.5px] text-[#0C2A45] leading-snug">
          Puedo emitir factura por mis comisiones de venta (monotributo u otro régimen).
          La cuenta de cobro va a estar a mi nombre.
        </span>
      </label>

      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required
          className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0" />
        <span className="text-[13.5px] text-[#0C2A45] leading-snug">
          Acepto los{" "}
          <Link href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#0E6BA8] font-semibold">Términos y Condiciones</Link>{" "}
          y la{" "}
          <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-[#0E6BA8] font-semibold">Política de Privacidad</Link>.
        </span>
      </label>

      {error && (
        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">{error}</div>
      )}

      <button type="submit" disabled={loading}
        className="w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 mt-1 cursor-pointer border-0 transition-opacity disabled:opacity-60">
        {loading ? "Guardando…" : "Confirmar y entrar al panel"}
      </button>
    </form>
  );
}
