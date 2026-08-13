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
  notifAdminEmails?: string | null;
  notifRevendedorNuevo?: boolean;
  notifFacturaSubida?: boolean;
}) {
  await getConfiguracion(); // asegura que la fila exista antes del update

  const [actualizada] = await db
    .update(configuracion)
    .set({
      comisionMonto: String(values.comisionMonto),
      comisionMeses: values.comisionMeses,
      ...(values.notifAdminEmails !== undefined ? { notifAdminEmails: values.notifAdminEmails } : {}),
      ...(values.notifRevendedorNuevo !== undefined ? { notifRevendedorNuevo: values.notifRevendedorNuevo } : {}),
      ...(values.notifFacturaSubida !== undefined ? { notifFacturaSubida: values.notifFacturaSubida } : {}),
      actualizadoEn: new Date(),
    })
    .where(eq(configuracion.id, 1))
    .returning();

  return actualizada;
}
