"use client";

import { eliminarMiCuentaAction } from "@/lib/actions";

export function EliminarCuentaForm() {
  return (
    <form
      action={eliminarMiCuentaAction}
      onSubmit={(e) => {
        const confirmado = window.confirm(
          "¿Seguro que querés eliminar tu cuenta de revendedor?\n\n" +
          "Vas a perder el acceso a todas tus ventas, cuotas y facturas — incluidas las comisiones que ya generaste pero todavía no cobraste, y no vas a poder cobrar comisiones de las suscripciones futuras de tus clientes.\n\n" +
          "Esta acción no se puede deshacer."
        );
        if (!confirmado) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="font-semibold text-[13.5px] bg-[#FCE6E9] text-[#9B4A57] border-0 rounded-xl px-4 py-2.5 cursor-pointer"
      >
        Eliminar mi cuenta
      </button>
    </form>
  );
}
