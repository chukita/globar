import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productos } from "@/db/schema";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";
import { PRODUCTOS_LANDING, ogPagina, productoLanding } from "@/lib/contenidoPublico";
import { Bloques, ListaPreguntas, PaginaContenido, faqJsonLd } from "@/components/PaginaContenido";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ producto: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productoLanding((await params).producto);
  if (!p) return {};
  return {
    title: p.titulo,
    description: p.descripcion,
    alternates: { canonical: `/revender/${p.key}` },
    openGraph: ogPagina({ titulo: p.titulo, descripcion: p.descripcion, path: `/revender/${p.key}` }),
  };
}

/** Una página por producto: a quién ofrecerlo, por qué se vende y cuánto deja. */
export default async function RevenderProductoPage({ params }: Props) {
  const p = productoLanding((await params).producto);
  if (!p) notFound();

  const [config, [fila]] = await Promise.all([
    getConfiguracion(),
    db.select({ precioMensual: productos.precioMensual, status: productos.status }).from(productos).where(eq(productos.nombre, p.key)),
  ]);
  if (!fila || fila.status !== "activo") notFound();

  const c = { monto: Number(config.comisionMonto), meses: config.comisionMeses };
  const preguntas = p.preguntas(c);
  const otro = PRODUCTOS_LANDING.find((x) => x.key !== p.key)!;

  return (
    <PaginaContenido
      eyebrow={`Revendé ${p.nombre}`}
      titulo={`Ganá ${fmtARS(c.monto * c.meses)} por cada negocio que se suscribe a ${p.nombre}`}
      bajada={p.bajada}
      jsonLd={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "glob.ar", item: "https://glob.ar/" },
              { "@type": "ListItem", position: 2, name: `Revendé ${p.nombre}`, item: `https://glob.ar/revender/${p.key}` },
            ],
          },
          faqJsonLd(preguntas),
        ],
      }}
    >
      <div className="grid sm:grid-cols-3 gap-3 mb-10">
        <Dato titulo="Tu comisión" valor={`${fmtARS(c.monto)}/mes`} detalle={`durante ${c.meses} meses`} />
        <Dato titulo="Total por cliente" valor={fmtARS(c.monto * c.meses)} detalle="sin tope de clientes" />
        <Dato titulo="Para el negocio" valor="Plan gratis" detalle={`pagos desde ${fmtARS(Number(fila.precioMensual))}/mes`} />
      </div>

      <Bloques
        bloques={[
          { h2: "A quién ofrecérselo", lista: p.rubros },
          { h2: "Por qué se vende fácil", lista: p.porQue },
          { h2: "Planes del producto", p: [p.planes, `El negocio le paga directo a ${p.nombre}: vos no cobrás ni das soporte técnico.`] },
          { h2: "Un mensaje para arrancar", p: [p.pitch, "Mandalo con tu link de vendedor: si el negocio se registra con ese link, queda como tuyo."] },
          {
            h2: "Cómo empezar",
            lista: [
              "Registrate gratis en glob.ar y completá el video de bienvenida.",
              `En "Mis productos" copiás tu link de ${p.nombre} o descargás tu QR.`,
              "Lo compartís con los negocios que conocés, por WhatsApp o en persona.",
              "Seguís en tu panel quién se registró y quién ya se suscribió.",
            ],
          },
        ]}
      />

      <h2 className="text-[22px] font-bold mt-10 mb-4" style={{ letterSpacing: "-0.02em" }}>Preguntas sobre {p.nombre}</h2>
      <ListaPreguntas preguntas={preguntas} />

      <p className="text-[15px] text-[#5B6577] mt-8">
        Con la misma cuenta también podés revender{" "}
        <Link href={`/revender/${otro.key}`} className="text-[#1E3AA8] font-semibold">{otro.nombre}</Link>. Conocé el producto en{" "}
        <a href={`https://${p.dominio}`} target="_blank" rel="noopener noreferrer" className="text-[#1E3AA8] font-semibold">{p.dominio}</a>.
      </p>
    </PaginaContenido>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle: string }) {
  return (
    <div className="bg-white border border-[#E3E7F0] rounded-2xl p-5">
      <div className="text-[12.5px] text-[#7C87B5] font-semibold">{titulo}</div>
      <div className="text-[24px] font-extrabold text-[#1E3AA8] mt-1" style={{ letterSpacing: "-0.03em" }}>{valor}</div>
      <div className="text-[13px] text-[#5B6577] mt-0.5">{detalle}</div>
    </div>
  );
}
