"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PasswordInput } from "@/components/PasswordInput";

function NuevaPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo cambiar la contraseña.");
      return;
    }
    setOk(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="md" darkText />
          </Link>
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
          <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
            Nueva contraseña
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">Elegí una contraseña nueva para tu cuenta.</p>

          {ok ? (
            <div className="bg-[#E6F4EA] border border-[#A9D5B8] rounded-xl px-4 py-3 text-[13.5px] text-[#3F6B4E] font-medium">
              Listo, tu contraseña quedó cambiada. Te llevamos al login…
            </div>
          ) : !token ? (
            <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
              El enlace está incompleto. Volvé a{" "}
              <Link href="/recuperar" className="underline font-semibold">
                pedir uno nuevo
              </Link>
              .
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Contraseña nueva</label>
                <PasswordInput value={password} onChange={setPassword} required />
              </div>
              <div>
                <label className={labelClass}>Repetir contraseña</label>
                <PasswordInput value={password2} onChange={setPassword2} required />
              </div>

              {error && (
                <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 mt-1 cursor-pointer border-0 transition-opacity disabled:opacity-60"
              >
                {loading ? "Guardando…" : "Cambiar contraseña"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[12.5px] text-[#9AA3B2] mt-5">
          <Link href="/login" className="text-[#0E6BA8] font-semibold">
            Volver a ingresar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function NuevaPasswordPage() {
  return (
    <Suspense fallback={null}>
      <NuevaPasswordForm />
    </Suspense>
  );
}
