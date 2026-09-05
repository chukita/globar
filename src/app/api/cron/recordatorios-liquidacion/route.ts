import { NextRequest, NextResponse } from "next/server";
import { procesarRecordatoriosLiquidacion } from "@/lib/recordatorios-liquidacion";

/**
 * Cron diario de recordatorios de factura pendiente. Lo dispara el workflow
 * `.github/workflows/recordatorios-liquidacion.yml` (schedule) con:
 *
 *   Authorization: Bearer $CRON_SECRET
 *
 * Recorre las liquidaciones `pagada` que todavía esperan factura y manda, una
 * sola vez cada una, el recordatorio suave (ventana previa al vencimiento) o el
 * aviso de bloqueo (al vencer). El superadmin puede forzar envíos desde
 * /admin/liquidaciones (server action, sin throttle).
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await procesarRecordatoriosLiquidacion({ forzar: false });
  return NextResponse.json({ ok: true, ...res });
}
