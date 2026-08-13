"use client";

import { useState } from "react";

const fmtARS = (n: number) => "$" + Math.round(n).toLocaleString("es-AR");

type Producto = { nombre: string; precioMensual: number };

export function LandingCalculator({ productos }: { productos: Producto[] }) {
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(productos.map(p => [p.nombre, 1]))
  );

  function inc(nombre: string) { setCounts(c => ({ ...c, [nombre]: c[nombre] + 1 })); }
  function dec(nombre: string) { setCounts(c => ({ ...c, [nombre]: Math.max(0, c[nombre] - 1) })); }

  const totalVentas = Object.values(counts).reduce((a, b) => a + b, 0);

  const comisionMensual = productos.reduce((sum, p) => {
    return sum + (counts[p.nombre] ?? 0) * p.precioMensual * 0.5;
  }, 0);
  const comisionTotal = comisionMensual * 6;

  return (
    <div id="calculadora" className="max-w-[1180px] mx-auto px-4 sm:px-8 pt-[56px] sm:pt-[84px]">
      <div className="bg-white border border-[#E9ECEF] rounded-[28px] p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div>
          <div className="text-[13px] font-semibold uppercase tracking-[.12em] text-[#0E6BA8]">Calculadora</div>
          <h2 className="font-extrabold text-[26px] sm:text-[34px] mt-2.5 mb-2" style={{ letterSpacing: "-0.025em" }}>¿Cuánto podés ganar?</h2>
          <p className="text-[15px] text-[#5B6577] leading-[1.55] mb-7">
            Ajustá cuántas ventas hacés este mes y mirá tus comisiones a lo largo de 6 meses.
          </p>
          <div className="flex flex-col gap-4">
            {productos.map((p) => (
              <div key={p.nombre} className="flex items-center justify-between bg-[#F7F8FA] rounded-[14px] px-[18px] py-4">
                <div>
                  <div className="font-semibold text-base">{p.nombre}</div>
                  <div className="text-[12.5px] text-[#9AA3B2]">
                    comisión: {fmtARS(p.precioMensual * 0.5)}/mes × 6 cuotas
                  </div>
                </div>
                <div className="flex items-center gap-3.5">
                  <button onClick={() => dec(p.nombre)}
                    className="w-[38px] h-[38px] rounded-[10px] border border-[#DCE0E5] bg-white text-[20px] text-[#0C2A45] cursor-pointer leading-none">–</button>
                  <span className="font-bold text-[22px] min-w-[28px] text-center">{counts[p.nombre]}</span>
                  <button onClick={() => inc(p.nombre)}
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
            <div className="text-[13px] text-[#9DB0C4] font-semibold">
              Con {totalVentas} venta{totalVentas !== 1 ? "s" : ""} este mes cobrás
            </div>
            <div className="font-extrabold text-[38px] sm:text-[54px] text-white leading-none mt-2.5" style={{ letterSpacing: "-0.03em" }}>
              {fmtARS(comisionTotal)}
            </div>
            <div className="text-sm text-[#BBD9EE] mt-1.5">en total, a lo largo de 6 meses</div>
            <div className="h-px bg-white/10 my-5" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#A9B4C2]">Por mes durante 6 meses</span>
              <span className="font-bold text-[22px] text-white">{fmtARS(comisionMensual)}</span>
            </div>
            <div className="mt-4 text-[12.5px] text-[#9DB0C4] leading-relaxed">
              Cada venta genera 6 cuotas de comisión (50% del precio mensual).
              Se acreditan mientras el cliente mantenga su suscripción activa.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
