"use client";

import { useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/capacitacionQuiz";

type Step = "video" | "quiz";
type Resultado = { ok: true } | { ok: false; error: string };

export function EvaluacionStepper({
  videoUrl,
  quiz,
  onSubmit,
  successTitle,
  successBody,
}: {
  videoUrl?: string;
  quiz: QuizQuestion[];
  onSubmit: (respuestas: Record<string, number>) => Promise<Resultado>;
  successTitle: string;
  successBody: React.ReactNode;
}) {
  const [step, setStep] = useState<Step>("video");
  const [videoDone, setVideoDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function onTimeUpdate() {
    const v = videoRef.current;
    if (!v || videoDone) return;
    if (v.duration && v.currentTime / v.duration >= 0.9) setVideoDone(true);
  }

  function selectAnswer(qid: string, idx: number) {
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
    if (errorMsg) setErrorMsg(null);
  }

  const answeredAll = quiz.every((q) => answers[q.id] !== undefined);

  async function submitQuiz() {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const result = await onSubmit(answers);
      if (result.ok) {
        setDone(true);
      } else {
        setErrorMsg(result.error);
      }
    } catch {
      // Un `throw` real acá es un caso inesperado (sesión caída, etc.) — en
      // producción Next.js reemplaza el mensaje real por uno genérico en
      // inglés, así que no lo mostramos, mensaje fijo en español.
      setErrorMsg("No se pudo procesar la evaluación. Probá de nuevo en unos segundos.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="bg-[#E7F5EE] border border-[#9BD3B6] rounded-[16px] px-8 py-10 text-center">
        <div className="w-[56px] h-[56px] rounded-full bg-white mx-auto flex items-center justify-center text-[24px] font-extrabold text-[#1B9462]">
          ✓
        </div>
        <h3 className="font-extrabold text-[19px] mt-4 mb-0 text-[#0B6B47]" style={{ letterSpacing: "-0.02em" }}>
          {successTitle}
        </h3>
        <p className="text-[13.5px] text-[#3F7A5E] mt-2 mb-0 max-w-[380px] mx-auto">
          {successBody}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-4">
        {[{ key: "video", label: "Video" }, { key: "quiz", label: "Evaluación" }].map((s, i) => (
          <div key={s.key} className="flex items-center gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center font-bold text-[11.5px]"
                style={{
                  background: (s.key === step || (s.key === "video" && step === "quiz")) ? "#0E6BA8" : "#E9ECEF",
                  color: (s.key === step || (s.key === "video" && step === "quiz")) ? "#fff" : "#9AA3B2",
                }}>
                {s.key === "video" && step === "quiz" ? "✓" : i + 1}
              </span>
              <span className="font-semibold text-[13px]" style={{ color: s.key === step ? "#0C2A45" : "#9AA3B2" }}>
                {s.label}
              </span>
            </div>
            {i === 0 && <div className="w-[24px] h-0.5 bg-[#E3E8ED]" />}
          </div>
        ))}
      </div>

      {step === "video" && (
        <div className="bg-[#0C2A45] rounded-[16px] overflow-hidden">
          {videoUrl && videoUrl !== "#" ? (
            <video ref={videoRef} src={videoUrl} controls onTimeUpdate={onTimeUpdate} onEnded={() => setVideoDone(true)}
              className="w-full block" style={{ maxHeight: 420, background: "#000" }} />
          ) : (
            <div className="h-[240px] flex items-center justify-center text-[#7E94AB] text-sm">Video no disponible</div>
          )}
          <div className="p-[16px] px-[20px] flex items-center justify-between gap-3 bg-white">
            <span className="text-[13px] text-[#5B6577]">
              {videoDone ? "Listo · ya podés continuar" : "Mirá el video completo para continuar"}
            </span>
            <button onClick={() => setStep("quiz")} disabled={!videoDone}
              className="font-semibold text-[13.5px] border-0 rounded-xl px-5 py-2.5"
              style={{
                cursor: videoDone ? "pointer" : "not-allowed",
                background: videoDone ? "#0E6BA8" : "#E3E8ED",
                color: videoDone ? "#fff" : "#9AA3B2",
              }}>
              Continuar a la evaluación
            </button>
          </div>
        </div>
      )}

      {step === "quiz" && (
        <div className="flex flex-col gap-3.5">
          {quiz.map((q) => {
            const sel = answers[q.id];
            return (
              <div key={q.id} className="bg-[#F7F8FA] border border-[#E9ECEF] rounded-[14px] p-5">
                <div className="font-bold text-[14.5px] text-[#0C2A45]">{q.q}</div>
                <div className="flex flex-col gap-2 mt-3">
                  {q.options.map((label, idx) => {
                    const selected = sel === idx;
                    return (
                      <div key={idx} onClick={() => selectAnswer(q.id, idx)}
                        className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 cursor-pointer border-[1.5px] transition-colors bg-white"
                        style={{ borderColor: selected ? "#0E6BA8" : "#E9ECEF" }}>
                        <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: selected ? "#0E6BA8" : "#CBD2DA" }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: selected ? "#0E6BA8" : "transparent" }} />
                        </span>
                        <span className="text-[13.5px] font-medium" style={{ color: selected ? "#0B5A8F" : "#0C2A45" }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {errorMsg && (
            <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-[12px] px-4 py-3 text-[13px] text-[#9B4A57]">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setStep("video")}
              className="font-semibold text-[13.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-4 py-2.5 cursor-pointer">
              Volver al video
            </button>
            <button onClick={submitQuiz} disabled={!answeredAll || submitting}
              className="font-semibold text-[13.5px] border-0 rounded-xl px-5 py-2.5"
              style={{
                cursor: (answeredAll && !submitting) ? "pointer" : "not-allowed",
                background: (answeredAll && !submitting) ? "#0E6BA8" : "#E3E8ED",
                color: (answeredAll && !submitting) ? "#fff" : "#9AA3B2",
              }}>
              {submitting ? "Enviando…" : "Enviar respuestas"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
