import type { Metadata } from "next";
import Link from "next/link";
import { GUIAS, ogPagina } from "@/lib/contenidoPublico";
import { PaginaContenido } from "@/components/PaginaContenido";

const TITULO = "Guías para revendedores";
const DESCRIPCION =
  "Guías prácticas para ganar plata extra recomendando software en Argentina: cómo empezar, cómo ofrecerlo a un negocio y cómo facturar tus comisiones.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/guias" },
  openGraph: ogPagina({ titulo: TITULO, descripcion: DESCRIPCION, path: "/guias" }),
};

export default function GuiasPage() {
  return (
    <PaginaContenido
      eyebrow="Guías"
      titulo="Guías para revendedores"
      bajada="Cómo empezar, a quién ofrecer cada producto y cómo cobrar tus comisiones."
    >
      <div className="grid gap-4">
        {GUIAS.map((g) => (
          <Link key={g.slug} href={`/guias/${g.slug}`}
            className="block bg-white border border-[#E3E7F0] rounded-2xl p-6 no-underline hover:border-[#B8C3E6]">
            <div className="font-bold text-[19px] text-[#0C2A45]" style={{ letterSpacing: "-0.02em" }}>{g.titulo}</div>
            <p className="text-[15px] text-[#5B6577] leading-[1.55] mt-2 mb-0">{g.descripcion}</p>
            <div className="text-[14px] font-semibold text-[#1E3AA8] mt-3">Leer guía →</div>
          </Link>
        ))}
      </div>
    </PaginaContenido>
  );
}
