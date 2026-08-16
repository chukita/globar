"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function ConfirmarContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token")?.trim() ?? "";
  const [error, setError] = useState<string | null>(() => (token ? null : "Falta el enlace de confirmación."));

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/registro/verificar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data.token) {
          setError(data.error ?? "No se pudo confirmar la cuenta.");
          return;
        }
        await signIn("email-verificado", { token: data.token, redirect: false });
        router.replace("/panel/completar-perfil");
      } catch {
        if (!cancelled) setError("Error de red. Probá de nuevo.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="md" darkText />
          </Link>
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8 text-center">
          {error ? (
            <>
              <h1 className="font-extrabold text-[22px] text-[#0C2A45] mb-2" style={{ letterSpacing: "-0.02em" }}>
                No pudimos confirmar tu cuenta
              </h1>
              <p className="text-[14px] text-[#5B6577] mb-6">{error}</p>
              <Link
                href="/registro/verificar"
                className="inline-block w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 no-underline"
              >
                Ingresar código manualmente
              </Link>
            </>
          ) : (
            <>
              <h1 className="font-extrabold text-[22px] text-[#0C2A45] mb-2" style={{ letterSpacing: "-0.02em" }}>
                Confirmando tu cuenta…
              </h1>
              <p className="text-[14px] text-[#5B6577]">Un momento, no cierres esta página.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmarPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmarContent />
    </Suspense>
  );
}
