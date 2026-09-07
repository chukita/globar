"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const inputClass =
    "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/recuperar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "No se pudo procesar el pedido.");
      return;
    }
    setEnviado(true);
  }

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
            Recuperá tu contraseña
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">
            Te mandamos un enlace por email para elegir una nueva.
          </p>

          {enviado ? (
            <div className="bg-[#E6F4EA] border border-[#A9D5B8] rounded-xl px-4 py-3 text-[13.5px] text-[#3F6B4E] font-medium">
              Si hay una cuenta con contraseña asociada a ese email, te llega un enlace en unos minutos. Revisá también el
              spam. El enlace vence en 1 hora.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0C2A45] mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className={inputClass}
                />
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
                {loading ? "Enviando…" : "Enviarme el enlace"}
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
