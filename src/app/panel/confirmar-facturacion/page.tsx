import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { ConfirmarFacturacionForm } from "./ConfirmarFacturacionForm";

export default async function ConfirmarFacturacionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rev = await getRevendedorByUserId(session.user.id);
  if (rev && !rev.activo) redirect("/panel/cuenta-desactivada");
  if (rev?.puedeFacturar) redirect("/panel/productos");

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
      <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
        Un último paso
      </h1>
      <p className="text-[14px] text-[#5B6577] mb-6">
        Para ser revendedor de glob.ar tenés que poder emitir factura por tus comisiones de venta.
        El resto de tus datos (DNI, CBU/alias, etc.) los completás después desde tu perfil — hacen
        falta recién cuando te toque cobrar.
      </p>
      <ConfirmarFacturacionForm />
    </div>
  );
}
