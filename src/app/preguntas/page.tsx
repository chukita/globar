import type { Metadata } from "next";
import Link from "next/link";
import { getConfiguracion } from "@/lib/configuracion";
import { preguntasFrecuentes, ogPagina } from "@/lib/contenidoPublico";
import { ListaPreguntas, PaginaContenido, faqJsonLd } from "@/components/PaginaContenido";

export const dynamic = "force-dynamic";

const TITULO = "Preguntas frecuentes sobre el programa de revendedores";
const DESCRIPCION =
  "Cuánto se gana, cómo y cuándo se cobra, qué requisitos hay y qué pasa si el cliente arranca gratis: todas las respuestas sobre ser revendedor de glob.ar.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/preguntas" },
  openGraph: ogPagina({ titulo: TITULO, descripcion: DESCRIPCION, path: "/preguntas" }),
};

export default async function PreguntasPage() {
  const config = await getConfiguracion();
  const preguntas = preguntasFrecuentes({ monto: Number(config.comisionMonto), meses: config.comisionMeses });

  return (
    <PaginaContenido
      eyebrow="Preguntas frecuentes"
      titulo="Todo sobre ser revendedor de glob.ar"
      bajada="Cuánto se gana, cómo se cobra y qué necesitás. Si te queda alguna duda, escribinos a hola@glob.ar."
      jsonLd={{ "@context": "https://schema.org", ...faqJsonLd(preguntas) }}
    >
      <ListaPreguntas preguntas={preguntas} />
      <p className="text-[15px] text-[#5B6577] mt-8">
        ¿Querés ver cómo vender cada producto? Mirá{" "}
        <Link href="/revender/agendaonline" className="text-[#1E3AA8] font-semibold">Agenda Online</Link> y{" "}
        <Link href="/revender/nume" className="text-[#1E3AA8] font-semibold">NuMe</Link>, o las{" "}
        <Link href="/guias" className="text-[#1E3AA8] font-semibold">guías para revendedores</Link>.
      </p>
    </PaginaContenido>
  );
}
