import {
  getPreviewLiquidacionMesAnterior,
  getLiquidacionesEsperandoFactura,
  getHistorialLiquidaciones,
} from "@/lib/admin-data";
import { getConfiguracion } from "@/lib/configuracion";
import { periodoLabel } from "@/lib/fecha";
import { LiquidacionesClient } from "@/components/LiquidacionesClient";

// Lee todo en cada request — sin esto Next intenta prerenderearla en build time
// (sin DB en el runner de CI) y el build falla.
export const dynamic = "force-dynamic";

export default async function AdminLiquidacionesPage() {
  const [preview, esperando, historial, config] = await Promise.all([
    getPreviewLiquidacionMesAnterior(),
    getLiquidacionesEsperandoFactura(),
    getHistorialLiquidaciones(),
    getConfiguracion(),
  ]);

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Liquidaciones</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        A principio de mes: mandá los recordatorios pendientes, transferí por Mercado Pago lo que
        cada revendedor acumuló y confirmá cada pago. La factura la suben ellos después
        ({config.mesesGraciaFactura} {config.mesesGraciaFactura === 1 ? "mes" : "meses"} de plazo).
      </p>

      <LiquidacionesClient
        periodo={periodoLabel(preview.periodoMes, preview.periodoAnio)}
        preview={preview.filas}
        esperando={esperando.map((e) => ({
          ...e,
          monto: Number(e.monto),
          pagadaEn: e.pagadaEn.toISOString(),
          facturaVenceEn: e.facturaVenceEn.toISOString(),
          ultimoRecordatorioEn: e.ultimoRecordatorioEn ? e.ultimoRecordatorioEn.toISOString() : null,
          periodoLabel: periodoLabel(e.periodoMes, e.periodoAnio),
        }))}
        historial={historial.map((h) => ({
          ...h,
          monto: Number(h.monto),
          pagadaEn: h.pagadaEn.toISOString(),
          facturaRecibidaEn: h.facturaRecibidaEn ? h.facturaRecibidaEn.toISOString() : null,
          periodoLabel: periodoLabel(h.periodoMes, h.periodoAnio),
        }))}
      />
    </div>
  );
}
