"use client";

import { useState } from "react";
import { completarCapacitacionAction } from "@/lib/actions";
import { EvaluacionStepper } from "@/components/EvaluacionStepper";
import type { QuizQuestion } from "@/lib/capacitacionQuiz";

type Material = { tipo: "video" | "pdf" | "link"; titulo: string; duracion?: string; url: string };
type Producto  = {
  id: string;
  nombre: string;
  descripcion: string;
  dominio: string;
  materiales: Material[];
  habilitado: boolean;
  requiereEvaluacion: boolean;
  quiz: QuizQuestion[] | null;
  esOnboardingGeneral?: boolean;
};

const COLORS: Record<string, { bg: string; text: string }> = {
  agendaonline: { bg: "#E1EFF8", text: "#0B5A8F" },
  nume:         { bg: "#F0E8F8", text: "#7B4FA6" },
  globar:       { bg: "#0C2A45", text: "#FFFFFF" },
};
const DEFAULT_COLOR = { bg: "#E9ECEF", text: "#5B6577" };

const ICON_VIDEO = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect width="16" height="16" rx="4" fill="#0E6BA8" fillOpacity=".12"/>
    <path d="M6 5.5l5 2.5-5 2.5V5.5z" fill="#0E6BA8"/>
  </svg>
);
const ICON_PDF = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect width="16" height="16" rx="4" fill="#9B4A57" fillOpacity=".12"/>
    <path d="M5 3h4l3 3v7H5V3z" stroke="#9B4A57" strokeWidth="1.2" fill="none"/>
    <path d="M9 3v3h3" stroke="#9B4A57" strokeWidth="1.2"/>
  </svg>
);
const ICON_LINK = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect width="16" height="16" rx="4" fill="#1B9462" fillOpacity=".12"/>
    <path d="M7 9a3 3 0 0 0 4.24 0l1.5-1.5a3 3 0 0 0-4.24-4.24L7.38 4.38" stroke="#1B9462" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9 7a3 3 0 0 0-4.24 0l-1.5 1.5a3 3 0 0 0 4.24 4.24l1.12-1.12" stroke="#1B9462" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export function CapacitacionClient({ productos }: { productos: Producto[] }) {
  const [abierto, setAbierto] = useState<string | null>(productos[0]?.id ?? null);

  if (productos.length === 0) {
    return <p className="text-[14.5px] text-[#9AA3B2] mt-6">No hay productos disponibles aún.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-3 mt-7">
        {productos.map((p) => {
          const open = abierto === p.id;
          const c = (p.esOnboardingGeneral ? COLORS.globar : COLORS[p.nombre]) ?? DEFAULT_COLOR;
          const inicial = p.nombre[0].toLowerCase();
          const gateado = p.requiereEvaluacion && !p.habilitado && p.quiz;

          return (
            <div key={p.id} className="bg-white border border-[#E9ECEF] rounded-[18px] overflow-hidden">
              <button
                onClick={() => setAbierto(open ? null : p.id)}
                className="w-full flex items-center gap-4 px-6 py-5 cursor-pointer border-0 bg-transparent text-left"
              >
                <span className="w-10 h-10 rounded-[11px] flex items-center justify-center font-extrabold text-[18px] flex-shrink-0"
                  style={{ background: c.bg, color: c.text }}>
                  {inicial}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[16px] text-[#0C2A45]">{p.nombre}</div>
                  <div className="text-[13px] text-[#5B6577] mt-0.5 truncate">{p.descripcion}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {p.esOnboardingGeneral ? (
                    <span className="text-[11.5px] font-bold text-[#1B9462] bg-[#E7F5EE] border border-[#9BD3B6] rounded-full px-3 py-1 flex items-center gap-1.5">
                      <span className="w-[6px] h-[6px] rounded-full bg-[#1B9462]" />
                      Completado
                    </span>
                  ) : p.requiereEvaluacion && (
                    p.habilitado ? (
                      <span className="text-[11.5px] font-bold text-[#1B9462] bg-[#E7F5EE] border border-[#9BD3B6] rounded-full px-3 py-1 flex items-center gap-1.5">
                        <span className="w-[6px] h-[6px] rounded-full bg-[#1B9462]" />
                        Activado
                      </span>
                    ) : (
                      <span className="text-[12px] font-semibold text-[#7B4FA6] bg-[#F0E8F8] border border-[#D4B8F0] rounded-full px-3 py-1">
                        Requiere capacitación
                      </span>
                    )
                  )}
                  <span className="text-[12px] font-semibold text-[#5B6577] bg-[#F7F8FA] border border-[#E9ECEF] rounded-full px-3 py-1">
                    {p.materiales.length} material{p.materiales.length !== 1 ? "es" : ""}
                  </span>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .18s" }}>
                    <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="#9AA3B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {open && (
                <div className="border-t border-[#F0F2F5] px-6 pb-6 pt-5">
                  {gateado && p.quiz ? (
                    <EvaluacionStepper
                      videoUrl={p.materiales.find(m => m.tipo === "video")?.url}
                      quiz={p.quiz}
                      onSubmit={(respuestas) => completarCapacitacionAction(p.nombre, respuestas)}
                      successTitle="¡Aprobaste la capacitación!"
                      successBody={<>{p.nombre} ya está activado en tu cuenta — recargá la página para ver tu link en &quot;Mis productos&quot;.</>}
                    />
                  ) : (
                    <>
                      {p.materiales.length === 0 ? (
                        <p className="text-[14px] text-[#9AA3B2]">Materiales próximamente.</p>
                      ) : (
                        <>
                          <div className="text-[12.5px] font-semibold text-[#9AA3B2] uppercase tracking-[.06em] mb-3">Materiales</div>
                          <div className="flex flex-col gap-2.5">
                            {p.materiales.map((m, i) => (
                              <a key={i} href={m.url} target="_blank" rel="noreferrer"
                                className="flex items-center gap-3 bg-[#F7F8FA] border border-[#E9ECEF] rounded-xl px-4 py-3.5 no-underline hover:border-[#C5D4E0] transition-colors">
                                <span className="flex-shrink-0">
                                  {m.tipo === "video" ? ICON_VIDEO : m.tipo === "pdf" ? ICON_PDF : ICON_LINK}
                                </span>
                                <span className="flex-1 text-[14px] font-semibold text-[#0C2A45]">{m.titulo}</span>
                                {m.duracion && <span className="text-[12.5px] text-[#9AA3B2] flex-shrink-0">{m.duracion}</span>}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 opacity-40">
                                  <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="#0C2A45" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </a>
                            ))}
                          </div>
                        </>
                      )}

                      {/* Evaluación */}
                      {p.esOnboardingGeneral ? null : p.requiereEvaluacion && p.habilitado ? (
                        <div className="mt-5 bg-[#E7F5EE] border border-[#9BD3B6] rounded-[14px] px-5 py-4">
                          <div className="font-bold text-[14.5px] text-[#0B6B47]">Producto activado</div>
                          <div className="text-[13px] text-[#3F7A5E] mt-0.5">
                            Ya aprobaste la capacitación de {p.nombre}. Podés compartir tu link de ventas desde &quot;Mis productos&quot;.
                          </div>
                        </div>
                      ) : !p.requiereEvaluacion ? (
                        <div className="mt-5 bg-[#F7F8FA] border border-dashed border-[#D0D7DE] rounded-[14px] px-5 py-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-[14.5px] text-[#0C2A45]">Evaluación opcional</span>
                              <span className="text-[11px] font-semibold text-[#7B4FA6] bg-[#F0E8F8] border border-[#D4B8F0] rounded-full px-2.5 py-0.5">
                                Próximamente
                              </span>
                            </div>
                            <div className="text-[13px] text-[#5B6577]">
                              Próximamente vas a poder rendir la evaluación y obtener un incentivo especial.
                            </div>
                          </div>
                          <button disabled
                            className="flex-shrink-0 font-semibold text-[13.5px] bg-[#E9ECEF] text-[#9AA3B2] border-0 rounded-xl px-5 py-2.5 cursor-not-allowed">
                            Rendir
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[12.5px] text-[#9AA3B2] mt-6 mb-0">
        Los materiales se actualizan cuando se incorporan nuevos productos al catálogo.
      </p>
    </>
  );
}
