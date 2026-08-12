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
 * pagada al revendedor) — es el caso normal, porque agendaonline no le paga
 * a nadie hasta que Mercado Pago le liquida el dinero a ellos, ~35 días
 * después, mucho más tarde que la ventana de 10 días. Si por algún motivo
 * el revendedor ya facturó o ya le pagaron esa cuota, no se toca
 * automáticamente — lo resuelve el superadmin a mano.
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
