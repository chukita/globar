import { db } from "@/db";
import { configuracion } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getConfiguracion() {
  const [existing] = await db.select().from(configuracion).where(eq(configuracion.id, 1)).limit(1);
  if (existing) return existing;

  const [creada] = await db.insert(configuracion).values({ id: 1 }).returning();
  return creada;
}

export async function updateConfiguracion(values: {
  comisionMonto: number;
  comisionMeses: number;
  mesesGraciaFactura?: number;
  notifAdminEmails?: string | null;
  notifRevendedorNuevo?: boolean;
  notifFacturaSubida?: boolean;
  notifLiquidacionBloqueada?: boolean;
}) {
  await getConfiguracion(); // asegura que la fila exista antes del update

  const [actualizada] = await db
    .update(configuracion)
    .set({
      comisionMonto: String(values.comisionMonto),
      comisionMeses: values.comisionMeses,
      ...(values.mesesGraciaFactura !== undefined ? { mesesGraciaFactura: values.mesesGraciaFactura } : {}),
      ...(values.notifAdminEmails !== undefined ? { notifAdminEmails: values.notifAdminEmails } : {}),
      ...(values.notifRevendedorNuevo !== undefined ? { notifRevendedorNuevo: values.notifRevendedorNuevo } : {}),
      ...(values.notifFacturaSubida !== undefined ? { notifFacturaSubida: values.notifFacturaSubida } : {}),
      ...(values.notifLiquidacionBloqueada !== undefined ? { notifLiquidacionBloqueada: values.notifLiquidacionBloqueada } : {}),
      actualizadoEn: new Date(),
    })
    .where(eq(configuracion.id, 1))
    .returning();

  return actualizada;
}
