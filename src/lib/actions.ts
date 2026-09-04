"use server";

import { signOut, auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, habilitaciones, facturas, cuotas, cuotasFacturas, ventas, registros, users, contactos, productos } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendEmail, emailCuentaActivada, emailCuentaDesactivada, emailRespuestaContacto, emailMensajeRevendedor } from "@/lib/email";
import { signImpersonationToken } from "@/lib/impersonar";
import { validarQuiz } from "@/lib/capacitacionQuiz";
import { validarOnboardingQuiz } from "@/lib/onboardingQuiz";

export async function logoutAction() {
  const session = await auth();
  const dest = session?.user?.role === "superadmin" ? "/admin/login" : "/login";
  await signOut({ redirectTo: dest });
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

/** Genera el token de un solo uso que abre el panel del revendedor en /impersonar. */
export async function impersonarRevendedorAction(revendedorId: string): Promise<{ token: string }> {
  await requireSuperadmin();
  const [rev] = await db.select({ userId: revendedores.userId }).from(revendedores).where(eq(revendedores.id, revendedorId));
  if (!rev) throw new Error("Revendedor no encontrado");
  return { token: signImpersonationToken(rev.userId) };
}

/**
 * Corta la sesión impersonada y vuelve a /admin/login. A diferencia de
 * `logoutAction`, no mira el rol de la sesión: una sesión impersonada tiene
 * `role: "revendedor"`, así que `logoutAction` mandaría a /login.
 */
export async function salirDeImpersonacionAction() {
  await signOut({ redirectTo: "/admin/login" });
}

export async function toggleRevendedorActivoAction(revendedorId: string, activo: boolean) {
  await requireSuperadmin();
  await db.update(revendedores).set({ activo }).where(eq(revendedores.id, revendedorId));
  revalidatePath("/admin/revendedores");

  const [rev] = await db
    .select({ email: users.email, nombre: users.name })
    .from(revendedores)
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(eq(revendedores.id, revendedorId));
  if (rev) {
    const { subject, html } = activo ? emailCuentaActivada() : emailCuentaDesactivada();
    await sendEmail({ to: rev.email, toName: rev.nombre ?? undefined, subject, html });
  }
}

/**
 * Auto-habilitación: el revendedor mira el video de capacitación y aprueba
 * el quiz sin pasar por el superadmin. Las respuestas se corrigen acá (no en
 * el cliente) — `validarQuiz` compara contra la respuesta correcta, que
 * nunca viaja al browser (ver `lib/capacitacionQuiz.ts`).
 *
 * Devuelve `{ ok: false, error }` en vez de lanzar una excepción para el
 * caso esperado (respuesta incorrecta): en producción, Next.js oculta el
 * mensaje real de cualquier `throw` en una server action y lo reemplaza por
 * un texto genérico en inglés (por seguridad, para no filtrar detalles de
 * errores no controlados) — así que un `throw` acá nunca le habría llegado
 * en español al usuario fuera de dev. Los casos de sesión/datos inconsistentes
 * (no debería pasar en el uso normal) sí quedan como `throw`.
 */
export async function completarCapacitacionAction(productoNombre: string, respuestas: Record<string, number>): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, session.user.id)).limit(1);
  if (!rev) throw new Error("Revendedor no encontrado");

  const [producto] = await db.select({ id: productos.id }).from(productos).where(eq(productos.nombre, productoNombre)).limit(1);
  if (!producto) throw new Error("Producto no encontrado");

  if (!validarQuiz(productoNombre, respuestas)) {
    return { ok: false, error: "No aprobaste todas las preguntas — revisá y volvé a intentar" };
  }

  await db.insert(habilitaciones).values({ revendedorId: rev.id, productoId: producto.id }).onConflictDoNothing();
  revalidatePath("/panel/capacitacion");
  revalidatePath("/panel/productos");
  return { ok: true };
}

/**
 * Onboarding general de glob.ar (video + quiz), distinto de
 * completarCapacitacionAction: no depende de `productos`/`habilitaciones`
 * (no hay un producto "globar"), es un gate de panel completo que se marca
 * una sola vez en revendedores.onboardingCompletedAt. Mismo criterio que
 * completarCapacitacionAction para no lanzar excepción en el caso esperado
 * (respuesta incorrecta) — Next.js enmascara el mensaje de un throw real.
 */
export async function completarOnboardingGlobalAction(respuestas: Record<string, number>): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, session.user.id)).limit(1);
  if (!rev) throw new Error("Revendedor no encontrado");

  if (!validarOnboardingQuiz(respuestas)) {
    return { ok: false, error: "No aprobaste todas las preguntas — revisá y volvé a intentar" };
  }

  await db.update(revendedores).set({ onboardingCompletedAt: new Date() }).where(eq(revendedores.id, rev.id));
  revalidatePath("/panel");
  revalidatePath("/panel/capacitacion");
  return { ok: true };
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

