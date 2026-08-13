import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import { STEPS, fmtARS } from "@/lib/constants";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { LandingCalculator } from "@/components/LandingCalculator";
import { ContactoForm } from "@/components/ContactoForm";

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
                    {lista[0] ? fmtARS(parseFloat(String(lista[0].precioMensual)) * 0.5 * 6) : "$27.000"}
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
              <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-2.5 mb-0">{s.desc}</p>
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
              const comisionMes = precio * 0.5;
              const comisionTotal = comisionMes * 6;
              return (
                <div key={p.id} className="bg-white border border-[#E9ECEF] rounded-[22px] p-[30px]">
                  <div className="h-[180px] rounded-[14px] overflow-hidden">
                    {p.nombre === "nume" ? <NumeIllustration /> : <AgendaIllustration />}
                  </div>
                  <div className="flex items-center justify-between mt-5">
                    <span className="font-bold text-2xl" style={{ letterSpacing: "-0.02em" }}>{p.nombre}</span>
                    <span className="text-xs font-semibold rounded-full px-3 py-1.5"
                      style={{ background: c.bg, color: c.text }}>{c.tag}</span>
                  </div>
                  <div className="text-[13px] text-[#9AA3B2] mt-0.5">{p.dominio}</div>
                  <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-3.5 mb-5">{p.descripcion}</p>
                  <div className="flex justify-between items-end border-t border-[#EEF0F2] pt-4">
                    <div>
                      <div className="text-xs text-[#9AA3B2]">Suscripción</div>
                      <div className="font-bold text-2xl">{fmtARS(precio)}<span className="text-[13px] text-[#9AA3B2] font-medium">/mes</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#9AA3B2]">Tu comisión total</div>
                      <div className="font-bold text-2xl text-[#0B5A8F]">{fmtARS(comisionTotal)}</div>
                      <div className="text-[11px] text-[#9AA3B2]">{fmtARS(comisionMes)}/mes × 6 cuotas</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Calculadora */}
      <LandingCalculator productos={lista.map(p => ({ nombre: p.nombre, precioMensual: parseFloat(String(p.precioMensual)) }))} />

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

function NumeIllustration() {
  return (
    <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {/* BG */}
      <rect width="560" height="180" fill="#F5F0E8"/>
      {/* Gradient top right */}
      <radialGradient id="ng1" cx="90%" cy="10%" r="50%">
        <stop offset="0%" stopColor="#CFEE6A" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#F5F0E8" stopOpacity="0"/>
      </radialGradient>
      <rect width="560" height="180" fill="url(#ng1)"/>

      {/* Badge */}
      <rect x="20" y="18" width="190" height="24" rx="12" fill="none" stroke="#1a1a1a" strokeWidth="1.2"/>
      <circle cx="34" cy="30" r="4" fill="#D94F3D"/>
      <text x="44" y="34.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="700" fill="#1a1a1a" letterSpacing="1">NUEVO · DISPONIBLE PARA ARG</text>

      {/* Headline */}
      <text x="20" y="72" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">Carta digital</text>
      <text x="20" y="103" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">con QR y</text>
      <text x="20" y="134" fontFamily="sans-serif" fontSize="28" fontWeight="900" fill="#1a1a1a">reservas.</text>
      {/* Lime highlight under "reservas" */}
      <rect x="20" y="137" width="148" height="10" rx="2" fill="#CFEE6A" opacity="0.7"/>

      {/* Phone */}
      <rect x="330" y="8" width="210" height="165" rx="22" fill="#1a1a1a"/>
      <rect x="336" y="14" width="198" height="153" rx="18" fill="#FAFAF7"/>

      {/* Phone header */}
      <text x="350" y="38" fontFamily="sans-serif" fontSize="11" fontWeight="800" fill="#1a1a1a">Bodegón </text>
      <rect x="416" y="27" width="16" height="16" rx="3" fill="#CFEE6A"/>
      <text x="418.5" y="39" fontFamily="sans-serif" fontSize="10" fontWeight="900" fill="#1a1a1a">N</text>

      {/* Subheader */}
      <text x="350" y="55" fontFamily="sans-serif" fontSize="7.5" fontWeight="600" fill="#888" letterSpacing="0.5">¡HOLA! · MESA 12</text>
      <text x="350" y="70" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">¿Qué te servimos</text>
      <text x="350" y="84" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">hoy?</text>
      <rect x="349" y="74" width="32" height="12" rx="2" fill="#CFEE6A" opacity="0.8"/>
      <text x="350" y="84" fontFamily="sans-serif" fontSize="10.5" fontWeight="800" fill="#1a1a1a">hoy?</text>

      {/* Menu card dark */}
      <rect x="344" y="90" width="176" height="52" rx="10" fill="#1a1a1a"/>
      <rect x="350" y="96" width="46" height="14" rx="4" fill="#CFEE6A"/>
      <text x="352" y="107" fontFamily="sans-serif" fontSize="7" fontWeight="700" fill="#1a1a1a">HOY · 12-15H</text>
      <text x="350" y="122" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="white">Menú ejecutivo $7.500</text>
      <text x="350" y="134" fontFamily="sans-serif" fontSize="7" fill="#aaa">Entrada + principal + bebida</text>
      <circle cx="505" cy="116" r="11" fill="#CFEE6A"/>
      <text x="500" y="120" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="#1a1a1a">›</text>

      {/* Categories */}
      <text x="350" y="155" fontFamily="sans-serif" fontSize="8.5" fontWeight="700" fill="#1a1a1a">Categorías</text>
      <rect x="350" y="158" width="38" height="8" rx="3" fill="#CFEE6A"/>
      <rect x="393" y="158" width="38" height="8" rx="3" fill="#E0D8CC"/>
      <rect x="436" y="158" width="38" height="8" rx="3" fill="#E0D8CC"/>
    </svg>
  );
}

