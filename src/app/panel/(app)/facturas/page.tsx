import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FacturasClient } from "./FacturasClient";
import { getLiquidacionesDelRevendedor, getFacturasDelRevendedor } from "@/lib/panel-data";
import { periodoLabel } from "@/lib/fecha";

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
    tieneFactura: !!l.facturaUrl,
  });

  const pendientes = liqs.filter((l) => l.status === "pagada").map(ser);
  const historial = liqs.filter((l) => l.status !== "pagada").map((l) => ({ ...ser(l), anulada: l.status === "anulada" }));

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
        factura correspondiente a nombre de <strong>Grupo Globaliza</strong>.
      </p>

      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-[9px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[14px]">i</div>
        <div className="text-[13.5px] text-[#3F6280] leading-relaxed">
          Cada factura tiene que ser a nombre de <strong>Grupo Globaliza</strong> por el monto exacto de la
          liquidación, con tu mismo CUIT/CUIL y CBU/alias de cobro. Si no la enviás antes de la fecha límite,
          quedás excluido de la liquidación del mes siguiente hasta ponerte al día — las comisiones se te
          siguen acumulando igual.
        </div>
      </div>

      <FacturasClient pendientes={pendientes} historial={historial} legacy={legacy} />
    </div>
  );
}
