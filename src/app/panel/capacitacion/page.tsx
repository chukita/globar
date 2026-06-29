"use client";

import { useState } from "react";
import Link from "next/link";

const QUIZ_RAW = [
  {
    id: "q1",
    q: "¿Para qué tipo de negocios está pensado agendaonline?",
    options: ["Solo para comercios de indumentaria", "Profesionales, estudios y clínicas que gestionan turnos", "Exclusivamente para restaurantes"],
    correct: 1,
  },
  {
    id: "q2",
    q: "¿Cuánto cobra el revendedor de comisión por una venta?",
    options: ["Un único pago de $7.000", "$7.000 por mes durante 3 meses", "El 10% de por vida"],
    correct: 1,
  },
  {
    id: "q3",
    q: "¿Cómo se registra una venta del revendedor?",
    options: ["Hay que cargarla a mano en el panel", "Automáticamente cuando el cliente se suscribe con tu código", "La registra el cliente por email"],
    correct: 1,
  },
];

type OnbStep = "video" | "quiz" | "done";

export default function CapacitacionPage() {
  const [onbStep, setOnbStep] = useState<OnbStep>("video");
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDone, setVideoDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<"pass" | "fail" | null>(null);

  function playVideo() {
    if (videoDone || playing) return;
    setPlaying(true);
    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        const next = Math.min(100, prev + 4);
        if (next >= 100) {
          clearInterval(interval);
          setVideoDone(true);
          setPlaying(false);
        }
        return next;
      });
    }, 110);
  }

  function selectAnswer(qid: string, idx: number) {
    if (quizResult === "pass") return;
    setAnswers((prev) => ({ ...prev, [qid]: idx }));
    if (quizResult === "fail") setQuizResult(null);
  }

  function submitQuiz() {
    const allOk = QUIZ_RAW.every((q) => answers[q.id] === q.correct);
    setQuizResult(allOk ? "pass" : "fail");
    if (allOk) setOnbStep("done");
  }

  const stepOrder: Record<OnbStep, number> = { video: 0, quiz: 1, done: 2 };
  const curIdx = stepOrder[onbStep];
  const onbSteps = [
    { key: "video", label: "Video" },
    { key: "quiz",  label: "Evaluación" },
    { key: "done",  label: "Alta en el sistema" },
  ];

  const answeredAll = QUIZ_RAW.every((q) => answers[q.id] !== undefined);

  return (
    <div className="p-10 max-w-[920px]">
      <div className="flex items-center gap-3">
        <span className="text-[12.5px] font-semibold text-[#0B5A8F] bg-[#E1EFF8] rounded-full px-3 py-1.5">
          agendaonline
        </span>
        <span className="text-[13px] text-[#9AA3B2]">Capacitación obligatoria para habilitar la venta</span>
      </div>
      <h1 className="font-extrabold text-[30px] mt-3 mb-0" style={{ letterSpacing: "-0.025em" }}>
        Aprobá el onboarding para vender agendaonline
      </h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Mirá el video de capacitación y aprobá la evaluación. Al completarlo se habilita tu código para este producto.
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-2.5 mt-6">
        {onbSteps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-bold text-[14px]"
                style={{
                  background: i <= curIdx ? "#0E6BA8" : "#E9ECEF",
                  color: i <= curIdx ? "#fff" : "#9AA3B2",
                }}>
                {i < curIdx ? "✓" : i + 1}
              </div>
              <span className="font-semibold text-sm" style={{ color: i <= curIdx ? "#0C2A45" : "#9AA3B2" }}>
                {s.label}
              </span>
            </div>
            {i < onbSteps.length - 1 && <div className="w-[34px] h-0.5 bg-[#E3E8ED]" />}
          </div>
        ))}
      </div>

      {/* Video step */}
      {onbStep === "video" && (
        <div className="mt-6 bg-white border border-[#E9ECEF] rounded-[20px] overflow-hidden">
          <div onClick={playVideo}
            className="relative h-[360px] bg-[#0C2A45] flex items-center justify-center overflow-hidden"
            style={{ cursor: videoDone ? "default" : "pointer" }}>
            <div className="absolute inset-0"
              style={{ background: "repeating-linear-gradient(45deg,rgba(255,255,255,.03),rgba(255,255,255,.03) 12px,transparent 12px,transparent 24px)" }} />
            <div className="absolute -top-[60px] -right-[30px] w-[240px] h-[240px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(14,107,168,.5),transparent 70%)" }} />
            <div className="relative text-center">
              <div className="w-[78px] h-[78px] rounded-full mx-auto flex items-center justify-center border border-white/30"
                style={{ background: "rgba(255,255,255,.14)" }}>
                <div style={{ width: 0, height: 0, borderTop: "15px solid transparent", borderBottom: "15px solid transparent", borderLeft: "24px solid #fff", marginLeft: 6 }} />
              </div>
              <div className="text-[#DCEAF4] text-sm mt-4 font-semibold">
                {videoDone ? "Video completado" : playing ? "Reproduciendo…" : "Reproducir video de capacitación"}
              </div>
              <div className="text-[#7E94AB] text-[12.5px] mt-0.5">Módulo 1 · agendaonline · 4:30 min</div>
            </div>
          </div>
          <div className="p-[18px] px-[22px]">
            <div className="h-[7px] bg-[#EEF1F4] rounded-full overflow-hidden">
              <div className="h-full bg-[#0E6BA8] rounded-full transition-[width] duration-[120ms]"
                style={{ width: `${videoProgress}%` }} />
            </div>
            <div className="flex items-center justify-between mt-3.5">
              <span className="text-[13px] text-[#5B6577]">
                {videoDone ? "Listo · ya podés continuar" : playing ? "Mirando el video…" : "Tocá el video para reproducir"}
              </span>
              <button onClick={() => setOnbStep("quiz")} disabled={!videoDone}
                className="font-semibold text-[14.5px] border-0 rounded-xl px-[22px] py-3"
                style={{
                  cursor: videoDone ? "pointer" : "not-allowed",
                  background: videoDone ? "#0E6BA8" : "#E3E8ED",
                  color: videoDone ? "#fff" : "#9AA3B2",
                }}>
                Continuar a la evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz step */}
      {onbStep === "quiz" && (
        <div className="mt-6 flex flex-col gap-4">
          {QUIZ_RAW.map((q) => {
            const sel = answers[q.id];
            return (
              <div key={q.id} className="bg-white border border-[#E9ECEF] rounded-[18px] p-6">
                <div className="font-bold text-[17px]" style={{ letterSpacing: "-0.01em" }}>{q.q}</div>
                <div className="flex flex-col gap-2.5 mt-4">
                  {q.options.map((label, idx) => {
                    const selected = sel === idx;
                    let bg = "#fff", border = "#E9ECEF", fg = "#0C2A45", dot = "#CBD2DA", dotInner = "transparent";
                    if (quizResult === "pass" || quizResult === "fail") {
                      if (idx === q.correct) { bg = "#E7F5EE"; border = "#9BD3B6"; fg = "#0B6B47"; dot = "#1B9462"; dotInner = "#1B9462"; }
                      else if (selected) { bg = "#FCE6E9"; border = "#E7A9B3"; fg = "#9B4A57"; dot = "#9B4A57"; dotInner = "#9B4A57"; }
                    } else if (selected) { bg = "#F1F8FC"; border = "#0E6BA8"; fg = "#0B5A8F"; dot = "#0E6BA8"; dotInner = "#0E6BA8"; }
                    return (
                      <div key={idx} onClick={() => selectAnswer(q.id, idx)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border-[1.5px] transition-colors"
                        style={{ background: bg, borderColor: border }}>
                        <span className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: dot }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: dotInner }} />
                        </span>
                        <span className="text-[14.5px] font-medium" style={{ color: fg }}>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {quizResult === "fail" && (
            <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-[14px] px-5 py-4 flex items-center justify-between gap-3.5 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-[34px] h-[34px] rounded-[9px] bg-[#F4C9D0] flex items-center justify-center font-extrabold text-[#9B4A57]">!</span>
                <div>
                  <div className="font-bold text-[14.5px] text-[#9B4A57]">Hay respuestas incorrectas</div>
                  <div className="text-[13px] text-[#7A5B61]">Revisá las marcadas en verde y volvé a intentar.</div>
                </div>
              </div>
              <button onClick={() => { setAnswers({}); setQuizResult(null); }}
                className="font-semibold text-sm bg-[#9B4A57] text-white border-0 rounded-[10px] px-[18px] py-2.5 cursor-pointer">
                Reintentar
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button onClick={() => setOnbStep("video")}
              className="font-semibold text-[14.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-5 py-3 cursor-pointer">
              Volver al video
            </button>
            <button onClick={submitQuiz} disabled={!answeredAll || quizResult === "pass"}
              className="font-semibold text-[14.5px] border-0 rounded-xl px-6 py-3"
              style={{
                cursor: (answeredAll && quizResult !== "pass") ? "pointer" : "not-allowed",
                background: (answeredAll && quizResult !== "pass") ? "#0E6BA8" : "#E3E8ED",
                color: (answeredAll && quizResult !== "pass") ? "#fff" : "#9AA3B2",
              }}>
              Enviar respuestas
            </button>
          </div>
        </div>
      )}

      {/* Done step */}
      {onbStep === "done" && (
        <div className="mt-6 bg-white border border-[#E9ECEF] rounded-[20px] px-10 py-14 text-center relative overflow-hidden">
          <div className="absolute -top-[70px] -right-[40px] w-[220px] h-[220px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(27,148,98,.14),transparent 70%)" }} />
          <div className="relative">
            <div className="w-[76px] h-[76px] rounded-full bg-[#E7F5EE] mx-auto flex items-center justify-center text-[34px] font-extrabold text-[#1B9462]">
              ✓
            </div>
            <h2 className="font-extrabold text-[26px] mt-5 mb-0" style={{ letterSpacing: "-0.02em" }}>¡Alta en el sistema!</h2>
            <p className="text-[15px] text-[#5B6577] leading-[1.55] max-w-[420px] mx-auto mt-3 mb-0">
              Aprobaste la capacitación de <b>agendaonline</b>. Tu cuenta fue dada de alta para vender este producto.
              Ya podés compartir tu código y registrar comisiones.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#E7F5EE] border border-[#9BD3B6] rounded-full px-4 py-2 mt-5">
              <span className="w-2 h-2 rounded-full bg-[#1B9462]" />
              <span className="text-[13.5px] font-semibold text-[#0B6B47]">agendaonline · dado de alta en el sistema</span>
            </div>
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <Link href="/panel/perfil"
                className="font-semibold text-[14.5px] bg-[#0E6BA8] text-white rounded-xl px-[22px] py-3">
                Ir a mi código de ventas
              </Link>
              <Link href="/panel/comisiones"
                className="font-semibold text-[14.5px] bg-white text-[#0C2A45] border border-[#DCE0E5] rounded-xl px-[21px] py-3">
                Volver al panel
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Next product */}
      <div className="mt-4 bg-[#F7F8FA] border border-[#E9ECEF] rounded-2xl px-[22px] py-[18px] flex items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-[10px] bg-[#FCE6E9] flex items-center justify-center font-extrabold text-[#9B4A57] text-[15px]">n</span>
          <div>
            <div className="font-bold text-[15px]">nume</div>
            <div className="text-[12.5px] text-[#9AA3B2]">Capacitación disponible · aún no iniciada</div>
          </div>
        </div>
        <span className="text-[12.5px] font-semibold text-[#5B6577] bg-white border border-[#DCE0E5] rounded-full px-3 py-1.5">
          Pendiente
        </span>
      </div>
    </div>
  );
}
