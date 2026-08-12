import { auth } from "@/lib/auth";
import { db } from "@/db";
import { revendedores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClientesDelRevendedor } from "@/lib/panel-data";

const fmtARS = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const formatFecha = (d: Date) => d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

export default async function ClientesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, session.user.email)).limit(1);
  const [rev] = await db.select({ id: revendedores.id }).from(revendedores).where(eq(revendedores.userId, user.id)).limit(1);

  const clientes = rev ? await getClientesDelRevendedor(rev.id) : [];

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
          <>
            <div className="px-6 py-3 bg-[#F8FAFB] text-xs font-semibold uppercase tracking-[.04em] text-[#9AA3B2]"
              style={{ display: "grid", gridTemplateColumns: "1.3fr 1.5fr 1fr .9fr 1fr" }}>
              <span>Cliente</span><span>Email</span><span>Producto</span><span>Alta</span><span className="text-right">Precio mensual</span>
            </div>
            {clientes.map((c) => (
              <div key={c.id} className="px-6 py-4 border-t border-[#F1F3F5] items-center text-[14.5px]"
                style={{ display: "grid", gridTemplateColumns: "1.3fr 1.5fr 1fr .9fr 1fr" }}>
                <span className="font-semibold text-[#0C2A45] truncate">{c.cliente}</span>
                <span className="text-[#5B6577] truncate">{c.clienteEmail ?? "—"}</span>
                <span className="text-[#0C2A45] font-medium">{c.producto}</span>
                <span className="text-[#9AA3B2] text-[13px]">{formatFecha(c.vendidoEn)}</span>
                <span className="text-right font-bold">{fmtARS(parseFloat(c.precioMensual))}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
