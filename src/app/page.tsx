"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { PRODUCTS, STEPS, COMMISSION_PER_MONTH, COMMISSION_PER_SALE, MONTHLY_PRICE, fmtARS } from "@/lib/constants";

export default function LandingPage() {
  const [agendas, setAgendas] = useState(3);
  const [numes, setNumes] = useState(2);

  const ventas = agendas + numes;
  const monthly = ventas * COMMISSION_PER_MONTH;
  const total3 = ventas * COMMISSION_PER_SALE;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      <PublicNav />

      {/* Hero */}
      <div className="max-w-[1180px] mx-auto mt-3.5 px-8">
        <div className="bg-[#0E6BA8] rounded-[28px] px-16 py-[76px] relative overflow-hidden">
          <div className="absolute -top-[90px] -right-[50px] w-[360px] h-[360px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.35),transparent 70%)" }} />
          <div className="absolute -bottom-[120px] -left-[80px] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }} />

          <div className="relative grid grid-cols-[1.15fr_.85fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30"
                style={{ background: "rgba(255,255,255,.16)" }}>
                <span className="w-[7px] h-[7px] rounded-full bg-[#FADADD]" />
                <span className="text-[13px] font-semibold text-white">Programa de revendedores</span>
              </div>
              <h1 className="font-extrabold text-[58px] leading-[1.04] text-white mt-5 mb-0"
                style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
                Vendé herramientas digitales y cobrá comisiones{" "}
                <span className="text-[#FADADD]">sin inversión inicial</span>.
              </h1>
              <div className="flex flex-wrap gap-3.5 mt-9">
                <Link href="/revendedores"
                  className="font-semibold text-base bg-white text-[#0E6BA8] rounded-xl px-6 py-[15px]">
                  Convertite en revendedor
                </Link>
                <Link href="/#productos"
                  className="font-semibold text-base text-white rounded-xl px-6 py-[15px] border border-white/30"
                  style={{ background: "rgba(255,255,255,.12)" }}>
                  Conocé nuestros productos
                </Link>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="relative flex justify-center items-end min-h-[420px]">
              <div className="absolute bottom-0 w-[300px] h-[300px] rounded-full"
                style={{ background: "radial-gradient(circle,rgba(255,255,255,.22),transparent 68%)" }} />

              {/* Stat chip */}
              <div className="absolute top-3.5 -left-1.5 z-10 bg-white rounded-[14px] px-4 py-3 flex items-center gap-3"
                style={{ boxShadow: "0 14px 30px rgba(8,30,48,.24)" }}>
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#E1EFF8] flex items-center justify-center">
                  <span className="w-[11px] h-[11px] rounded-full bg-[#0E6BA8]" />
                </div>
                <div>
                  <div className="text-[10.5px] text-[#5B6577] font-semibold uppercase tracking-[.04em]">Comisión / venta</div>
                  <div className="font-extrabold text-[18px] text-[#0C2A45] leading-tight">{fmtARS(COMMISSION_PER_SALE)}</div>
                </div>
              </div>

              {/* Badge chip */}
              <div className="absolute bottom-10 -right-1.5 z-10 bg-[#0C2A45] rounded-[13px] px-[15px] py-[11px] flex items-center gap-2.5"
                style={{ boxShadow: "0 14px 30px rgba(8,30,48,.3)" }}>
                <span className="w-2 h-2 rounded-full bg-[#FADADD]" />
                <span className="text-[12.5px] text-white font-semibold">Venta registrada</span>
              </div>

              {/* Phone */}
              <div className="relative z-[2] w-[248px] h-[404px] bg-[#0C2A45] rounded-[34px] p-2.5"
                style={{ boxShadow: "0 30px 60px rgba(8,30,48,.4)" }}>
                <div className="w-full h-full bg-[#F7F8FA] rounded-[26px] overflow-hidden flex flex-col">
                  <div className="bg-[#0E6BA8] px-4 py-4 relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-3.5 w-14 h-[5px] rounded-full bg-white/40" />
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-white text-sm">agendaonline</span>
                      <span className="w-[26px] h-[26px] rounded-full bg-white/20" />
                    </div>
                    <div className="text-[#DCEAF4] text-[10.5px] mt-2.5 font-semibold tracking-[.04em]">HOY · MARTES 21</div>
                  </div>
                  <div className="p-3.5 flex flex-col gap-2.5">
                    {[
                      { time: "09", name: "Corte y peinado", sub: "Lucía Fernández · 45 min", bg: "#E1EFF8", fg: "#0B5A8F" },
                      { time: "11", name: "Consulta inicial", sub: "Diego Sosa · 30 min", bg: "#FCE6E9", fg: "#9B4A57" },
                      { time: "14", name: "Control mensual", sub: "Ana Torres · 20 min", bg: "#E1EFF8", fg: "#0B5A8F" },
                    ].map((appt) => (
                      <div key={appt.time} className="flex items-center gap-2.5 bg-white border border-[#E9ECEF] rounded-xl p-3">
                        <div className="w-[38px] h-[38px] rounded-[9px] flex-shrink-0 flex items-center justify-center font-bold text-xs"
                          style={{ background: appt.bg, color: appt.fg }}>{appt.time}</div>
                        <div>
                          <div className="text-[11.5px] font-bold text-[#0C2A45]">{appt.name}</div>
                          <div className="text-[10px] text-[#9AA3B2]">{appt.sub}</div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-1.5 bg-[#0E6BA8] rounded-xl p-3 text-center font-bold text-white text-[12.5px]">
                      + Nuevo turno
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cómo funciona */}
      <div id="como-funciona" className="max-w-[1180px] mx-auto px-8 pt-[84px]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-semibold text-[13px] uppercase tracking-[.12em] text-[#0E6BA8]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E7A9B3]" />
            Cómo funciona
          </div>
          <h2 className="font-extrabold text-[38px] mt-2.5" style={{ letterSpacing: "-0.025em" }}>
            Empezá a cobrar en tres pasos
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-5 mt-11">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border border-[#E9ECEF] rounded-[20px] p-[30px]">
              <div className="w-[46px] h-[46px] rounded-xl flex items-center justify-center font-bold text-[15px]"
                style={{ background: s.tint, color: s.accent }}>{s.n}</div>
              <h3 className="font-semibold text-[21px] mt-5 mb-0" style={{ letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-2.5 mb-0">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div id="productos" className="max-w-[1180px] mx-auto px-8 pt-[84px]">
        <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8]">
          Productos disponibles
        </div>
        <div className="grid grid-cols-2 gap-5 mt-6">
          {PRODUCTS.map((p) => (
            <div key={p.key} className="bg-white border border-[#E9ECEF] rounded-[22px] p-[30px]">
              <div className="h-[150px] rounded-[14px] border border-[#E9ECEF] flex items-center justify-center"
                style={{ background: "repeating-linear-gradient(45deg,#EAEEF2,#EAEEF2 11px,#F4F6F8 11px,#F4F6F8 22px)" }}>
                <span className="text-[13px] text-[#9AA3B2]">screenshot · {p.name}</span>
              </div>
              <div className="flex items-center justify-between mt-5">
                <span className="font-bold text-2xl" style={{ letterSpacing: "-0.02em" }}>{p.name}</span>
                <span className="text-xs font-semibold rounded-full px-3 py-1.5"
                  style={{ background: p.tint, color: p.accent }}>{p.tag}</span>
              </div>
              <div className="text-[13px] text-[#9AA3B2] mt-0.5">{p.domain}</div>
              <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-3.5 mb-5">{p.desc}</p>
              <div className="flex justify-between items-end border-t border-[#EEF0F2] pt-4">
                <div>
                  <div className="text-xs text-[#9AA3B2]">Suscripción</div>
                  <div className="font-bold text-2xl">{fmtARS(MONTHLY_PRICE)}<span className="text-[13px] text-[#9AA3B2] font-medium">/mes</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#9AA3B2]">Tu comisión / mes</div>
                  <div className="font-bold text-2xl text-[#0B5A8F]">{fmtARS(COMMISSION_PER_MONTH)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calculadora */}
      <div className="max-w-[1180px] mx-auto px-8 pt-[84px]">
        <div className="bg-white border border-[#E9ECEF] rounded-[28px] p-12 grid grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8]">Calculadora</div>
            <h2 className="font-extrabold text-[34px] mt-2.5 mb-2" style={{ letterSpacing: "-0.025em" }}>¿Cuánto podés ganar?</h2>
            <p className="text-[15px] text-[#5B6577] leading-[1.55] mb-7">
              Ajustá cuántas ventas hacés este mes y mirá tus comisiones de los próximos 3 meses.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { label: "agendaonline", count: agendas, setCount: setAgendas },
                { label: "nume", count: numes, setCount: setNumes },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-[#F7F8FA] rounded-[14px] px-[18px] py-4">
                  <div>
                    <div className="font-semibold text-base">{row.label}</div>
                    <div className="text-[12.5px] text-[#9AA3B2]">ventas este mes</div>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <button onClick={() => row.setCount(Math.max(0, row.count - 1))}
                      className="w-[38px] h-[38px] rounded-[10px] border border-[#DCE0E5] bg-white text-[20px] text-[#0C2A45] cursor-pointer leading-none">–</button>
                    <span className="font-bold text-[22px] min-w-[28px] text-center">{row.count}</span>
                    <button onClick={() => row.setCount(row.count + 1)}
                      className="w-[38px] h-[38px] rounded-[10px] border-none bg-[#0E6BA8] text-white text-[20px] cursor-pointer leading-none">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0C2A45] rounded-[22px] p-[34px] relative overflow-hidden">
            <div className="absolute -bottom-[70px] -left-[40px] w-[240px] h-[240px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(14,107,168,.4),transparent 70%)" }} />
            <div className="absolute -top-[50px] -right-[40px] w-[180px] h-[180px] rounded-full"
              style={{ background: "radial-gradient(circle,rgba(250,218,221,.18),transparent 70%)" }} />
            <div className="relative">
              <div className="text-[13px] text-[#9DB0C4] font-semibold">Con {ventas} ventas este mes cobrás</div>
              <div className="font-extrabold text-[54px] text-white leading-none mt-2.5" style={{ letterSpacing: "-0.03em" }}>
                {fmtARS(total3)}
              </div>
              <div className="text-sm text-[#BBD9EE] mt-1.5">en total, a lo largo de 3 meses</div>
              <div className="h-px bg-white/10 my-5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#A9B4C2]">Cada mes durante 3 meses</span>
                <span className="font-bold text-[22px] text-white">{fmtARS(monthly)}</span>
              </div>
              <div className="mt-4 text-[12.5px] text-[#9DB0C4] leading-relaxed">
                Estimación según una comisión de {fmtARS(COMMISSION_PER_MONTH)}/mes por venta durante 3 meses.
                Las comisiones se acreditan a partir del mes siguiente a la venta.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div className="max-w-[1180px] mx-auto px-8 py-[84px]">
        <div className="bg-[#0E6BA8] rounded-[28px] p-16 text-center relative overflow-hidden">
          <div className="absolute -top-[80px] -left-[40px] w-[280px] h-[280px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.3),transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-extrabold text-[44px] text-white m-0" style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
              Tu código de ventas te espera
            </h2>
            <p className="text-[17px] text-[#DCEAF4] max-w-[480px] mx-auto mt-4 mb-0 leading-relaxed">
              Registrate gratis hoy y empezá a generar ingresos recurrentes esta misma semana.
            </p>
            <div className="flex gap-3.5 justify-center mt-8 flex-wrap">
              <Link href="/revendedores"
                className="font-semibold text-base bg-white text-[#0E6BA8] rounded-xl px-7 py-4">
                Crear mi cuenta gratis
              </Link>
              <Link href="/panel/comisiones"
                className="font-semibold text-base text-white rounded-xl px-[29px] border border-white/50"
                style={{ background: "rgba(255,255,255,.12)", paddingTop: 15, paddingBottom: 15 }}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
