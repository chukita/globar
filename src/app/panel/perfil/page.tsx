"use client";

import { useState } from "react";
import { COMMISSION_PER_MONTH, fmtARS } from "@/lib/constants";

const SALES_CODE = "GLOBMQ-7K2";
const REF_LINK = "https://glob.ar/r/martina-quiroga";

export default function PerfilPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function copy(text: string, setter: (v: boolean) => void) {
    try { navigator.clipboard?.writeText(text); } catch (_) {}
    setter(true);
    setTimeout(() => setter(false), 1600);
  }

  const stats = [
    { label: "Ventas totales",          value: "8",                              accent: "#0C2A45" },
    { label: "Comisiones cobradas",     value: fmtARS(COMMISSION_PER_MONTH * 13), accent: "#0B5A8F" },
    { label: "Comisiones pendientes",   value: fmtARS(COMMISSION_PER_MONTH * 6),  accent: "#9B4A57" },
  ];

  return (
    <div className="p-10 max-w-[980px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Perfil y código de ventas</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Gestioná tus datos y compartí tu código para registrar nuevas ventas.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-2xl p-[22px]">
            <div className="text-[13px] text-[#5B6577]">{s.label}</div>
            <div className="font-extrabold text-[32px] mt-1.5" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        {/* Sales code */}
        <div className="bg-[#0C2A45] rounded-[20px] p-7 relative overflow-hidden">
          <div className="absolute -top-[50px] -right-[30px] w-[200px] h-[200px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
          <div className="absolute -bottom-[60px] -left-[30px] w-[150px] h-[150px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.16),transparent 70%)" }} />
          <div className="relative">
            <div className="text-[13px] text-[#9DB0C4] font-semibold uppercase tracking-[.05em]">Tu código de ventas</div>
            <div className="mt-3.5 font-extrabold text-[30px] tracking-[.04em] text-white border border-dashed border-white/20 rounded-xl px-5 py-3.5 inline-block"
              style={{ background: "rgba(255,255,255,.06)", letterSpacing: ".04em" }}>
              {SALES_CODE}
            </div>
            <button onClick={() => copy(SALES_CODE, setCopiedCode)}
              className="mt-4 font-semibold text-[14.5px] bg-[#0E6BA8] text-white border-0 rounded-xl py-3 w-full cursor-pointer">
              {copiedCode ? "¡Copiado!" : "Copiar código"}
            </button>
          </div>
        </div>

        {/* Referral link */}
        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7">
          <div className="text-[13px] text-[#9AA3B2] font-semibold uppercase tracking-[.05em]">Link de referido</div>
          <div className="mt-3.5 flex items-center gap-2.5 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3.5">
            <span className="text-[14.5px] text-[#0C2A45] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
              {REF_LINK}
            </span>
          </div>
          <button onClick={() => copy(REF_LINK, setCopiedLink)}
            className="mt-4 font-semibold text-[14.5px] bg-[#0C2A45] text-white border-0 rounded-xl py-3 w-full cursor-pointer">
            {copiedLink ? "¡Link copiado!" : "Copiar link"}
          </button>
          <p className="text-[12.5px] text-[#9AA3B2] leading-relaxed mt-3.5 mb-0">
            Las ventas hechas con tu link se asocian automáticamente a tu cuenta.
          </p>
        </div>
      </div>

      {/* Profile data */}
      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[18px]">Datos del revendedor</span>
          <span className="text-[13px] font-semibold text-[#0B5A8F] cursor-pointer">Editar</span>
        </div>
        <div className="grid grid-cols-2 gap-5 mt-5" style={{ rowGap: "20px", columnGap: "32px" }}>
          <div className="border-b border-[#EEF0F2] pb-4">
            <div className="text-[12.5px] text-[#9AA3B2]">Nombre</div>
            <div className="text-[15.5px] font-semibold mt-1">Martina Quiroga</div>
          </div>
          <div className="border-b border-[#EEF0F2] pb-4">
            <div className="text-[12.5px] text-[#9AA3B2]">Email</div>
            <div className="text-[15.5px] font-semibold mt-1">martina.quiroga@gmail.com</div>
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">Zona / Región</div>
            <div className="text-[15.5px] font-semibold mt-1">Córdoba Capital</div>
          </div>
          <div>
            <div className="text-[12.5px] text-[#9AA3B2]">Estado de cuenta</div>
            <div className="text-[15.5px] font-semibold mt-1 text-[#0B5A8F]">Activa</div>
          </div>
        </div>
      </div>
    </div>
  );
}
