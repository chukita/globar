import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClientesDelRevendedor, getRegistrosDelRevendedor } from "@/lib/panel-data";
import { esSuscripcionActiva } from "@/lib/estadoSuscripcion";
import { ClientesTabs } from "./ClientesTabs";

/**
 * Función aparte (no inline en el componente) para que el `new Date()` no
 * quede dentro del cuerpo de ClientesPage — la regla de pureza de
 * react-hooks lo marca ahí aunque sea un server component que solo corre
 * una vez por request (mismo patrón que conDisponibilidad en panel/comisiones).
 */
function conEstadoSuscripcion<T extends { ultimoPagoEn: Date }>(rows: T[]) {
  const ahora = new Date();
  return rows.map((r) => ({
    ...r,
    suscripcionActiva: esSuscripcionActiva(r.ultimoPagoEn, ahora),
    diasSinPagar: Math.floor((ahora.getTime() - r.ultimoPagoEn.getTime()) / (24 * 60 * 60 * 1000)),
  }));
}

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  const clientesRaw = rev ? await getClientesDelRevendedor(rev.id) : [];
  const suscriptos = conEstadoSuscripcion(clientesRaw);
  const registrados = rev ? await getRegistrosDelRevendedor(rev.id) : [];

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Mis clientes</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Las personas que se registraron con tu link, y las que además ya pagaron.
      </p>

      <ClientesTabs suscriptos={suscriptos} registrados={registrados} />
    </div>
  );
}
