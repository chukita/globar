"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/Logo";

/**
 * Puente de impersonación: pestaña nueva abierta desde /admin/revendedores.
 * Vive fuera de /panel y /admin a propósito — el middleware redirige /panel/*
 * lejos si la sesión sigue siendo de superadmin (que es la cookie que esta
 * pestaña todavía tiene al cargar, antes de que el sign-in la reemplace).
 */
export default function ImpersonarPage() {
  return (
    <Suspense fallback={null}>
      <ImpersonarContent />
    </Suspense>
  );
}

function ImpersonarContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [signInError, setSignInError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    signIn("impersonate", { token, redirect: false }).then((result) => {
      if (cancelled) return;
      if (result?.error) {
        setSignInError("El link para entrar al panel venció o ya se usó. Volvé a hacer click en \"Entrar como\" desde /admin/revendedores.");
      } else {
        router.push("/panel/clientes");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  const error = !token ? "Falta el token de acceso." : signInError;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px] text-center">
        <div className="flex justify-center mb-8">
          <Logo size="md" darkText />
        </div>
        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
          {error ? (
            <p className="text-[14.5px] text-[#9B4A57]">{error}</p>
          ) : (
            <p className="text-[14.5px] text-[#5B6577]">Entrando al panel…</p>
          )}
        </div>
      </div>
    </div>
  );
}
