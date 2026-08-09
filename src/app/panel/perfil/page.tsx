import { auth } from "@/lib/auth";
import { ensureRevendedor } from "@/lib/revendedor";
import { getRevendedorStats } from "@/lib/panel-data";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fmtARS } from "@/lib/constants";
import { PerfilClient } from "@/components/PerfilClient";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await auth();
  const revendedor = await ensureRevendedor(session!.user!.id!);
  const stats = await getRevendedorStats(revendedor.id);
  const productosActivos = await db.select().from(productos).where(eq(productos.status, "activo"));

  const links = productosActivos.map((p) => ({
    producto: p.nombre,
    url: `https://${p.dominio}/?ref=${revendedor.codigoVentas}`,
  }));

  return (
    <div className="p-10 max-w-[980px]">
      <h1 className="font-extrabold text-[30px] m-0" style={{ letterSpacing: "-0.025em" }}>Perfil y código de ventas</h1>
      <p className="text-[14.5px] text-[#5B6577] mt-1.5 mb-0">
        Gestioná tus datos y compartí tu código para registrar nuevas ventas.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { label: "Ventas totales",        value: String(stats.ventasTotales),               accent: "#0C2A45" },
          { label: "Comisiones cobradas",   value: fmtARS(stats.comisionesCobradas),          accent: "#0B5A8F" },
          { label: "Comisiones pendientes", value: fmtARS(stats.comisionesPendientes),        accent: "#9B4A57" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#E9ECEF] rounded-2xl p-[22px]">
            <div className="text-[13px] text-[#5B6577]">{s.label}</div>
            <div className="font-extrabold text-[32px] mt-1.5" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      <PerfilClient
        codigoVentas={revendedor.codigoVentas}
        links={links}
        nombre={session!.user!.name ?? ""}
        email={session!.user!.email ?? ""}
        zona={revendedor.zona}
        activo={revendedor.activo}
      />
    </div>
  );
}
