import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cuotas } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Avisado por agendaonline/nume cuando un cliente ejerce el derecho de
 * arrepentimiento (Ley 24.240, baja + reembolso dentro de los 10 días de
 * contratada la suscripción) y se le reembolsó automáticamente el pago.
 *
 * Solo anula la cuota si sigue en "generada" (todavía no facturada ni
 * pagada al revendedor) — es el caso esperado, porque `diasLiquidacionMp`
 * (ver configuracion) está pensado para igualar la ventana de arrepentimiento
 * de 10 días, así que una cuota recién se vuelve facturable cuando el
 * cliente ya no puede arrepentirse. Puede haber un margen mínimo si ambas
 * ventanas coinciden casi exactamente (o si el superadmin configuró menos
 * días que eso) — por eso este chequeo sigue siendo necesario y no un caso
 * puramente teórico. Si el revendedor ya facturó o ya le pagaron esa cuota,
 * no se toca automáticamente — lo resuelve el superadmin a mano.
 *
 * {
 *   "pagoId": "agenda-<preapprovalId>-<año>-<mes>"  // el mismo id determinístico
 *                                                     // que se usó al reportar el pago original
 * }
 */
interface AnularPayload {
  pagoId: string;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: AnularPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { pagoId } = body;
  if (!pagoId) {
    return NextResponse.json({ error: "Falta pagoId" }, { status: 400 });
  }

  const [cuota] = await db
    .select()
    .from(cuotas)
    .where(eq(cuotas.pagoExternoId, pagoId))
    .limit(1);

  if (!cuota) {
    return NextResponse.json({ ok: true, anulada: false, motivo: "no se encontró ninguna cuota con ese pagoId" });
  }

  if (cuota.status !== "generada") {
    return NextResponse.json({
      ok: true,
      anulada: false,
      motivo: `la cuota ya está en estado "${cuota.status}", no se anula automáticamente`,
      cuotaId: cuota.id,
    });
  }

  await db
    .update(cuotas)
    .set({ status: "anulada", anuladoEn: new Date() })
    .where(eq(cuotas.id, cuota.id));

  return NextResponse.json({ ok: true, anulada: true, cuotaId: cuota.id });
}
