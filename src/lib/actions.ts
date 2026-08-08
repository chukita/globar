"use server";

import { signOut, auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, habilitaciones, facturas, cuotas, cuotasFacturas } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function updateZonaAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const zona = String(formData.get("zona") ?? "").trim();
  await db.update(revendedores).set({ zona: zona || null }).where(eq(revendedores.userId, session.user.id));
  revalidatePath("/panel/perfil");
}

async function requireSuperadmin() {
  const session = await auth();
  if (session?.user?.role !== "superadmin") throw new Error("No autorizado");
}

export async function toggleRevendedorActivoAction(revendedorId: string, activo: boolean) {
  await requireSuperadmin();
  await db.update(revendedores).set({ activo }).where(eq(revendedores.id, revendedorId));
  revalidatePath("/admin/revendedores");
}

export async function toggleHabilitacionAction(revendedorId: string, productoId: string, habilitar: boolean) {
  await requireSuperadmin();
  if (habilitar) {
    await db.insert(habilitaciones).values({ revendedorId, productoId }).onConflictDoNothing();
  } else {
    await db.delete(habilitaciones).where(
      and(eq(habilitaciones.revendedorId, revendedorId), eq(habilitaciones.productoId, productoId))
    );
  }
  revalidatePath("/admin/revendedores");
}

export async function marcarFacturaPagadaAction(facturaId: string) {
  await requireSuperadmin();

  await db.transaction(async (tx) => {
    await tx.update(facturas).set({ pagada: true, pagadaEn: new Date() }).where(eq(facturas.id, facturaId));

    const vinculos = await tx.select().from(cuotasFacturas).where(eq(cuotasFacturas.facturaId, facturaId));
    const cuotaIds = vinculos.map((v) => v.cuotaId);
    if (cuotaIds.length > 0) {
      await tx.update(cuotas).set({ status: "pagada", pagadoEn: new Date() }).where(inArray(cuotas.id, cuotaIds));
    }
  });

  revalidatePath("/admin/facturas");
  revalidatePath("/admin");
}
