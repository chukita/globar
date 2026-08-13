"use client";

import { useRef, useState } from "react";
import { eliminarMiCuentaAction } from "@/lib/actions";
import { ConfirmarEliminacionModal } from "@/components/ConfirmarEliminacionModal";

export function EliminarCuentaForm({ codigoVentas }: { codigoVentas: string }) {
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function confirmar() {
    setEnviando(true);
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={eliminarMiCuentaAction} className="hidden" />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-[13.5px] bg-[#FCE6E9] text-[#9B4A57] border-0 rounded-xl px-4 py-2.5 cursor-pointer"
      >
        Eliminar mi cuenta
      </button>
      <ConfirmarEliminacionModal
        open={open}
        titulo="Eliminar tu cuenta definitivamente"
        advertencia="Vas a perder el acceso a todas tus ventas, cuotas y facturas — incluidas las comisiones que ya generaste pero todavía no cobraste, y no vas a poder cobrar comisiones de las suscripciones futuras de tus clientes. Esta acción no se puede deshacer."
        codigoEsperado={codigoVentas}
        confirmando={enviando}
        onConfirm={confirmar}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
