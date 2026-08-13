import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { redirect } from "next/navigation";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Revendedor";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  const role = session?.user?.role ?? undefined;

  // Quien se registra con Google nunca pasó por /registro (que sí pide estos
  // datos) — ensureRevendedor() le crea una fila vacía. Bloqueamos el resto
  // del panel hasta que los complete en /panel/completar-perfil, que queda
  // afuera de este route group a propósito (si no, se redirigiría a sí mismo).
  if (session?.user?.id) {
    const rev = await getRevendedorByUserId(session.user.id);
    // Sesión JWT: activo=false no invalida el token ya emitido, así que hay
    // que chequearlo acá en cada render (Server Component, con DB) — la
    // sesión en sí sigue siendo válida, lo que se corta es el acceso al panel.
    if (rev && !rev.activo) {
      redirect("/panel/cuenta-desactivada");
    }
    if (!rev || !rev.dni || !rev.fechaNacimiento || !rev.provincia || !rev.localidad) {
      redirect("/panel/completar-perfil");
    }
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar resellerName={name} resellerInitials={initials || "R"} role={role} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
