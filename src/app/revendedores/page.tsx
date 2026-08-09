import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const REQUISITOS = [
  {
    n: "01",
    title: "Mayor de 18 años",
    desc: "Tenés que ser mayor de edad para participar del programa.",
    tag: "Obligatorio",
    accent: "#0B5A8F",
    tint: "#E1EFF8",
  },
  {
    n: "02",
    title: "DNI argentino vigente",
    desc: "Necesitamos verificar tu identidad con un documento nacional de identidad válido.",
    tag: "Identidad",
    accent: "#9B4A57",
    tint: "#FCE6E9",
  },
  {
    n: "03",
    title: "Residencia en Argentina",
    desc: "Por ahora el programa opera únicamente en territorio argentino.",
    tag: "Obligatorio",
    accent: "#0B5A8F",
    tint: "#E1EFF8",
  },
  {
    n: "04",
    title: "Posibilidad de emitir factura por las comisiones",
    desc: "Para cobrar tus comisiones necesitás poder emitir facturas. Podés estar inscripto en Monotributo u otro régimen fiscal.",
    tag: "Para cobrar",
    accent: "#7B4FA6",
    tint: "#F0E8F8",
  },
  {
    n: "05",
    title: "CBU a tu nombre",
    desc: "Necesitás una cuenta bancaria argentina para recibir las transferencias de tus comisiones.",
    tag: "Para cobrar",
    accent: "#9B4A57",
    tint: "#FCE6E9",
  },
];

const WAVE_BG = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='50'%3E%3Cpath d='M0,25 C25,8 75,8 100,25 C125,42 175,42 200,25' stroke='%23C8D4DF' stroke-width='1.2' fill='none'/%3E%3C/svg%3E")`,
  backgroundSize: "200px 50px",
};

export default function RevendedoresPage() {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]" style={WAVE_BG}>
      <PublicNav activeLink="revendedores" />

      <div className="max-w-[1180px] mx-auto mt-[18px] px-8">
        <div className="grid gap-10 items-start" style={{ gridTemplateColumns: "0.82fr 1.18fr" }}>

          {/* Left sticky panel */}
          <div className="sticky top-24">
            <div className="inline-flex items-center gap-2 bg-[#E1EFF8] rounded-full px-3.5 py-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-[#0E6BA8]" />
              <span className="text-[13px] font-semibold text-[#0B5A8F]">Convertite en revendedor</span>
            </div>
            <h1 className="font-extrabold text-[46px] leading-[1.05] mt-4 mb-0"
              style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
              Requisitos para sumarte
            </h1>
            <p className="text-[17px] leading-[1.55] text-[#5B6577] mt-4">
              Sumarte a glob.ar es simple y gratuito. Revisá esta checklist: si cumplís los puntos, ya podés registrarte.
            </p>

            <div className="mt-7 bg-[#0C2A45] rounded-[18px] p-6 relative overflow-hidden">
              <div className="absolute -bottom-[60px] -right-[30px] w-[180px] h-[180px] rounded-full"
                style={{ background: "radial-gradient(circle,rgba(14,107,168,.45),transparent 70%)" }} />
              <div className="relative">
                <div className="text-[12.5px] text-[#9DB0C4] font-semibold uppercase tracking-[.05em]">Requisitos</div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-extrabold text-[42px] text-white" style={{ letterSpacing: "-0.03em" }}>
                    {REQUISITOS.length}
                  </span>
                  <span className="text-[15px] text-[#BBD9EE]">puntos · 5 minutos</span>
                </div>
                <p className="text-[13px] text-[#9DB0C4] leading-relaxed mt-3.5 mb-0">
                  El registro es gratuito y no tiene costos ocultos.
                </p>
              </div>
            </div>

            <Link href="/registro"
              className="mt-4 w-full flex items-center justify-center font-semibold text-[15px] bg-[#0E6BA8] text-white rounded-[14px] py-4 no-underline">
              Crear mi cuenta gratis →
            </Link>

            <p className="text-[12.5px] text-[#9AA3B2] text-center mt-3">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-[#0E6BA8] font-semibold">Ingresá acá</Link>
            </p>
          </div>

          {/* Right checklist */}
          <div className="relative py-2">
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
                      <h3 className="font-bold text-[19px] m-0" style={{ letterSpacing: "-0.02em" }}>{r.title}</h3>
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
            <Link href="/registro"
              className="font-semibold text-base bg-white text-[#0E6BA8] rounded-xl px-6 py-[15px] no-underline">
              Crear mi cuenta gratis
            </Link>
            <Link href="/login"
              className="font-semibold text-base text-white rounded-xl border border-white/40 px-[25px] py-[14px] no-underline"
              style={{ background: "rgba(255,255,255,.12)" }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