/**
 * Borra un revendedor y todo lo asociado: cuotas, facturas, ventas,
 * registros (leads), habilitaciones, y el usuario (users → cascade a
 * accounts/sessions/revendedores/habilitaciones). cuotas/ventas/facturas/
 * registros no tienen onDelete cascade desde revendedores (a propósito,
 * para no perder historial de plata ni de leads por accidente en el uso
 * normal) así que hay que borrarlas a mano, en orden, antes de borrar el
 * usuario.
 *
 * Pensado para limpiar cuentas de prueba mientras glob.ar no tiene
 * revendedores reales — si el negocio ya tiene ventas/comisiones reales en
 * juego, esto debería reemplazarse por una baja lógica (activo=false) en
 * vez de un borrado físico. Usado tanto por el superadmin (borrar a otro)
 * como por la auto-eliminación del propio revendedor.
 */
async function borrarRevendedorPorId(revendedorId: string) {
  await db.transaction(async (tx) => {
    const [rev] = await tx.select({ userId: revendedores.userId }).from(revendedores).where(eq(revendedores.id, revendedorId));
    if (!rev) return;

    const cuotasDelRevendedor = await tx.select({ id: cuotas.id }).from(cuotas).where(eq(cuotas.revendedorId, revendedorId));
    const cuotaIds = cuotasDelRevendedor.map((c) => c.id);
    if (cuotaIds.length > 0) {
      await tx.delete(cuotasFacturas).where(inArray(cuotasFacturas.cuotaId, cuotaIds));
    }

    await tx.delete(facturas).where(eq(facturas.revendedorId, revendedorId));
    await tx.delete(cuotas).where(eq(cuotas.revendedorId, revendedorId));
    await tx.delete(ventas).where(eq(ventas.revendedorId, revendedorId));
    await tx.delete(registros).where(eq(registros.revendedorId, revendedorId));

    // Cascada automática: users → accounts, sessions, revendedores, habilitaciones.
    await tx.delete(users).where(eq(users.id, rev.userId));
  });
}

export async function eliminarRevendedorAction(revendedorId: string) {
  await requireSuperadmin();
  await borrarRevendedorPorId(revendedorId);
  revalidatePath("/admin/revendedores");
}

/** El revendedor se borra a sí mismo — nunca recibe un id, solo actúa sobre su propia sesión. */
export async function eliminarMiCuentaAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autorizado");

  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, session.user.id)).limit(1);
  if (!rev) throw new Error("Revendedor no encontrado");

  await borrarRevendedorPorId(rev.id);
  await signOut({ redirectTo: "/" });
}

export async function responderContactoAction(contactoId: string, mensaje: string) {
  await requireSuperadmin();
  if (!mensaje.trim()) throw new Error("El mensaje no puede estar vacío");

  const [contacto] = await db.select().from(contactos).where(eq(contactos.id, contactoId));
  if (!contacto) throw new Error("Consulta no encontrada");

  const { subject, html } = emailRespuestaContacto(mensaje.trim());
  await sendEmail({ to: contacto.email, toName: contacto.nombre, subject, html, replyTo: "hola@glob.ar" });

  await db.update(contactos).set({ respondido: true, respondidoEn: new Date() }).where(eq(contactos.id, contactoId));
  revalidatePath("/admin/contacto");
}

export async function enviarMensajeRevendedorAction(revendedorId: string, asunto: string, mensaje: string) {
  await requireSuperadmin();
  if (!asunto.trim() || !mensaje.trim()) throw new Error("Completá asunto y mensaje");

  const [rev] = await db
    .select({ email: users.email, nombre: users.name })
    .from(revendedores)
    .innerJoin(users, eq(revendedores.userId, users.id))
    .where(eq(revendedores.id, revendedorId));
  if (!rev) throw new Error("Revendedor no encontrado");

  const { subject, html } = emailMensajeRevendedor(asunto.trim(), mensaje.trim());
  await sendEmail({ to: rev.email, toName: rev.nombre ?? undefined, subject, html, replyTo: "hola@glob.ar" });
}

export async function actualizarProductoAction(productoId: string, values: {
  dominio: string;
  urlRegistro: string;
  tag: string;
  descripcion: string;
  precioMensual: number;
  status: "activo" | "inactivo";
}) {
  await requireSuperadmin();
  await db.update(productos).set({
    dominio: values.dominio.trim(),
    urlRegistro: values.urlRegistro.trim(),
    tag: values.tag.trim(),
    descripcion: values.descripcion.trim(),
    precioMensual: String(values.precioMensual),
    status: values.status,
  }).where(eq(productos.id, productoId));
  revalidatePath("/admin/productos");
  revalidatePath("/");
}

// El flujo de "marcar factura como pagada" del superadmin se movió a
// src/lib/liquidaciones-actions.ts (confirmarLiquidacionAction) con el rediseño
// de sept. 2026: ahora se paga primero (liquidación mensual) y la factura llega
// después.
