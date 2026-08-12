import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cuotas } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Anula la cuota de comisión de un pago (por `pagoId`), para el caso de un
 * reembolso por derecho de arrepentimiento. Hoy nadie llama esto
 * automáticamente — el reembolso del lado de agendaonline es 100% manual
 * (ver CLAUDE.md, "Derecho de arrepentimiento"), así que este endpoint queda
 * disponible para invocarse a mano (o desde una futura herramienta) cuando
 * haga falta.
 *
 * Solo anula si la cuota sigue en "generada" (todavía no facturada ni
 * pagada al revendedor) — si ya se facturó o pagó, no se toca
 * automáticamente, lo resuelve el superadmin a mano.
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
