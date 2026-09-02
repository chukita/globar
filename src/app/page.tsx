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
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { SOPORTE_WHATSAPP } from "@/lib/constants";
import { waLink } from "@/lib/telefono";

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

  const agendaonline = lista.find(p => p.nombre === "agendaonline");
  const nume         = lista.find(p => p.nombre === "nume");

  return (
    <div style={{ fontFamily: "var(--font-figtree, 'Open Sans', system-ui, sans-serif)", minHeight: "100vh", background: "#fff", color: "#132A6E" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        [id] { scroll-margin-top: 80px; }
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @media (prefers-reduced-motion: reduce) { .card-float { animation: none !important; } }

        /* hero responsive */
        .hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px; align-items: center; }
        @media (max-width: 1023px) { .hero-grid { grid-template-columns: 1fr; gap: 40px; } }

        /* como-funciona grid */
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 52px; }
        @media (max-width: 1023px) { .steps-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 639px)  { .steps-grid { grid-template-columns: 1fr; } }

        /* productos grid */
        .productos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 52px; }
        @media (max-width: 767px) { .productos-grid { grid-template-columns: 1fr; } }

        /* contacto grid */
        .contacto-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
        @media (max-width: 767px) { .contacto-grid { grid-template-columns: 1fr; gap: 40px; } }

        /* section padding mobile */
        .section-pad { padding: 104px 32px; }
        @media (max-width: 767px) { .section-pad { padding: 72px 20px; } }

        /* hero wave */
        .hero-wave { height: 78%; min-height: 420px; }
        @media (max-width: 767px) { .hero-wave { height: 55%; min-height: 280px; } }

        /* hero section padding mobile */
        @media (max-width: 767px) { #top { padding: 60px 20px 0 !important; } }
      `}</style>

      {/* ── NAV ── */}
      <PublicNav variant="dark" />

      {/* ── HERO ── */}
      <section id="top" style={{ background: "#1E3AA8", padding: "96px 32px 0", paddingBottom: 0, position: "relative", overflow: "hidden" }}>
        {/* onda decorativa */}
        <svg viewBox="0 0 1440 900" preserveAspectRatio="none"
          className="hero-wave"
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", pointerEvents: "none", zIndex: 0 }}>
          <defs>
            <linearGradient id="heroWave" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#E7CFE0" />
              <stop offset="26%"  stopColor="#B3A6E2" />
              <stop offset="72%"  stopColor="#3B4FB8" />
              <stop offset="100%" stopColor="#1E3AA8" />
            </linearGradient>
          </defs>
          <path d="M0,300 C240,180 380,470 720,430 C1040,392 1180,60 1440,120 L1440,900 L0,900 Z" fill="url(#heroWave)" />
        </svg>

        <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="hero-grid" style={{ paddingBottom: 120 }}>
            {/* columna izquierda */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9FC6F0", background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "7px 14px" }}>
                Programa de revendedores
              </div>
              <h1 style={{ fontSize: "clamp(40px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.03, letterSpacing: "-0.035em", color: "#fff", margin: "20px 0 0", textWrap: "balance" } as React.CSSProperties}>
                Vendé herramientas digitales y cobrá comisiones{" "}
                <span style={{ color: "#E7CFE0" }}>sin inversión inicial.</span>
              </h1>
              <p style={{ fontSize: 19, lineHeight: 1.55, color: "rgba(255,255,255,0.75)", maxWidth: 520, marginTop: 20, marginBottom: 0 }}>
                Plataforma argentina de reventa de productos digitales SaaS. Registrate, ofrecé los productos y cobrá comisiones recurrentes durante cuatro meses por cada cliente.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 38, flexWrap: "wrap" }}>
                <Link href="/registro" style={{ fontWeight: 700, fontSize: 16, background: "#fff", color: "#1E3AA8", borderRadius: 999, padding: "16px 28px", textDecoration: "none" }}>
                  Convertite en revendedor
                </Link>
                <Link href="#productos" style={{ fontWeight: 700, fontSize: 16, border: "1px solid rgba(255,255,255,0.38)", color: "#fff", borderRadius: 999, padding: "16px 28px", textDecoration: "none" }}>
                  Conocé nuestros productos
                </Link>
              </div>
            </div>

            {/* columna derecha — tarjeta flotante agendaonline */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="card-float"
                style={{ background: "#fff", borderRadius: 26, padding: 22, boxShadow: "0 40px 80px -30px rgba(9,18,60,0.55)", color: "#132A6E", animation: "floaty 7s ease-in-out infinite", maxWidth: 340, width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", color: "#7C87B5", marginBottom: 4 }}>Comisión / venta</div>
                    <div style={{ fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{fmtARS(comisionTotalPorVenta)}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, background: "#E6F1F8", color: "#0E6BA0", borderRadius: 999, padding: "5px 12px" }}>
                    Venta registrada
                  </div>
                </div>
                <div style={{ background: "#F4F5FB", borderRadius: 18, padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>agendaonline</span>
                    <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "#7C87B5" }}>HOY · MARTES 21</span>
                  </div>
                  {[
                    { hora: "09:00", nombre: "Corte y peinado",  sub: "Lucía Fernández · 45 min" },
                    { hora: "11:00", nombre: "Consulta inicial",  sub: "Diego Sosa · 30 min" },
                    { hora: "14:00", nombre: "Control mensual",   sub: "Ana Torres · 20 min" },
                  ].map((t) => (
                    <div key={t.hora} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", marginBottom: 8, display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 14, color: "#0E6BA0", fontWeight: 500, flexShrink: 0 }}>{t.hora}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{t.nombre}</div>
                        <div style={{ fontSize: 12, color: "#7C87B5" }}>{t.sub}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ border: "1px dashed #C6D3E8", borderRadius: 12, padding: "12px 14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#0E6BA0", marginTop: 4 }}>
                    + Nuevo turno
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="section-pad" style={{ background: "#F6F6FA", color: "#132A6E" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 13, fontWeight: 700, color: "#0E6BA0", marginBottom: 12 }}>
            Cómo funciona
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.035em", margin: 0 }}>
            Empezá a cobrar en tres pasos
          </h2>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} style={{ background: "#fff", borderRadius: 22, padding: "34px 30px", border: "1px solid #E3E5F2" }}>
                <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 14, color: "#A8AECD", marginBottom: 12 }}>{s.n}</div>
                <div style={{ width: 44, height: 5, borderRadius: 99, background: "linear-gradient(90deg,#1E3AA8,#B3A6E2)", marginBottom: 20 }} />
                <h3 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5B648E", margin: 0 }}>
                  {s.n === "03"
                    ? `Cada suscripción se registra sola y cobrás tu comisión en ${comisionMeses} cuota${comisionMeses !== 1 ? "s" : ""} mensuales mientras el cliente siga activo.`
                    : s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCTOS ── */}
      <section id="productos" className="section-pad" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 13, fontWeight: 700, color: "#0E6BA0", marginBottom: 12 }}>
            Productos disponibles
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 46px)", fontWeight: 800, letterSpacing: "-0.035em", margin: 0 }}>
            Dos productos, la misma comisión
          </h2>
          <div className="productos-grid">
            {/* agendaonline */}
            {agendaonline && (
              <ProductCard
                gradiente="linear-gradient(160deg,#1E3AA8 40%,#6A6DC7 100%)"
                eyebrow="Turnos online · Argentina"
                titulo="Tu agenda online, trabaja por vos."
                bajada="Reserva de turnos para peluquerías, barberías, centros de estética y consultorios."
                decoracion={
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 18 }}>
                    {["10:00", "10:50", "11:40", "15:00", "16:30"].map((h, i) => (
                      <span key={h} style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, borderRadius: 8, padding: "4px 10px", background: i === 1 ? "#E7CFE0" : "rgba(255,255,255,0.14)", color: i === 1 ? "#1E3AA8" : "rgba(255,255,255,0.9)", fontWeight: 500 }}>{h}</span>
                    ))}
                  </div>
                }
                nombre="agendaonline"
                tag="Turnos & reservas"
                dominio={agendaonline.dominio}
                descripcion={agendaonline.descripcion ?? ""}
                precio={parseFloat(String(agendaonline.precioMensual))}
                comisionMonto={comisionMonto}
                comisionMeses={comisionMeses}
                comisionTotal={comisionTotalPorVenta}
              />
            )}
            {/* nume */}
            {nume && (
              <ProductCard
                gradiente="linear-gradient(160deg,#0E6BA0 35%,#B3A6E2 100%)"
                eyebrow="Nuevo · Disponible para ARG"
                titulo="Carta digital con QR y reservas."
                bajada="Menú y precios en tiempo real, sin reimprimir nada."
                decoracion={
                  <div style={{ background: "rgba(255,255,255,0.14)", borderRadius: 14, padding: 16, marginTop: 18 }}>
                    <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, color: "rgba(255,255,255,0.75)", marginBottom: 8 }}>BODEGÓN N · MESA 12</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Menú ejecutivo $7.500</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Entrada + principal + bebida</div>
                  </div>
                }
                nombre="nume"
                tag="Carta digital & menú QR"
                dominio={nume.dominio}
                descripcion={nume.descripcion ?? ""}
                precio={parseFloat(String(nume.precioMensual))}
                comisionMonto={comisionMonto}
                comisionMeses={comisionMeses}
                comisionTotal={comisionTotalPorVenta}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── CALCULADORA ── */}
      <LandingCalculator
        productos={lista.map(p => ({ nombre: p.nombre }))}
        comisionMonto={comisionMonto}
        comisionMeses={comisionMeses}
      />

      {/* ── CTA FINAL ── */}
      <section className="section-pad" style={{ background: "#F6F6FA" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Tu código de ventas te espera
          </h2>
          <p style={{ fontSize: 18, color: "#5B648E", lineHeight: 1.6, margin: "0 0 36px" }}>
            Registrate gratis hoy y empezá a generar ingresos recurrentes esta misma semana.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/registro" style={{ fontWeight: 700, fontSize: 16, background: "#1E3AA8", color: "#fff", borderRadius: 999, padding: "16px 28px", textDecoration: "none" }}>
              Crear mi cuenta gratis
            </Link>
            <Link href="/login" style={{ fontWeight: 700, fontSize: 16, border: "1px solid #C6D3E8", color: "#1E3AA8", borderRadius: 999, padding: "16px 28px", textDecoration: "none" }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" className="section-pad" style={{ background: "#fff" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="contacto-grid">
            <div>
              <div style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 13, fontWeight: 700, color: "#0E6BA0", marginBottom: 12 }}>Contacto</div>
              <h2 style={{ fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 12px" }}>¿Tenés dudas? Escribinos</h2>
              <p style={{ fontSize: 16, color: "#5B648E", lineHeight: 1.6, margin: "0 0 28px" }}>Te respondemos a la brevedad.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <a href="mailto:hola@glob.ar" style={{ color: "#0E6BA0", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>hola@glob.ar</a>
                <a href={waLink(SOPORTE_WHATSAPP)} target="_blank" rel="noreferrer" style={{ color: "#0E6BA0", fontWeight: 600, fontSize: 15, textDecoration: "none" }}>
                  WhatsApp +54 9 11 7280 5803
                </a>
              </div>
            </div>
            <ContactoForm />
          </div>
        </div>
      </section>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

function ProductCard({
  gradiente, eyebrow, titulo, bajada, decoracion,
  nombre, tag, dominio, descripcion, precio,
  comisionMonto, comisionMeses, comisionTotal,
}: {
  gradiente: string; eyebrow: string; titulo: string; bajada: string;
  decoracion: React.ReactNode; nombre: string; tag: string; dominio: string;
  descripcion: string; precio: number; comisionMonto: number; comisionMeses: number; comisionTotal: number;
}) {
  return (
    <div style={{ border: "1px solid #E3E5F2", borderRadius: 26, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* cabecera con gradiente */}
      <div style={{ background: gradiente, padding: "34px 30px", color: "#fff" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: eyebrow.startsWith("Nuevo") ? "#E7CFE0" : "#9FC6F0", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 10 }}>{titulo}</div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{bajada}</div>
        {decoracion}
      </div>

      {/* cuerpo */}
      <div style={{ padding: 30, display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#132A6E" }}>{nombre}</span>
          <span style={{ fontSize: 15, color: "#7C87B5" }}>{tag}</span>
        </div>
        <a href={`https://${dominio}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: "#0E6BA0", textDecoration: "none" }}>{dominio}</a>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#5B648E", margin: 0 }}>{descripcion}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#F6F6FA", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#7C87B5", marginBottom: 4 }}>Suscripción</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#132A6E" }}>Desde {fmtARS(precio)}/mes</div>
          </div>
          <div style={{ background: "#EEF0FF", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#7C87B5", marginBottom: 4 }}>Tu comisión total</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1E3AA8" }}>{fmtARS(comisionTotal)}</div>
            <div style={{ fontSize: 11, color: "#7C87B5", marginTop: 2 }}>{fmtARS(comisionMonto)}/mes × {comisionMeses} cuotas</div>
          </div>
        </div>

        <a href={`https://${dominio}`} target="_blank" rel="noopener noreferrer"
          style={{ fontWeight: 700, fontSize: 14, background: "#1E3AA8", color: "#fff", borderRadius: 999, padding: 15, textAlign: "center", textDecoration: "none", marginTop: "auto" }}>
          Ver {nombre} →
        </a>
      </div>
    </div>
  );
}
