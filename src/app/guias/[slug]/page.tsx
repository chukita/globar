import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getConfiguracion } from "@/lib/configuracion";
import { GUIAS, guia, ogPagina } from "@/lib/contenidoPublico";
import { Bloques, PaginaContenido } from "@/components/PaginaContenido";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = guia((await params).slug);
  if (!g) return {};
  return {
    title: g.titulo,
    description: g.descripcion,
    alternates: { canonical: `/guias/${g.slug}` },
    openGraph: ogPagina({ titulo: g.titulo, descripcion: g.descripcion, path: `/guias/${g.slug}`, tipo: "article" }),
  };
}

export default async function GuiaPage({ params }: Props) {
  const g = guia((await params).slug);
  if (!g) notFound();

  const config = await getConfiguracion();
  const bloques = g.bloques({ monto: Number(config.comisionMonto), meses: config.comisionMeses });
  const otras = GUIAS.filter((x) => x.slug !== g.slug);

  return (
    <PaginaContenido
      eyebrow="Guía para revendedores"
      titulo={g.titulo}
      bajada={g.descripcion}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: g.titulo,
        description: g.descripcion,
        datePublished: g.publicada,
        inLanguage: "es-AR",
        mainEntityOfPage: `https://glob.ar/guias/${g.slug}`,
        author: { "@id": "https://glob.ar/#organization" },
        publisher: { "@id": "https://glob.ar/#organization" },
      }}
    >
      <Bloques bloques={bloques} />

      <div className="mt-12 border-t border-[#E3E7F0] pt-8">
        <div className="text-[13px] font-bold uppercase tracking-[.08em] text-[#7C87B5] mb-3">Otras guías</div>
        <ul className="pl-0 list-none space-y-2.5 m-0">
          {otras.map((x) => (
            <li key={x.slug}>
              <Link href={`/guias/${x.slug}`} className="text-[#1E3AA8] font-semibold text-[15.5px]">{x.titulo}</Link>
            </li>
          ))}
          <li>
            <Link href="/preguntas" className="text-[#1E3AA8] font-semibold text-[15.5px]">Preguntas frecuentes</Link>
          </li>
        </ul>
      </div>
    </PaginaContenido>
  );
}
