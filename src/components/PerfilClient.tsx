"use client";

import { useState } from "react";
import { updateZonaAction } from "@/lib/actions";

export function PerfilClient({
  codigoVentas,
  links,
  nombre,
  email,
  zona,
  activo,
}: {
  codigoVentas: string;
  links: { producto: string; url: string }[];
  nombre: string;
  email: string;
  zona: string | null;
  activo: boolean;
}) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [editingZona, setEditingZona] = useState(false);

  function copy(text: string, onDone: () => void) {
    try { navigator.clipboard?.writeText(text); } catch { /* no-op */ }
    onDone();
    setTimeout(() => { setCopiedCode(false); setCopiedLink(null); }, 1600);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-5 mt-5">
        {/* Sales code */}
        <div className="bg-[#0C2A45] rounded-[20px] p-7 relative overflow-hidden">
          <div className="absolute -top-[50px] -right-[30px] w-[200px] h-[200px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
          <div className="relative">
            <div className="text-[13px] text-[#9DB0C4] font-semibold uppercase tracking-[.05em]">Tu código de ventas</div>
            <div className="mt-3.5 font-extrabold text-[30px] tracking-[.04em] text-white border border-dashed border-white/20 rounded-xl px-5 py-3.5 inline-block"
              style={{ background: "rgba(255,255,255,.06)", letterSpacing: ".04em" }}>
              {codigoVentas}
            </div>
            <button onClick={() => copy(codigoVentas, () => setCopiedCode(true))}
              className="mt-4 font-semibold text-[14.5px] bg-[#0E6BA8] text-white border-0 rounded-xl py-3 w-full cursor-pointer">
              {copiedCode ? "¡Copiado!" : "Copiar código"}
            </button>
          </div>
        </div>

        {/* Referral links por producto */}
        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7">
          <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em]">Links de referido</div>
          <div className="flex flex-col gap-2.5 mt-3.5">
            {links.map((l) => (
              <div key={l.producto}>
                <div className="text-[12px] text-[#5B6577] font-semibold mb-1">{l.producto}</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-3.5 py-2.5 overflow-hidden">
                    <span className="text-[13px] text-[#0C2A45] font-medium overflow-hidden text-ellipsis whitespace-nowrap block">
                      {l.url}
                    </span>
                  </div>
                  <button onClick={() => copy(l.url, () => setCopiedLink(l.producto))}
                    className="font-semibold text-[12.5px] bg-[#0C2A45] text-white border-0 rounded-lg px-3 py-2.5 cursor-pointer flex-shrink-0">
                    {copiedLink === l.producto ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[12.5px] text-[#9AA3B2] leading-relaxed mt-3.5 mb-0">
            Las ventas hechas con tu link se asocian automáticamente a tu cuenta.
          </p>
        </div>
      </div>

      {/* Profile data */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[18px]">Datos del revendedor</span>
        </div>
        <div className="grid grid-cols-2 gap-5 mt-5" style={{ rowGap: "20px", columnGap: "32px" }}>
          <div className="border-b border-[#EEF0F2] pb-4">
            <div className="text-[12.5px] text-[#9AA3B2]">Nombre</div>
            <div className="text-[15.5px] font-semibold mt-1">{nombre || "—"}</div>
          </div>
          <div className="border-b border-[#EEF0F2] pb-4">
            <div className="text-[12.5px] text-[#9AA3B2]">Email</div>
            <div className="text-[15.5px] font-semibold mt-1">{email}</div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="text-[12.5px] text-[#9AA3B2]">Zona / Región</div>
              {!editingZona && (
                <button onClick={() => setEditingZona(true)} className="text-[12px] font-semibold text-[#0B5A8F] cursor-pointer bg-transparent border-0">
                  Editar
                </button>
              )}
            </div>
            {editingZona ? (
              <form
                action={async (formData) => { await updateZonaAction(formData); setEditingZona(false); }}
                className="flex items-center gap-2 mt-1.5"
              >
                <input
                  name="zona"
                  defaultValue={zona ?? ""}
                  autoFocus
                  className="flex-1 border border-[#DCE0E5] rounded-lg px-3 py-1.5 text-[14px]"
                />
                <button type="submit" className="text-[12px] font-semibold bg-[#0E6BA8] text-white rounded-lg px-3 py-1.5 cursor-pointer border-0">
                  Guardar
                </button>
              </form>
            ) : (
              <div className="text-[15.5px] font-semibold mt-1">{zona || "Sin especificar"}</div>
            )}
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">Estado de cuenta</div>
            <div className="text-[15.5px] font-semibold mt-1" style={{ color: activo ? "#0B5A8F" : "#9AA3B2" }}>
              {activo ? "Activa" : "Inactiva"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
