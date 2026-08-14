import { notFound } from "next/navigation";
import Link from "next/link";
import { getRevendedorDetalle } from "@/lib/admin-data";
import { fmtARS } from "@/lib/constants";
import { waLink } from "@/lib/telefono";
import { MensajeRevendedorForm } from "@/components/MensajeRevendedorForm";

export const dynamic = "force-dynamic";

export default async function RevendedorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rev = await getRevendedorDetalle(id);
  if (!rev) notFound();

  return (
    <div className="p-10 max-w-[980px]">
      <Link href="/admin/revendedores" className="text-[13px] font-semibold text-[#0B5A8F]">
        ← Volver a revendedores
      </Link>

      <div className="flex items-start justify-between flex-wrap gap-3 mt-4">
        <div>
          <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>{rev.nombre ?? "—"}</h1>
          <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">{rev.email}</p>
        </div>
        <span className="text-[12px] font-semibold rounded-full px-3 py-1.5 inline-block"
          style={{ background: rev.activo ? "#E7F5EE" : "#EEF0F2", color: rev.activo ? "#0B6B47" : "#5B6577" }}>
          {rev.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
          <div className="text-[13px] text-[#5B6577] font-medium">Código</div>
          <div className="font-extrabold text-[20px] mt-2 font-mono text-[#0B5A8F]">{rev.codigoVentas}</div>
        </div>
        <div className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
          <div className="text-[13px] text-[#5B6577] font-medium">Ventas</div>
          <div className="font-extrabold text-[22px] mt-2">{rev.ventas}</div>
        </div>
        <div className="bg-white border border-[#E9ECEF] rounded-[16px] p-5">
          <div className="text-[13px] text-[#5B6577] font-medium">Cobrado</div>
          <div className="font-extrabold text-[22px] mt-2 text-[#0B6B47]">{fmtARS(rev.ingreso)}</div>
        </div>
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-5">Datos personales</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <DataRow label="DNI" value={rev.dni ?? "—"} />
          <DataRow label="Fecha de nacimiento" value={rev.fechaNacimiento ?? "—"} />
          {rev.telefono ? (
            <div className="border-b border-[#EEF0F2] pb-4">
              <div className="text-[12.5px] text-[#9AA3B2]">Teléfono</div>
              <a href={waLink(rev.telefono)} target="_blank" rel="noopener noreferrer"
                className="text-[15px] font-semibold mt-1 text-[#0B6B47] hover:underline inline-flex items-center gap-1.5">
                {rev.telefono}
                <span className="text-[11.5px] font-medium text-[#0B6B47]/70">(WhatsApp)</span>
              </a>
            </div>
          ) : (
            <DataRow label="Teléfono" value="—" />
          )}
          <DataRow label="País" value={rev.pais ?? "—"} />
          <DataRow label="Provincia" value={rev.provincia ?? "—"} />
          <DataRow label="Localidad" value={rev.localidad ?? "—"} />
        </div>
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-5">Datos de cobro</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <DataRow label="CBU / Alias" value={rev.cbuAlias ?? "—"} />
          <DataRow label="Titular" value={rev.titularNombre ?? "—"} />
          <DataRow label="CUIT/CUIL" value={rev.titularCuit ?? "—"} />
          <DataRow label="Puede facturar" value={rev.puedeFacturar ? "Sí" : "No"} />
        </div>
      </div>

      <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-7 mt-5">
        <div className="font-semibold text-[18px] mb-5">Productos habilitados</div>
        <div className="flex gap-2 flex-wrap">
          {rev.productos.map((p) => (
            <span key={p.id} className="text-[12px] font-semibold rounded-full px-3 py-1.5"
              style={{ background: p.habilitado ? "#E7F5EE" : "#F0F2F5", color: p.habilitado ? "#0B6B47" : "#9AA3B2" }}>
              {p.nombre}
            </span>
          ))}
        </div>
      </div>

      <MensajeRevendedorForm revendedorId={rev.id} />
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#EEF0F2] pb-4">
      <div className="text-[12.5px] text-[#9AA3B2]">{label}</div>
      <div className="text-[15px] font-semibold mt-1 text-[#0C2A45]">{value}</div>
    </div>
  );
}
