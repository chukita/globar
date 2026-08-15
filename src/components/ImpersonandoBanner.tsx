"use client";

import { salirDeImpersonacionAction } from "@/lib/actions";

/**
 * Sesión iniciada por un superadmin desde "Entrar como" (ver
 * impersonarRevendedorAction). La cookie de sesión es compartida por todo
 * el navegador — mientras esta pestaña está en el panel del revendedor,
 * cualquier otra pestaña con /admin abierta va a ver esta misma sesión en
 * su próximo request. Este botón corta la sesión y vuelve a /admin/login.
 */
export function ImpersonandoBanner({ nombreRevendedor }: { nombreRevendedor: string }) {
  return (
    <div className="w-full bg-[#0C2A45] text-white px-5 py-2.5 flex items-center justify-center gap-4 flex-wrap text-[13.5px] font-medium">
      <span>Estás viendo el panel de <strong>{nombreRevendedor}</strong> como superadmin.</span>
      <form action={salirDeImpersonacionAction}>
        <button type="submit" className="font-semibold underline cursor-pointer border-0 bg-transparent text-white">
          Salir y volver a admin
        </button>
      </form>
    </div>
  );
}
