import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { STEPS, fmtARS } from "@/lib/constants";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getConfiguracion } from "@/lib/configuracion";
import { LandingCalculator } from "@/components/LandingCalculator";
import { ContactoForm } from "@/components/ContactoForm";
import { AgendaIllustration, NumeIllustration } from "@/components/ProductIllustrations";

const PRODUCT_COLORS: Record<string, { bg: string; text: string; tag: string }> = {
  agendaonline: { bg: "#E1EFF8", text: "#0B5A8F", tag: "Turnos & reservas" },
  nume:         { bg: "#F0E8F8", text: "#7B4FA6", tag: "Carta digital & menú QR" },
};
const DEFAULT_COLOR = { bg: "#E9ECEF", text: "#5B6577", tag: "Producto digital" };

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const lista = await db
    .select({ id: productos.id, nombre: productos.nombre, dominio: productos.dominio, descripcion: productos.descripcion, precioMensual: productos.precioMensual })
    .from(productos)
    .where(eq(productos.status, "activo"));

  const config = await getConfiguracion();
  const comisionMonto = parseFloat(String(config.comisionMonto));
  const comisionMeses = config.comisionMeses;
  const comisionTotalPorVenta = comisionMonto * comisionMeses;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]"
>
      {/* Wave background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <svg key={i} style={{ position: "absolute", left: 0, width: "100%", top: i * 160, opacity: 0.5 }}
            viewBox="0 0 1440 160" preserveAspectRatio="none" height="160">
            <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,30 1200,60 C1350,82 1400,70 1440,65" stroke="#b0b8cc" strokeWidth="1.5" fill="none"/>
            <path d="M0,90 C180,120 380,50 600,90 C820,130 1020,55 1240,90 C1360,108 1410,95 1440,92" stroke="#b0b8cc" strokeWidth="1" fill="none"/>
            <path d="M0,120 C220,148 440,80 660,120 C880,160 1080,88 1300,120 C1380,135 1420,128 1440,124" stroke="#b0b8cc" strokeWidth="0.8" fill="none"/>
          </svg>
        ))}
      </div>

      <div className="relative" style={{ zIndex: 1 }}>
      <PublicNav />

      {/* Hero */}
      <div className="max-w-[1180px] mx-auto mt-3.5 px-4 sm:px-8">
        <div className="bg-[#0E6BA8] rounded-[28px] px-6 py-10 md:px-10 md:py-16 lg:px-16 lg:py-[76px] relative overflow-hidden">
          <div className="absolute -top-[90px] -right-[50px] w-[360px] h-[360px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.35),transparent 70%)" }} />
          <div className="absolute -bottom-[120px] -left-[80px] w-[300px] h-[300px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)" }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.15fr_.85fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/30"
                style={{ background: "rgba(255,255,255,.16)" }}>
                <span className="w-[7px] h-[7px] rounded-full bg-[#FADADD]" />
                <span className="text-[13px] font-semibold text-white">Programa de revendedores</span>
              </div>
              <h1 className="font-extrabold text-[34px] md:text-[44px] lg:text-[58px] leading-[1.08] lg:leading-[1.04] text-white mt-5 mb-0"
                style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
                Vendé herramientas digitales y cobrá comisiones{" "}
                <span className="text-[#FADADD]">sin inversión inicial</span>.
              </h1>
              <div className="flex flex-wrap gap-3.5 mt-9">
                <Link href="/registro"
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
              <div className="absolute top-3.5 -left-1.5 z-10 bg-white rounded-[14px] px-4 py-3 flex items-center gap-3"
                style={{ boxShadow: "0 14px 30px rgba(8,30,48,.24)" }}>
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#E1EFF8] flex items-center justify-center">
                  <span className="w-[11px] h-[11px] rounded-full bg-[#0E6BA8]" />
                </div>
                <div>
                  <div className="text-[10.5px] text-[#5B6577] font-semibold uppercase tracking-[.04em]">Comisión / venta</div>
                  <div className="font-extrabold text-[18px] text-[#0C2A45] leading-tight">
                    {fmtARS(comisionTotalPorVenta)}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 -right-1.5 z-10 bg-[#0C2A45] rounded-[13px] px-[15px] py-[11px] flex items-center gap-2.5"
                style={{ boxShadow: "0 14px 30px rgba(8,30,48,.3)" }}>
                <span className="w-2 h-2 rounded-full bg-[#FADADD]" />
                <span className="text-[12.5px] text-white font-semibold">Venta registrada</span>
              </div>
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
                      { time: "11", name: "Consulta inicial", sub: "Diego Sosa · 30 min",      bg: "#FCE6E9", fg: "#9B4A57" },
                      { time: "14", name: "Control mensual",  sub: "Ana Torres · 20 min",      bg: "#E1EFF8", fg: "#0B5A8F" },
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
      <div id="como-funciona" className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-[56px] sm:pt-[84px]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 font-semibold text-[13px] uppercase tracking-[.12em] text-[#0E6BA8]">
            <span className="w-[7px] h-[7px] rounded-full bg-[#E7A9B3]" />
            Cómo funciona
          </div>
          <h2 className="font-extrabold text-[28px] sm:text-[38px] mt-2.5" style={{ letterSpacing: "-0.025em" }}>
            Empezá a cobrar en tres pasos
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-11">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border border-[#E9ECEF] rounded-[20px] p-[30px]">
              <div className="w-[46px] h-[46px] rounded-xl flex items-center justify-center font-bold text-[15px]"
                style={{ background: s.tint, color: s.accent }}>{s.n}</div>
              <h3 className="font-semibold text-[21px] mt-5 mb-0" style={{ letterSpacing: "-0.02em" }}>{s.title}</h3>
              <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-2.5 mb-0">
                {s.n === "03"
                  ? `Cada suscripción se registra sola y cobrás tu comisión en ${comisionMeses} cuota${comisionMeses !== 1 ? "s" : ""} mensuales mientras el cliente siga activo.`
                  : s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div id="productos" className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-[56px] sm:pt-[84px]">
        <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8] mb-6">
          Productos disponibles
        </div>
        {lista.length === 0 ? (
          <p className="text-[#9AA3B2]">Próximamente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {lista.map((p) => {
              const c = PRODUCT_COLORS[p.nombre] ?? DEFAULT_COLOR;
              const precio = parseFloat(String(p.precioMensual));
              return (
                <div key={p.id} className="bg-white border border-[#E9ECEF] rounded-[22px] p-[30px]">
                  <div className="aspect-[560/180] rounded-[14px] overflow-hidden">
                    {p.nombre === "nume" ? <NumeIllustration /> : <AgendaIllustration />}
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <span className="font-bold text-2xl" style={{ letterSpacing: "-0.02em" }}>{p.nombre}</span>
                    <span className="text-xs font-semibold rounded-full px-3 py-1.5"
                      style={{ background: c.bg, color: c.text }}>{c.tag}</span>
                  </div>
                  <div className="text-[13px] text-[#9AA3B2] mt-0.5">
                    <a href={`https://${p.dominio}`} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#0B5A8F]">
                      {p.dominio}
                    </a>
                  </div>
                  <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-3.5 mb-5">{p.descripcion}</p>
                  <div className="flex justify-between items-end border-t border-[#EEF0F2] pt-4">
                    <div>
                      <div className="text-xs text-[#9AA3B2]">Suscripción</div>
                      <div className="font-bold text-2xl">Desde {fmtARS(precio)}<span className="text-[13px] text-[#9AA3B2] font-medium">/mes</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#9AA3B2]">Tu comisión total</div>
                      <div className="font-bold text-2xl text-[#0B5A8F]">{fmtARS(comisionTotalPorVenta)}</div>
                      <div className="text-[11px] text-[#9AA3B2]">{fmtARS(comisionMonto)}/mes × {comisionMeses} cuota{comisionMeses !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                  <a href={`https://${p.dominio}`} target="_blank" rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 border border-[#DCE0E5] rounded-xl py-2.5 text-[13.5px] font-semibold text-[#0C2A45] hover:bg-[#F7F8FA] transition-colors">
                    Ver {p.nombre}
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calculadora */}
      <LandingCalculator
        productos={lista.map(p => ({ nombre: p.nombre }))}
        comisionMonto={comisionMonto}
        comisionMeses={comisionMeses}
      />

      {/* CTA final */}
      <div className="max-w-[1180px] mx-auto px-4 sm:px-8 py-[56px] sm:py-[84px]">
        <div className="bg-[#0E6BA8] rounded-[28px] px-6 py-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-[80px] -left-[40px] w-[280px] h-[280px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(250,218,221,.3),transparent 70%)" }} />
          <div className="relative">
            <h2 className="font-extrabold text-[28px] sm:text-[36px] md:text-[44px] text-white m-0" style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
              Tu código de ventas te espera
            </h2>
            <p className="text-[17px] text-[#DCEAF4] max-w-[480px] mx-auto mt-4 mb-0 leading-relaxed">
              Registrate gratis hoy y empezá a generar ingresos recurrentes esta misma semana.
            </p>
            <div className="flex gap-3.5 justify-center mt-8 flex-wrap">
              <Link href="/registro"
                className="font-semibold text-base bg-white text-[#0E6BA8] rounded-xl px-7 py-4">
                Crear mi cuenta gratis
              </Link>
              <Link href="/login"
                className="font-semibold text-base text-white rounded-xl px-[29px] border border-white/50"
                style={{ background: "rgba(255,255,255,.12)", paddingTop: 15, paddingBottom: 15 }}>
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div id="contacto" className="max-w-[1180px] mx-auto px-4 sm:px-8 pb-[56px] sm:pb-[84px]">
        <div className="text-center mb-8">
          <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8] mb-2.5">
            Contacto
          </div>
          <h2 className="font-extrabold text-[28px] sm:text-[34px] m-0" style={{ letterSpacing: "-0.025em" }}>
            ¿Tenés dudas? Escribinos
          </h2>
          <p className="text-[15px] text-[#5B6577] mt-2.5 mb-0">
            Te respondemos a la brevedad.
          </p>
        </div>
        <ContactoForm />
      </div>

      <Footer />
      </div>
    </div>
  );
}
