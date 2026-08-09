import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, cuotas, ventas, productos, facturas, cuotasFacturas, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FacturasClient } from "./FacturasClient";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

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

  // Cuotas generadas disponibles para facturar
  const cuotasDisp = await db
    .select({
      id:           cuotas.id,
      numeroCuota:  cuotas.numeroCuota,
      monto:        cuotas.monto,
      periodoMes:   cuotas.periodoMes,
      periodoAnio:  cuotas.periodoAnio,
      clienteNombre: ventas.clienteNombre,
      productoNombre: productos.nombre,
    })
    .from(cuotas)
    .innerJoin(ventas, eq(cuotas.ventaId, ventas.id))
    .innerJoin(productos, eq(ventas.productoId, productos.id))
    .where(and(eq(cuotas.revendedorId, rev.id), eq(cuotas.status, "generada")))
    .orderBy(cuotas.periodoAnio, cuotas.periodoMes);

  // Facturas enviadas
  const facturasList = await db
    .select({
      id:       facturas.id,
      monto:    facturas.monto,
      nota:     facturas.nota,
      pagada:   facturas.pagada,
      subidaEn: facturas.subidaEn,
    })
    .from(facturas)
    .where(eq(facturas.revendedorId, rev.id))
    .orderBy(facturas.subidaEn);

  // Cantidad de cuotas por factura
  const cuotasPorFactura: Record<string, number> = {};
  for (const f of facturasList) {
    const links = await db
      .select({ cuotaId: cuotasFacturas.cuotaId })
      .from(cuotasFacturas)
      .where(eq(cuotasFacturas.facturaId, f.id));
    cuotasPorFactura[f.id] = links.length;
  }

  const MES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

  const cuotasSerializadas = cuotasDisp.map(c => ({
    id:       c.id,
    producto: c.productoNombre,
    cliente:  c.clienteNombre,
    mes:      `${MES[c.periodoMes - 1]} ${c.periodoAnio}`,
    cuota:    c.numeroCuota,
    monto:    parseFloat(c.monto),
  }));

  const facturasSerializadas = facturasList.map(f => ({
    id:      f.id,
    monto:   parseFloat(f.monto),
    cuotas:  cuotasPorFactura[f.id] ?? 0,
    nota:    f.nota ?? "",
    subida:  f.subidaEn.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }),
    pagada:  f.pagada,
  }));

  return (
    <div className="p-10 max-w-[860px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Facturas</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Seleccioná las cuotas que querés cobrar, adjuntá tu factura y enviala a Grupo Globaliza.
      </p>

      <div className="mt-5 bg-[#F1F8FC] border border-[#C6DDEF] rounded-[14px] px-5 py-4 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-[9px] bg-[#E1EFF8] flex-shrink-0 flex items-center justify-center font-extrabold text-[#0B5A8F] text-[14px]">i</div>
        <div className="text-[13.5px] text-[#3F6280] leading-relaxed">
          La factura debe ser a nombre de <strong>Grupo Globaliza</strong> por el monto exacto de las cuotas seleccionadas.
          Una vez que la revisemos, realizamos la transferencia y la marcamos como pagada.
        </div>
      </div>

      <FacturasClient
        cuotasIniciales={cuotasSerializadas}
        facturasIniciales={facturasSerializadas}
      />
    </div>
  );
}
