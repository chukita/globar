"use client";

import { useState } from "react";
import { DATOS_FISCALES } from "@/lib/constants";
import { periodoLabel } from "@/lib/fecha";

const AFIP_URL = "https://auth.afip.gob.ar/contribuyente_/login.xhtml";

const fmtDMY = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

const fmtMonto = (n: number) => n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CopyChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        try { navigator.clipboard?.writeText(value); } catch { /* sin clipboard */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="ml-2 text-[11px] font-semibold text-[#0B5A8F] border border-[#C6DDEF] bg-[#F1F8FC] rounded-md px-1.5 py-0.5 align-middle"
    >
      {copied ? "¡copiado!" : "copiar"}
    </button>
  );
}

function Dato({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 border-b border-[#EEF2F5] last:border-b-0">
      <span className="text-[12.5px] text-[#7A8CA0] flex-shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-[#0C2A45] text-right">
        {value}
        {copy && <CopyChip value={value} />}
      </span>
    </div>
  );
}

export function FacturaGuia({
  periodoMes,
  periodoAnio,
  monto,
}: {
  periodoMes: number;
  periodoAnio: number;
  monto: number;
}) {
  const [open, setOpen] = useState(false);

  const hoy = new Date();
  const desde = new Date(periodoAnio, periodoMes - 1, 1);
  const hasta = new Date(periodoAnio, periodoMes, 0); // día 0 del mes siguiente = último del mes
  const periodo = periodoLabel(periodoMes, periodoAnio);
  const descripcion = `Comisiones por referidos glob.ar - ${periodo}`;
  const montoStr = fmtMonto(monto);

  return (
    <div className="mt-3 border border-[#C6DDEF] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#F1F8FC] text-left cursor-pointer border-0"
      >
        <span className="text-[13.5px] font-bold text-[#0B5A8F]">Cómo hacer esta factura en AFIP</span>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s", flexShrink: 0 }}>
          <path d="M4.5 6.75L9 11.25l4.5-4.5" stroke="#0B5A8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-4 py-4 bg-white">
          <p className="text-[13px] text-[#5B6577] leading-relaxed mt-0 mb-3">
            Es una <strong>Factura C</strong> por <strong>${montoStr}</strong>. Te dejamos todos los datos
            ya calculados para este pago — copialos y pegalos en el formulario de AFIP.
          </p>

          <div className="bg-[#FAFBFC] border border-[#E9ECEF] rounded-lg px-3.5 py-1 mb-4">
            <Dato label="Tipo de comprobante" value="Factura C" />
            <Dato label="Punto de venta" value="el tuyo habitual" />
            <Dato label="Concepto" value="Servicios" />
            <Dato label="Fecha del comprobante" value={fmtDMY(hoy)} />
            <Dato label="Período facturado — Desde" value={fmtDMY(desde)} copy />
            <Dato label="Período facturado — Hasta" value={fmtDMY(hasta)} copy />
            <Dato label="Fecha de vto. para el pago" value={fmtDMY(hoy)} />
            <Dato label="Receptor · Condición IVA" value={DATOS_FISCALES.condicionIva} />
            <Dato label="Receptor · CUIT" value={DATOS_FISCALES.cuit} copy />
            <Dato label="Condición de venta" value="Contado" />
            <Dato label="Detalle · Cantidad" value="1" />
            <Dato label="Detalle · Descripción" value={descripcion} copy />
            <Dato label="Detalle · Precio unitario" value={montoStr} copy />
            <Dato label="Importe total (tiene que dar exacto)" value={`$${montoStr}`} />
          </div>

          <div className="text-[12.5px] font-semibold text-[#9AA3B2] uppercase tracking-[.05em] mb-2">Pasos</div>
          <ol className="text-[13px] text-[#3F4A5A] leading-relaxed pl-5 m-0 flex flex-col gap-2">
            <li>Entrá a AFIP con tu CUIT y clave fiscal y abrí el servicio <strong>Comprobantes en línea</strong>.</li>
            <li>Elegí tu empresa (tu CUIT) y entrá a <strong>Generar Comprobantes</strong>.</li>
            <li><strong>Punto de venta</strong>: el tuyo habitual. <strong>Tipo de comprobante</strong>: <strong>Factura C</strong>. → Continuar.</li>
            <li>
              <strong>Concepto</strong>: <strong>Servicios</strong>. <strong>Fecha del comprobante</strong>: {fmtDMY(hoy)}.
              {" "}<strong>Período facturado</strong>: Desde <strong>{fmtDMY(desde)}</strong>, Hasta <strong>{fmtDMY(hasta)}</strong>.
              {" "}<strong>Fecha de vto. para el pago</strong>: {fmtDMY(hoy)}. → Continuar.
            </li>
            <li>
              <strong>Condición frente al IVA del receptor</strong>: <strong>{DATOS_FISCALES.condicionIva}</strong>.
              {" "}<strong>CUIT</strong>: <strong>{DATOS_FISCALES.cuit}</strong> — al salir del campo, AFIP completa el nombre solo
              ({DATOS_FISCALES.nombre}). <strong>Condición de venta</strong>: <strong>Contado</strong>. → Continuar.
            </li>
            <li>
              <strong>Detalle</strong>: Cantidad <strong>1</strong>, Descripción <strong>&ldquo;{descripcion}&rdquo;</strong>,
              {" "}Precio unitario <strong>{montoStr}</strong>. El <strong>Importe total</strong> tiene que dar <strong>${montoStr}</strong> exacto. → Continuar.
            </li>
            <li>Revisá y <strong>Confirmar Datos</strong>. Descargá el PDF del comprobante.</li>
            <li>Volvé acá y subí ese PDF en <strong>&ldquo;Enviar factura en PDF&rdquo;</strong>. Queda en revisión hasta que lo aprobemos.</li>
          </ol>

          <a href={AFIP_URL} target="_blank" rel="noreferrer"
            className="mt-4 font-semibold text-[13.5px] text-white bg-[#0E6BA8] rounded-xl py-2.5 w-full text-center block no-underline">
            Ir a AFIP — Comprobantes en Línea
          </a>
        </div>
      )}
    </div>
  );
}