function AgendaIllustration() {
  return (
    <svg viewBox="0 0 560 180" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
      {/* BG dark */}
      <rect width="560" height="180" fill="#0D1F2D"/>
      <radialGradient id="ag1" cx="10%" cy="100%" r="60%">
        <stop offset="0%" stopColor="#0E4D3A" stopOpacity="0.8"/>
        <stop offset="100%" stopColor="#0D1F2D" stopOpacity="0"/>
      </radialGradient>
      <rect width="560" height="180" fill="url(#ag1)"/>

      {/* Badge */}
      <rect x="20" y="16" width="168" height="24" rx="12" fill="#1B3D2A"/>
      <circle cx="34" cy="28" r="4" fill="#3DDC84"/>
      <text x="44" y="32.5" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#3DDC84" letterSpacing="0.5">Turnos online · Argentina</text>

      {/* Headline */}
      <text x="20" y="68" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="white">Tu agenda online,</text>
      <text x="20" y="96" fontFamily="sans-serif" fontSize="24" fontWeight="900" fill="#3DDC84">trabaja por vos.</text>

      {/* Body */}
      <text x="20" y="118" fontFamily="sans-serif" fontSize="9" fill="#8AAABB">Reserva de turnos para peluquerías, barberías,</text>
      <text x="20" y="131" fontFamily="sans-serif" fontSize="9" fill="#8AAABB">centros de estética y consultorios.</text>

      {/* Buttons */}
      <rect x="20" y="143" width="110" height="28" rx="8" fill="#3DDC84"/>
      <text x="45" y="161.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="700" fill="#0D1F2D">Comenzar gratis</text>
      <rect x="138" y="143" width="80" height="28" rx="8" fill="none" stroke="#3a5060" strokeWidth="1.5"/>
      <text x="158" y="161.5" fontFamily="sans-serif" fontSize="9.5" fontWeight="600" fill="white">Ver demo</text>

      {/* Panel card */}
      <rect x="318" y="10" width="224" height="160" rx="16" fill="#112233"/>
      <rect x="326" y="18" width="208" height="18" rx="6" fill="#1A3040"/>
      <text x="336" y="31" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="white">✦  Elegí el servicio</text>

      {/* Slot row label */}
      <text x="326" y="55" fontFamily="sans-serif" fontSize="7.5" fill="#8AAABB" letterSpacing="0.3">Horarios disponibles · Mié 18</text>

      {/* Time slots grid */}
      {[
        { x: 326, y: 60, t: "10:00", active: false },
        { x: 418, y: 60, t: "10:50", active: true },
        { x: 326, y: 82, t: "11:40", active: false, disabled: true },
        { x: 418, y: 82, t: "15:00", active: false },
        { x: 326, y: 104, t: "16:30", active: false },
        { x: 418, y: 104, t: "17:20", active: false },
      ].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width="84" height="18" rx="6"
            fill={s.active ? "#3DDC84" : s.disabled ? "#0D1F2D" : "#1A3040"}
            stroke={s.active ? "#3DDC84" : "#1A3040"} strokeWidth="1"/>
          <text x={s.x + 42} y={s.y + 12.5} fontFamily="sans-serif" fontSize="9" fontWeight={s.active ? "700" : "500"}
            fill={s.active ? "#0D1F2D" : s.disabled ? "#3a5060" : "white"} textAnchor="middle"
            textDecoration={s.disabled ? "line-through" : "none"}>{s.t}</text>
        </g>
      ))}

      {/* Confirm button */}
      <rect x="326" y="128" width="176" height="24" rx="7" fill="#3DDC84"/>
      <text x="414" y="143.5" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="#0D1F2D" textAnchor="middle">Confirmar turno · 10:50</text>

      {/* Tooltip */}
      <rect x="380" y="154" width="100" height="16" rx="6" fill="#1A3040"/>
      <text x="430" y="165" fontFamily="sans-serif" fontSize="7.5" fill="#3DDC84" textAnchor="middle">⏱ Elegí el horario</text>
    </svg>
  );
}
