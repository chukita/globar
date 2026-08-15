"use client";

import { useState } from "react";
import { impersonarRevendedorAction } from "@/lib/actions";

/** Abre el panel del revendedor en una pestaña nueva, autenticado por impersonación. */
export function EntrarComoBoton({ revendedorId }: { revendedorId: string }) {
  const [error, setError] = useState("");

  async function entrarComo() {
    setError("");
    // Abrimos la pestaña ya (sincrónico) para no gatillar el bloqueo de pop-ups.
    const tab = window.open("", "_blank");
    try {
      const { token } = await impersonarRevendedorAction(revendedorId);
      const url = `${window.location.origin}/impersonar?token=${encodeURIComponent(token)}`;
      if (tab) tab.location.href = url;
      else window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      if (tab) tab.close();
      setError(e instanceof Error ? e.message : "No se pudo abrir el panel del revendedor");
    }
  }

  return (
    <div>
      <button
        onClick={entrarComo}
        className="text-[12.5px] font-semibold rounded-full px-3.5 py-1.5 inline-block cursor-pointer border-0 bg-[#E1EFF8] text-[#0B5A8F]"
        title="Entrar al panel de este revendedor"
      >
        Entrar como
      </button>
      {error && <div className="text-[12.5px] text-[#9B4A57] font-medium mt-1.5">{error}</div>}
    </div>
  );
}
