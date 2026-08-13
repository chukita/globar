import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClientesDelRevendedor } from "@/lib/panel-data";
import { esSuscripcionActiva } from "@/lib/estadoSuscripcion";

const formatFecha = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

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
  const clientes = conEstadoSuscripcion(clientesRaw);

  return (
    <div className="p-10">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Mis clientes</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Todas las personas que se registraron con tu link, por producto.
      </p>

      <div className="bg-white border border-[#E9ECEF] rounded-[18px] mt-6 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EEF0F2] font-semibold text-[17px]">
          {clientes.length} {clientes.length === 1 ? "cliente" : "clientes"}
        </div>
        {clientes.length === 0 ? (
          <div className="px-6 py-8 text-[14.5px] text-[#9AA3B2]">Todavía no tenés clientes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2] min-w-[680px]"
              style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
              <span>Cliente</span><span>Email</span><span>Producto</span><span>Alta</span><span className="text-right">Suscripción</span>
            </div>
            {clientes.map((c) => (
              <div key={c.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px] min-w-[680px]"
                style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr .9fr .8fr 1fr" }}>
                <span className="font-semibold text-[#0C2A45] truncate">{c.cliente}</span>
                <span className="text-[#5B6577] truncate">{c.clienteEmail ?? "—"}</span>
                <span className="text-[#0C2A45] font-medium">{c.producto}</span>
                <span className="text-[#9AA3B2] text-[13px]">{formatFecha(c.vendidoEn)}</span>
                <span className="text-right">
                  <span className="text-[12.5px] font-semibold rounded-full px-3 py-1.5 inline-flex items-center gap-1.5"
                    style={{
                      background: c.suscripcionActiva ? "#E7F5EE" : "#FFF3CD",
                      color: c.suscripcionActiva ? "#0B6B47" : "#7A6020",
                    }}>
                    {c.suscripcionActiva ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6.5L4.8 8.8L9.5 3.5" stroke="#0B6B47" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Activa
                      </>
                    ) : (
                      `Vencida hace ${c.diasSinPagar} días`
                    )}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
