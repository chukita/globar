import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { redirect } from "next/navigation";
import { ImpersonandoBanner } from "@/components/ImpersonandoBanner";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Revendedor";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  const role = session?.user?.role ?? undefined;

  // Encadenado: cuenta desactivada → no confirmó que puede facturar
  // (confirmar-facturacion) → onboarding general no aprobado (onboarding).
  // Los datos personales (DNI, teléfono, etc.) YA NO bloquean el panel — son
  // opcionales y se completan después; hacen falta recién para cobrar. Quien
  // se registra por email ya marcó "puedo facturar" en /registro; quien entra
  // con Google no pasó por ese form y lo confirma en /panel/confirmar-facturacion.
  // Todas estas páginas viven afuera de este route group a propósito (si no, se
  // redirigirían a sí mismas).
  if (session?.user?.id) {
    const rev = await getRevendedorByUserId(session.user.id);
    // Sesión JWT: activo=false no invalida el token ya emitido, así que hay
    // que chequearlo acá en cada render (Server Component, con DB) — la
    // sesión en sí sigue siendo válida, lo que se corta es el acceso al panel.
    if (rev && !rev.activo) {
      redirect("/panel/cuenta-desactivada");
    }
    if (!rev || !rev.puedeFacturar) {
      redirect("/panel/confirmar-facturacion");
    }
    if (!rev.onboardingCompletedAt) {
      redirect("/panel/onboarding");
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {session?.user?.impersonated && <ImpersonandoBanner nombreRevendedor={name} />}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        <Sidebar resellerName={name} resellerInitials={initials || "R"} role={role} />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
