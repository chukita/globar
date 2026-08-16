"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function VerificarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/registro/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, codigo }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "No se pudo verificar el código.");
      setLoading(false);
      return;
    }

    await signIn("email-verificado", { token: data.token, redirect: false });
    router.push("/panel/completar-perfil");
  }

  async function handleReenviar() {
    if (!email) {
      setError("Escribí tu email para reenviar el código.");
      return;
    }
    setReenviando(true);
    setError("");
    await fetch("/api/registro/reenviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setReenviando(false);
    setReenviado(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 30_000);
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="md" darkText />
          </Link>
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
          <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
            Confirmá tu cuenta
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">
            Te mandamos un código a tu email. También podés hacer click en el enlace que te llegó.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="tu@email.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Código de 6 dígitos</label>
              <input type="text" inputMode="numeric" value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required maxLength={6} placeholder="123456"
                className={`${inputClass} text-center tracking-[0.3em] font-mono text-[18px]`} />
            </div>

            {error && (
              <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
                {error}
              </div>
            )}

            {reenviado && !error && (
              <div className="bg-[#E7F5EE] border border-[#B7DFC9] rounded-xl px-4 py-3 text-[13.5px] text-[#0B6B47] font-medium">
                Te reenviamos el código.
              </div>
            )}

            <button type="submit" disabled={loading || codigo.length !== 6}
              className="w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 mt-1 cursor-pointer border-0 transition-opacity disabled:opacity-60">
              {loading ? "Confirmando…" : "Confirmar"}
            </button>

            <button type="button" onClick={handleReenviar} disabled={reenviando || cooldown}
              className="text-[13px] font-semibold text-[#0E6BA8] bg-transparent border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {reenviando ? "Reenviando…" : "Reenviar código"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={null}>
      <VerificarForm />
    </Suspense>
  );
}
