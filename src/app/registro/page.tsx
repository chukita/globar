"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ProvinciaLocalidadFields } from "@/components/ProvinciaLocalidadFields";

// Calculado una sola vez al cargar el módulo (no en cada render: Date.now()
// es impuro y React 19 rechaza llamarlo durante el render, incluso en useMemo).
const MAX_FECHA_NACIMIENTO = new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().slice(0, 10);

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "", email: "", password: "",
    provincia: "", localidad: "",
    dni: "", fechaNacimiento: "", telefono: "",
    puedeFacturar: false,
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      setError(data.error ?? "Ocurrió un error. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/panel/productos");
  }

  const inputClass = "w-full border border-[#DCE0E5] rounded-xl px-4 py-3 text-[14.5px] text-[#0C2A45] placeholder-[#B0B8C4] outline-none focus:border-[#0E6BA8] focus:ring-2 focus:ring-[#0E6BA8]/10 transition-colors bg-white";
  const labelClass = "block text-[13px] font-semibold text-[#0C2A45] mb-1.5";

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[500px]">
        <div className="flex justify-center mb-8">
          <Logo size="md" darkText />
        </div>

        <div className="bg-white border border-[#E9ECEF] rounded-[20px] p-8">
          <h1 className="font-extrabold text-[24px] text-[#0C2A45] mb-1" style={{ letterSpacing: "-0.02em" }}>
            Crear cuenta de revendedor
          </h1>
          <p className="text-[14px] text-[#5B6577] mb-6">
            Completá tus datos para empezar a vender productos de glob.ar.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nombre */}
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)}
                required placeholder="Martina Quiroga" className={inputClass} />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                required placeholder="tu@email.com" className={inputClass} />
            </div>

            {/* Contraseña */}
            <div>
              <label className={labelClass}>Contraseña</label>
              <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)}
                required minLength={8} placeholder="Mínimo 8 caracteres" className={inputClass} />
            </div>

            <hr className="border-[#F0F2F5]" />

            {/* País — solo Argentina */}
            <div>
              <label className={labelClass}>País</label>
              <div className={`${inputClass} bg-[#F7F8FA] text-[#5B6577] cursor-not-allowed`}>
                Argentina
              </div>
            </div>

            <ProvinciaLocalidadFields
              provincia={form.provincia}
              localidad={form.localidad}
              onProvinciaChange={(v) => set("provincia", v)}
              onLocalidadChange={(v) => set("localidad", v)}
              required
              inputClass={inputClass}
              labelClass={labelClass}
            />

            <hr className="border-[#F0F2F5]" />

            {/* DNI y fecha de nacimiento */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>DNI</label>
                <input type="text" value={form.dni} onChange={(e) => set("dni", e.target.value.replace(/\D/g, ""))}
                  required maxLength={8} placeholder="12345678" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fecha de nacimiento</label>
                <input type="date" value={form.fechaNacimiento} onChange={(e) => set("fechaNacimiento", e.target.value)}
                  required max={MAX_FECHA_NACIMIENTO}
                  className={inputClass} />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label className={labelClass}>Teléfono <span className="text-[#9AA3B2] font-normal">(opcional)</span></label>
              <input type="tel" value={form.telefono} onChange={(e) => set("telefono", e.target.value)}
                placeholder="11 2345-6789" className={inputClass} />
            </div>

            <hr className="border-[#F0F2F5]" />

            {/* Puede facturar */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.puedeFacturar}
                onChange={(e) => set("puedeFacturar", e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0E6BA8] flex-shrink-0"
              />
              <span className="text-[13.5px] text-[#0C2A45] leading-snug">
                Puedo emitir facturas por mis comisiones de venta{" "}
                <span className="text-[#9AA3B2] font-normal">(monotributo u otro régimen)</span>
              </span>
            </label>

            {/* Términos y privacidad */}
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

            <button type="submit" disabled={loading || !termsAccepted}
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
