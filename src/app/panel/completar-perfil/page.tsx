import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { CompletarPerfilForm } from "./CompletarPerfilForm";

export default async function CompletarPerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rev = await getRevendedorByUserId(session.user.id);
  if (rev && !rev.activo) redirect("/panel/cuenta-desactivada");
  if (rev?.dni && rev?.fechaNacimiento && rev?.provincia && rev?.localidad && rev?.telefono) {
    redirect("/panel/productos");
  }

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
      <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
        Completá tu perfil
      </h1>
      <p className="text-[14px] text-[#5B6577] mb-6">
        Todavía no tenés un perfil de revendedor completo — completá estos datos para terminar de crear tu cuenta y habilitar el panel.
      </p>
      <CompletarPerfilForm
        dni={rev?.dni ?? ""}
        fechaNacimiento={rev?.fechaNacimiento ?? ""}
        telefono={rev?.telefono ?? ""}
        provincia={rev?.provincia ?? ""}
        localidad={rev?.localidad ?? ""}
        puedeFacturar={rev?.puedeFacturar ?? false}
      />
    </div>
  );
}
