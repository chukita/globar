"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { fmtARS } from "@/lib/constants";

// Por navegador: cerrar el aviso no es un dato que importe guardar en la base.
const CERRADO_KEY = "globar_novedad_comision_6000_cerrada";
const EVENTO = "globar-novedad-comision";

function leerCerrado(): boolean {
  try {
    return localStorage.getItem(CERRADO_KEY) === "1";
  } catch {
    return false;
  }
}

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  return () => window.removeEventListener(EVENTO, cb);
}

/**
 * Aviso del aumento de comisión arriba del panel del revendedor. El layout
 * decide si se muestra según la fecha (src/lib/novedades.ts); acá solo se
 * recuerda si el revendedor lo cerró.
 */
export function NovedadComisionBanner({ monto, meses }: { monto: number; meses: number }) {
  // En el server se renderiza oculto (snapshot true) y en el cliente se lee
  // localStorage, para no parpadear en quien ya lo cerró.
  const cerrado = useSyncExternalStore(suscribir, leerCerrado, () => true);

  if (cerrado) return null;

  function cerrar() {
    try {
      localStorage.setItem(CERRADO_KEY, "1");
    } catch {}
    window.dispatchEvent(new Event(EVENTO));
  }

  return (
    <div className="mx-5 mt-5 lg:mx-10 lg:mt-8 max-w-[860px] rounded-2xl bg-[#E8F7EF] border border-[#B9E6CB] px-5 py-4 flex items-start gap-3 text-[#0C2A45]">
      <span className="text-[22px] leading-none" aria-hidden>🎉</span>
      <div className="flex-1 min-w-0 text-[14px] leading-relaxed">
        <div className="font-bold text-[15px]">Aumentamos tu comisión: ahora {fmtARS(monto)} por mes</div>
        <div className="text-[#3D4A5C]">
          Por cada cliente nuevo que se suscriba con tu link cobrás {fmtARS(monto)} durante {meses} meses
          ({fmtARS(monto * meses)} en total).
        </div>
        <Link href="/panel/productos" className="inline-block mt-2 font-semibold text-[#0E7A45] underline">
          Ver mis links para compartir
        </Link>
      </div>
      <button
        type="button"
        onClick={cerrar}
        aria-label="Cerrar aviso"
        className="border-0 bg-transparent text-[#5B6577] text-[20px] leading-none cursor-pointer px-1"
      >
        ×
      </button>
    </div>
  );
}
