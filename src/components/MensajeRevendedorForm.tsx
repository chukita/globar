"use client";

import { useState, useTransition } from "react";
import { enviarMensajeRevendedorAction } from "@/lib/actions";

export function MensajeRevendedorForm({ revendedorId }: { revendedorId: string }) {
  const [abierto, setAbierto] = useState(false);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function enviar() {
    setError("");
    startTransition(async () => {
      try {
        await enviarMensajeRevendedorAction(revendedorId, asunto.trim(), mensaje.trim());
        setEnviado(true);
        setAsunto("");
        setMensaje("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo enviar el mensaje.");
      }
    });
  }

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-[18px]">Escribir mensaje</div>
        {!abierto && (
          <button onClick={() => { setAbierto(true); setEnviado(false); }}
            className="font-semibold text-[13.5px] bg-[#0E6BA8] text-white border-0 rounded-xl px-4 py-2 cursor-pointer">
            Nuevo mensaje
          </button>
        )}
      </div>

      {abierto && (
        <div className="flex flex-col gap-3 mt-4">
          <input
            type="text"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Asunto"
            className="w-full border border-[#DCE0E5] rounded-xl px-4 py-2.5 text-[14.5px] text-[#0C2A45] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10"
          />
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={4}
            placeholder="Escribí tu mensaje…"
            className="w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10"
          />
          {error && (
            <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-lg px-3 py-2 text-[12.5px] text-[#9B4A57] font-medium">
              {error}
            </div>
          )}
          {enviado && (
            <div className="bg-[#E7F5EE] border border-[#B7DFC9] rounded-lg px-3 py-2 text-[12.5px] text-[#0B6B47] font-medium">
              Mensaje enviado.
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setAbierto(false)} disabled={pending}
              className="font-semibold text-[14px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 cursor-pointer">
              Cerrar
            </button>
            <button onClick={enviar} disabled={pending || !asunto.trim() || !mensaje.trim()}
              className="font-semibold text-[14px] bg-[#0B6B47] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-60">
              {pending ? "Enviando…" : "Enviar mensaje"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
