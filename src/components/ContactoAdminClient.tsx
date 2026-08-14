"use client";

import { useState, useTransition } from "react";
import { responderContactoAction } from "@/lib/actions";

interface Contacto {
  id: string;
  nombre: string;
  email: string;
  mensaje: string;
  respondido: boolean;
  respondidoEn: string | Date | null;
  creadoEn: string | Date;
}

export function ContactoAdminClient({ contactosIniciales }: { contactosIniciales: Contacto[] }) {
  const [contactos, setContactos] = useState(contactosIniciales);
  const [abierto, setAbierto] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const pendientes = contactos.filter(c => !c.respondido);
  const respondidas = contactos.filter(c => c.respondido);

  function enviar(id: string) {
    if (!respuesta.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await responderContactoAction(id, respuesta.trim());
        setContactos(prev => prev.map(c => c.id === id ? { ...c, respondido: true, respondidoEn: new Date() } : c));
        setAbierto(null);
        setRespuesta("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo enviar la respuesta.");
      }
    });
  }

  return (
    <div className="p-10">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Contacto</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
            Consultas recibidas desde el formulario de contacto de la landing.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2.5 mb-4">
          <h2 className="font-bold text-[17px] m-0">Pendientes</h2>
          {pendientes.length > 0 && (
            <span className="text-[12px] font-bold bg-[#FCE6E9] text-[#9B4A57] rounded-full px-2.5 py-0.5">
              {pendientes.length}
            </span>
          )}
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E7F5EE] mx-auto flex items-center justify-center text-[24px] text-[#1B9462] font-bold">✓</div>
            <p className="text-[15px] text-[#5B6577] mt-4 mb-0">No hay consultas pendientes.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {pendientes.map(c => (
              <div key={c.id} className="bg-white border-2 rounded-[18px] overflow-hidden"
                style={{ borderColor: abierto === c.id ? "#0E6BA8" : "#E9ECEF" }}>
                <div className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <span className="font-bold text-[16px]">{c.nombre}</span>
                      <span className="text-[13.5px] text-[#9AA3B2] ml-2">{c.email}</span>
                    </div>
                    <span className="text-[12.5px] text-[#9AA3B2]">{new Date(c.creadoEn).toLocaleString("es-AR")}</span>
                  </div>
                  <p className="text-[14.5px] text-[#3F4A5A] mt-3 mb-0 whitespace-pre-wrap bg-[#F7F8FA] rounded-xl p-4">
                    {c.mensaje}
                  </p>
                </div>
                <div className="px-6 py-4 border-t border-[#F1F3F5] bg-[#FAFBFC]">
                  {abierto !== c.id ? (
                    <button onClick={() => { setAbierto(c.id); setRespuesta(""); setError(""); }}
                      className="font-semibold text-[14px] bg-[#0E6BA8] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer">
                      Responder
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <textarea
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        rows={4}
                        placeholder="Escribí tu respuesta…"
                        className="w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10"
                      />
                      {error && (
                        <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-lg px-3 py-2 text-[12.5px] text-[#9B4A57] font-medium">
                          {error}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button onClick={() => { setAbierto(null); setRespuesta(""); }} disabled={pending}
                          className="font-semibold text-[14px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 cursor-pointer">
                          Cancelar
                        </button>
                        <button onClick={() => enviar(c.id)} disabled={pending || !respuesta.trim()}
                          className="font-semibold text-[14px] bg-[#0B6B47] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer disabled:opacity-60">
                          {pending ? "Enviando…" : "Enviar respuesta"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {respondidas.length > 0 && (
        <div className="mt-8">
          <h2 className="font-bold text-[17px] mb-4 text-[#9AA3B2]">Respondidas</h2>
          <div className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
            {respondidas.map((c, i) => (
              <div key={c.id} className="px-6 py-4 flex items-center justify-between gap-4"
                style={{ borderTop: i > 0 ? "1px solid #F1F3F5" : "none" }}>
                <div>
                  <div className="font-semibold text-[14.5px] text-[#5B6577]">{c.nombre} · {c.email}</div>
                  <div className="text-[12.5px] text-[#B0B8C4] mt-0.5">
                    Recibida {new Date(c.creadoEn).toLocaleDateString("es-AR")}
                  </div>
                </div>
                <span className="text-[12px] font-semibold bg-[#E7F5EE] text-[#0B6B47] rounded-full px-3 py-1.5 flex-shrink-0">
                  Respondida
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
