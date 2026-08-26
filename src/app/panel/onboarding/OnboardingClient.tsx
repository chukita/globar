"use client";

import { useRouter } from "next/navigation";
import { EvaluacionStepper } from "@/components/EvaluacionStepper";
import { completarOnboardingGlobalAction } from "@/lib/actions";
import type { QuizQuestion } from "@/lib/capacitacionQuiz";

export function OnboardingClient({ quiz }: { quiz: QuizQuestion[] }) {
  const router = useRouter();

  return (
    <EvaluacionStepper
      videoUrl="/capacitacion/onboarding.mp4"
      quiz={quiz}
      onSubmit={completarOnboardingGlobalAction}
      successTitle="¡Listo, ya sos parte de glob.ar!"
      successBody={
        <>
          Ya podés entrar a tu panel.
          <br />
          <button
            onClick={() => router.push("/panel")}
            className="mt-4 font-semibold text-[13.5px] bg-[#0C2A45] text-white border-0 rounded-xl px-5 py-2.5 cursor-pointer"
          >
            Ir a mi panel
          </button>
        </>
      }
    />
  );
}
