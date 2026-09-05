import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FacturasClient } from "./FacturasClient";
import { getLiquidacionesDelRevendedor, getFacturasDelRevendedor } from "@/lib/panel-data";
import { periodoLabel } from "@/lib/fecha";
import { DATOS_FISCALES } from "@/lib/constants";

export default async function FacturasPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  if (!rev) {
    return (
      <div className="p-10 max-w-[860px]">
        <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Facturas</h1>
        <p className="text-[14.5px] text-[#5B6577] mt-4">Todavía no tenés un perfil de revendedor activo.</p>
      </div>
    );
  }

  const [liqs, facturasLegacy] = await Promise.all([
    getLiquidacionesDelRevendedor(rev.id),
    getFacturasDelRevendedor(rev.id),
  ]);

  const ser = (l: (typeof liqs)[number]) => ({
    id: l.id,
    periodo: periodoLabel(l.periodoMes, l.periodoAnio),
    monto: Number(l.monto),
    cantidadCuotas: l.cantidadCuotas,
    pagadaEn: l.pagadaEn.toISOString(),
    facturaVenceEn: l.facturaVenceEn.toISOString(),
    facturaRecibidaEn: l.facturaRecibidaEn ? l.facturaRecibidaEn.toISOString() : null,
    rechazoMotivo: l.facturaRechazoMotivo ?? null,
    tieneFactura: !!l.facturaUrl,
  });

  const pendientes = liqs.filter((l) => l.status === "pagada").map(ser);
  const enRevision = liqs.filter((l) => l.status === "en_revision").map(ser);
  const historial = liqs
    .filter((l) => l.status === "facturada" || l.status === "anulada")
    .map((l) => ({ ...ser(l), anulada: l.status === "anulada" }));

  const legacy = facturasLegacy.map((f) => ({
    id: f.id,
    monto: Number(f.monto),
    nota: f.nota ?? "",
    subida: f.subidaEn.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }),
    pagada: f.pagada,
  }));

  return (
    <div className="p-10 max-w-[860px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Facturas</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        A principio de mes te transferimos todo lo que acumulaste el mes anterior. Después subís acá la
        factura correspondiente, por el <strong>monto exacto</strong> de la liquidación.
      </p>

      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-[9px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[14px]">i</div>
          <div className="text-[13.5px] font-bold text-[#0B5A8F]">Datos para hacer la factura</div>
        </div>
        <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-[13px] text-[#3F6280] m-0">
          <dt className="text-[#7A8CA0]">Tipo</dt><dd className="m-0 font-semibold">{DATOS_FISCALES.tipoComprobante}</dd>
          <dt className="text-[#7A8CA0]">A nombre de</dt><dd className="m-0 font-semibold">{DATOS_FISCALES.nombre}</dd>
          <dt className="text-[#7A8CA0]">CUIT</dt><dd className="m-0 font-semibold">{DATOS_FISCALES.cuit}</dd>
          <dt className="text-[#7A8CA0]">Condición IVA</dt><dd className="m-0 font-semibold">{DATOS_FISCALES.condicionIva}</dd>
          <dt className="text-[#7A8CA0]">Domicilio</dt><dd className="m-0 font-semibold">{DATOS_FISCALES.domicilio}</dd>
          <dt className="text-[#7A8CA0]">Importe</dt><dd className="m-0 font-semibold">el monto exacto de cada liquidación</dd>
        </dl>
        <p className="text-[12px] text-[#7A8CA0] leading-relaxed mt-3 mb-0">
          Al cargar el CUIT en ARCA, el nombre lo completa el sistema. &quot;{DATOS_FISCALES.nombreComercial}&quot; es
          el nombre comercial. La factura la hacés con tu mismo CUIT/CUIL y CBU/alias de cobro. Si no la enviás
          antes de la fecha límite, quedás excluido de la liquidación del mes siguiente hasta ponerte al día —
          las comisiones se te siguen acumulando igual.
        </p>
      </div>

      <FacturasClient pendientes={pendientes} enRevision={enRevision} historial={historial} legacy={legacy} />
    </div>
  );
}
