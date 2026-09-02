"use client";

import { useState } from "react";

const fmtARS = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

type Producto = { nombre: string };

export function LandingCalculator({ productos, comisionMonto, comisionMeses }: {
  productos: Producto[];
  comisionMonto: number;
  comisionMeses: number;
}) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(productos.map(p => [p.nombre, 1]))
  );

  function inc(nombre: string) { setCounts(c => ({ ...c, [nombre]: c[nombre] + 1 })); }
  function dec(nombre: string) { setCounts(c => ({ ...c, [nombre]: Math.max(0, c[nombre] - 1) })); }

  const totalVentas = Object.values(counts).reduce((a, b) => a + b, 0);
  const comisionMensual = totalVentas * comisionMonto;
  const comisionTotal   = comisionMensual * comisionMeses;

  return (
    <section id="calculadora" style={{ background: "#1E3AA8", padding: "104px 32px", overflow: "hidden", position: "relative" }}>
      {/* onda superior decorativa */}
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 340, opacity: 0.5, pointerEvents: "none" }}>
        <defs>
          <linearGradient id="waveCalc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E7CFE0" />
            <stop offset="100%" stopColor="#1E3AA8" />
          </linearGradient>
        </defs>
        <path d="M0,0 L1440,0 L1440,120 C1120,300 980,20 660,140 C380,244 220,60 0,180 Z" fill="url(#waveCalc)" />
      </svg>

      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        <div style={{ textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 13, fontWeight: 700, color: "#9FC6F0", marginBottom: 10 }}>
          Calculadora
        </div>
        <h2 style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.035em", color: "#fff", margin: "0 0 12px" }}>
          ¿Cuánto podés ganar?
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, maxWidth: 560, margin: "0 0 44px" }}>
          Ajustá cuántas ventas hacés este mes y mirá tus comisiones a lo largo de {comisionMeses} meses.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}
          className="grid-calc">
          {/* controles */}
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 24, padding: 30, display: "flex", flexDirection: "column", gap: 18 }}>
            {productos.map((p) => (
              <div key={p.nombre} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 19, color: "#fff" }}>{p.nombre}</div>
                  <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
                    comisión: {fmtARS(comisionMonto)}/mes × {comisionMeses} cuotas
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => dec(p.nombre)}
                    style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "transparent", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    –
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 24, color: "#fff", minWidth: 28, textAlign: "center" }}>
                    {counts[p.nombre]}
                  </span>
                  <button onClick={() => inc(p.nombre)}
                    style={{ width: 38, height: 38, borderRadius: 999, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.16)", color: "#fff", fontSize: 20, cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    +
                  </button>
                </div>
              </div>
            ))}
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Cada venta genera {comisionMeses} cuotas de comisión de {fmtARS(comisionMonto)} cada una.
              Se acreditan mientras el cliente mantenga su suscripción activa.
            </p>
          </div>

          {/* resultado */}
          <div style={{ background: "#fff", borderRadius: 24, padding: "34px 30px", color: "#132A6E" }}>
            <div style={{ fontSize: 15, color: "#5B648E", marginBottom: 8 }}>
              Con {totalVentas} venta{totalVentas !== 1 ? "s" : ""} este mes cobrás
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
              {fmtARS(comisionTotal)}
            </div>
            <div style={{ fontSize: 15, color: "#7C87B5", marginTop: 8 }}>
              en total, a lo largo de {comisionMeses} meses
            </div>
            <div style={{ height: 1, background: "#E3E5F2", margin: "24px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 15, color: "#5B648E" }}>Por mes durante {comisionMeses} meses</span>
              <span style={{ fontWeight: 800, fontSize: 24, color: "#132A6E" }}>{fmtARS(comisionMensual)}</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .grid-calc { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 767px) {
          #calculadora { padding: 72px 20px !important; }
        }
      `}</style>
    </section>
  );
}
