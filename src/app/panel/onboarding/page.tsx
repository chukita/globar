import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRevendedorByUserId } from "@/lib/revendedor";
import { getConfiguracion } from "@/lib/configuracion";
import { getOnboardingQuizPublico } from "@/lib/onboardingQuiz";
import { OnboardingClient } from "./OnboardingClient";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rev = await getRevendedorByUserId(session.user.id);
  if (rev && !rev.activo) redirect("/panel/cuenta-desactivada");
  if (!rev || !rev.dni || !rev.fechaNacimiento || !rev.provincia || !rev.localidad || !rev.telefono) {
    redirect("/panel/completar-perfil");
  }
  if (rev.onboardingCompletedAt) redirect("/panel/productos");

  const { comisionMeses } = await getConfiguracion();
  const quiz = getOnboardingQuizPublico(comisionMeses);

  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
      <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
        Bienvenido a glob.ar
      </h1>
      <p className="text-[14px] text-[#5B6577] mb-6">
        Antes de entrar a tu panel, mirá este video corto y respondé unas preguntas sobre cómo funciona glob.ar.
      </p>
      <OnboardingClient quiz={quiz} />
    </div>
  );
}
