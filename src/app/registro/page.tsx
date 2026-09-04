"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PasswordInput } from "@/components/PasswordInput";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [puedeFacturar, setPuedeFacturar] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!puedeFacturar) {
      setError("Para ser revendedor necesitás poder emitir factura por tus comisiones de venta.");
      return;
    }
    if (!termsAccepted) {
      setError("Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para continuar.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, puedeFacturar }),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push(`/registro/verificar?email=${encodeURIComponent(email)}`);
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/panel/confirmar-facturacion" });
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

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
            Crear cuenta de revendedor
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">
            Empezá con lo básico — el resto de tus datos lo completás después.
          </p>

          {/* Google */}
          <button
            onClick={handleGoogle}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-[#DCE0E5] rounded-xl py-3 text-[14.5px] font-semibold text-[#0C2A45] bg-white hover:bg-[#F7F8FA] transition-colors cursor-pointer mb-5"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#E9ECEF]" />
            <span className="text-[12px] text-[#9AA3B2] font-medium">o registrate con email</span>
            <div className="flex-1 h-px bg-[#E9ECEF]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                required placeholder="Martina Quiroga" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="tu@email.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Contraseña</label>
              <PasswordInput value={password} onChange={setPassword} required placeholder="Mínimo 8 caracteres" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={puedeFacturar}
                onChange={(e) => setPuedeFacturar(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
              />
              <span className="text-[13.5px] text-[#0C2A45] leading-snug">
                Puedo emitir factura por mis comisiones de venta (monotributo u otro régimen).
                La cuenta de cobro va a estar a mi nombre.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
              />
              <span className="text-[13.5px] text-[#0C2A45] leading-snug">
                Acepto los{" "}
                <Link href="/terminos" target="_blank" rel="noopener noreferrer" className="text-[#0E6BA8] font-semibold">
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link href="/privacidad" target="_blank" rel="noopener noreferrer" className="text-[#0E6BA8] font-semibold">
                  Política de Privacidad
                </Link>.
              </span>
            </label>

            {error && (
              <div className="bg-[#FCE6E9] border border-[#E7A9B3] rounded-xl px-4 py-3 text-[13.5px] text-[#9B4A57] font-medium">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-[#0E6BA8] text-white font-semibold text-[15px] rounded-xl py-3.5 mt-1 cursor-pointer border-0 transition-opacity disabled:opacity-60">
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <p className="text-center text-[12.5px] text-[#9AA3B2] mt-5">
          ¿Ya tenés cuenta?{" "}
          <a href="/login" className="text-[#0E6BA8] font-semibold">Ingresá acá</a>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
