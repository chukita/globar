import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { CompletarPerfilForm } from "./CompletarPerfilForm";

export default async function CompletarPerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rev = await getRevendedorByUserId(session.user.id);
  if (rev && !rev.activo) redirect("/panel/cuenta-desactivada");
  if (rev && (!rev.puedeFacturar || !rev.fechaNacimiento)) redirect("/panel/confirmar-facturacion");

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
      <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
        Completá tus datos
      </h1>
      <p className="text-[14px] text-[#5B6577] mb-6">
        Estos datos no son obligatorios para usar el panel, pero los necesitás cargados (junto con tu
        CBU/alias y CUIT en <strong>Perfil → Datos de cobro</strong>) para entrar en la liquidación mensual y cobrar tus comisiones.
      </p>
      <CompletarPerfilForm
        dni={rev?.dni ?? ""}
        telefono={rev?.telefono ?? ""}
        provincia={rev?.provincia ?? ""}
        localidad={rev?.localidad ?? ""}
      />
    </div>
  );
}
