"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { PasswordInput } from "@/components/PasswordInput";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("superadmin", {
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Contraseña incorrecta.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="min-h-screen bg-[#0C2A45] flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
          <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
            Acceso superadmin
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">
            Panel interno de glob.ar
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-[#0C2A45] mb-1.5">
                Contraseña
              </label>
              <PasswordInput value={password} onChange={setPassword} required autoFocus />
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
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
