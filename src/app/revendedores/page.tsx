import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { REQUISITOS } from "@/lib/constants";

export default function RevendedoresPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      <PublicNav activeLink="revendedores" />

      <div className="max-w-[1180px] mx-auto mt-[18px] px-8">
        <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "0.82fr 1.18fr" }}>

          {/* Left sticky panel */}
          <div className="sticky top-20">
            <div className="inline-flex items-center gap-2 bg-[#E1EFF8] rounded-full px-3.5 py-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-[#0E6BA8]" />
              <span className="text-[13px] font-semibold text-[#0B5A8F]">Convertite en revendedor</span>
            </div>
            <h1 className="font-extrabold text-[46px] leading-[1.05] mt-4 mb-0" style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
              Requisitos para sumarte
            </h1>
            <p className="text-[17px] leading-[1.55] text-[#5B6577] mt-4">
              Sumarte a glob.ar es simple y gratis. Revisá esta checklist: si cumplís con los cuatro puntos, ya podés registrarte.
            </p>

            <div className="mt-7 bg-[#0C2A45] rounded-[18px] p-6 relative overflow-hidden">
              <div className="absolute -bottom-[60px] -right-[30px] w-[180px] h-[180px] rounded-full"
                style={{ background: "radial-gradient(circle,rgba(14,107,168,.45),transparent 70%)" }} />
              <div className="relative">
                <div className="text-[12.5px] text-[#9DB0C4] font-semibold uppercase tracking-[.05em]">Requisitos</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-extrabold text-[42px] text-white" style={{ letterSpacing: "-0.03em" }}>4</span>
                  <span className="text-[15px] text-[#BBD9EE]">puntos · 5 minutos</span>
                </div>
                <p className="text-[13px] text-[#9DB0C4] leading-relaxed mt-3.5 mb-0">
                  El registro es gratuito y no tiene costos ocultos. Solo necesitás cumplir estos requisitos.
                </p>
              </div>
            </div>

            <div className="mt-3.5 bg-[#F1F8FC] border border-[#D7E9F4] rounded-2xl p-5 flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-[9px] bg-[#E1EFF8] flex items-center justify-center font-extrabold text-[#0B5A8F] text-[15px]">i</div>
              <div>
                <div className="font-bold text-sm text-[#0B5A8F]">Programa disponible en Argentina</div>
                <p className="text-[13px] text-[#3F5B6E] leading-relaxed mt-1.5 mb-0">
                  Por ahora el programa de revendedores opera únicamente en Argentina.
                </p>
              </div>
            </div>
          </div>

          {/* Right checklist */}
          <div className="relative">
            <div className="absolute left-[25px] top-[30px] bottom-[30px] w-0.5"
              style={{ background: "linear-gradient(#0E6BA8,#E7A9B3)" }} />
            <div className="flex flex-col gap-4">
              {REQUISITOS.map((r) => (
                <div key={r.n} className="relative flex gap-[22px] items-start">
                  <div className="relative z-10 flex-shrink-0 w-[52px] h-[52px] rounded-full bg-white border-2 flex items-center justify-center font-extrabold text-[18px]"
                    style={{ borderColor: r.accent, color: r.accent, boxShadow: "0 4px 12px rgba(8,30,48,.06)" }}>
                    {r.n}
                  </div>
                  <div className="flex-1 bg-white border border-[#E9ECEF] rounded-[18px] p-6">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-[20px] m-0" style={{ letterSpacing: "-0.02em" }}>{r.title}</h3>
                      <span className="text-[11.5px] font-semibold rounded-full px-3 py-1"
                        style={{ background: r.tint, color: r.accent }}>{r.tag}</span>
                    </div>
                    <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-2.5 mb-0">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-[1180px] mx-auto px-8 py-12">
        <div className="bg-[#0E6BA8] rounded-[24px] px-12 py-11 flex items-center justify-between flex-wrap gap-6 relative overflow-hidden">
          <div className="absolute -top-[70px] -right-[30px] w-[240px] h-[240px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.28),transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-extrabold text-[30px] text-white m-0" style={{ letterSpacing: "-0.025em" }}>
              ¿Cumplís con los requisitos?
            </h2>
            <p className="text-base text-[#DCEAF4] mt-2 mb-0">
              Registrate gratis y obtené tu código de ventas hoy mismo.
            </p>
          </div>
          <div className="relative flex gap-3 flex-wrap">
            <button className="font-semibold text-base bg-white text-[#0E6BA8] rounded-xl px-6 py-[15px] cursor-pointer border-0">
              Crear mi cuenta
            </button>
            <Link href="/revendedores"
              className="font-semibold text-base text-white rounded-xl border border-white/40 px-[25px] py-[14px]"
              style={{ background: "rgba(255,255,255,.12)" }}>
              Volver arriba
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
