import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import type { Bloque } from "@/lib/contenidoPublico";

/**
 * Esqueleto de las páginas de contenido públicas (/preguntas, /revender/*,
 * /guias/*): mismo fondo y ancho de lectura que /terminos, con el JSON-LD de
 * la página y un cierre que lleva al registro.
 */
export function PaginaContenido({
  eyebrow,
  titulo,
  bajada,
  jsonLd,
  children,
}: {
  eyebrow: string;
  titulo: string;
  bajada?: string;
  jsonLd?: object;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0C2A45]">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <PublicNav />
      <div className="max-w-[780px] mx-auto px-4 sm:px-8 pt-12 pb-6">
        <div className="text-[13px] font-bold uppercase tracking-[.08em] text-[#3B4FB8]">{eyebrow}</div>
        <h1 className="font-extrabold text-[30px] sm:text-[40px] leading-[1.08] mt-3 mb-0" style={{ letterSpacing: "-0.03em", textWrap: "balance" }}>
          {titulo}
        </h1>
        {bajada && <p className="text-[17px] leading-[1.6] text-[#5B6577] mt-4 mb-0">{bajada}</p>}
        <div className="mt-10">{children}</div>
      </div>
      <CierreRegistro />
      <Footer />
    </div>
  );
}

export function Bloques({ bloques }: { bloques: Bloque[] }) {
  return (
    <div className="space-y-9 text-[16px] leading-[1.7] text-[#3F4A5A]">
      {bloques.map((b) => (
        <section key={b.h2}>
          <h2 className="text-[22px] font-bold text-[#0C2A45] mb-3 mt-0" style={{ letterSpacing: "-0.02em" }}>{b.h2}</h2>
          {b.lista && (
            <ul className="pl-5 my-3 space-y-2 list-disc marker:text-[#3B4FB8]">
              {b.lista.map((t) => <li key={t}>{t}</li>)}
            </ul>
          )}
          {/* Con lista, los párrafos van después (cierre o aclaración). */}
          {b.p?.map((t) => <p key={t} className="my-3">{t}</p>)}
        </section>
      ))}
    </div>
  );
}

export function ListaPreguntas({ preguntas }: { preguntas: { q: string; a: string }[] }) {
  return (
    <div className="grid gap-3">
      {preguntas.map((f) => (
        <details key={f.q} className="bg-white border border-[#E3E7F0] rounded-2xl px-[22px] py-[18px]">
          <summary className="font-bold text-[17px] cursor-pointer">{f.q}</summary>
          <p className="text-[15.5px] leading-[1.6] text-[#4A5578] mt-3 mb-0">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function faqJsonLd(preguntas: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: preguntas.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function CierreRegistro() {
  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-8 py-12">
      <div className="bg-[#1E3AA8] rounded-[24px] px-6 py-8 sm:px-10 sm:py-10">
        <h2 className="font-extrabold text-[24px] sm:text-[28px] text-white m-0" style={{ letterSpacing: "-0.025em" }}>
          Empezá a ganar comisiones
        </h2>
        <p className="text-[16px] text-[#DCEAF4] mt-2 mb-6">
          Registrate gratis, obtené tu link y compartilo hoy mismo. Sin inversión.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/registro" className="font-semibold text-[15px] bg-white text-[#1E3AA8] rounded-full px-6 py-3.5 no-underline">
            Crear mi cuenta gratis
          </Link>
          <Link href="/revendedores" className="font-semibold text-[15px] text-white rounded-full border border-white/40 px-6 py-3.5 no-underline">
            Ver requisitos
          </Link>
        </div>
      </div>
    </div>
  );
}
