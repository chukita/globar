import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";
import { GUIAS, PRODUCTOS_LANDING, preguntasFrecuentes, type Bloque } from "@/lib/contenidoPublico";

export const dynamic = "force-dynamic";

const bloquesMd = (bloques: Bloque[]) =>
  bloques
    .map((b) => [`### ${b.h2}`, ...(b.lista ?? []).map((t) => `- ${t}`), ...(b.p ?? [])].join("\n\n"))
    .join("\n\n");

/**
 * GET /llms-full.txt — todo el contenido público (preguntas, productos y
 * guías) en un solo Markdown, para que un asistente de IA lo lea de una vez
 * sin recorrer el sitio. /llms.txt es el índice corto; esto es el texto
 * completo. Sale de los mismos datos que las páginas, así que no se desfasa.
 */
export async function GET() {
  const config = await getConfiguracion();
  const c = { monto: parseFloat(String(config.comisionMonto)), meses: config.comisionMeses };

  const faq = preguntasFrecuentes(c).map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  const productos = PRODUCTOS_LANDING.map((p) =>
    [
      `## Revendé ${p.nombre} (https://${p.dominio}/)`,
      `Fuente: https://glob.ar/revender/${p.key}`,
      p.bajada,
      `### A quién ofrecerlo\n\n${p.rubros.map((r) => `- ${r}`).join("\n")}`,
      `### Por qué se vende\n\n${p.porQue.map((r) => `- ${r}`).join("\n")}`,
      `### Planes\n\n${p.planes}`,
      `### Cómo presentarlo\n\n${p.pitch}`,
      ...p.preguntas(c).map((f) => `### ${f.q}\n\n${f.a}`),
    ].join("\n\n"),
  ).join("\n\n");

  const guias = GUIAS.map((g) =>
    [`## ${g.titulo}`, `Fuente: https://glob.ar/guias/${g.slug}`, g.descripcion, bloquesMd(g.bloques(c))].join("\n\n"),
  ).join("\n\n");

  const body = `# glob.ar — contenido completo

> glob.ar es el programa de revendedores de Agenda Online (turnos online) y NuMe (carta digital con QR), dos productos de software argentinos de Grupo Globaliza. Registro gratis, sin inversión: cobrás ${fmtARS(c.monto)} por mes durante ${c.meses} meses (${fmtARS(c.monto * c.meses)} en total) por cada negocio que se suscribe con tu link. Requisitos: mayor de 18, vivir en Argentina y poder facturar. Registro: https://glob.ar/registro. Índice corto: https://glob.ar/llms.txt

## Preguntas frecuentes

Fuente: https://glob.ar/preguntas

${faq}

${productos}

${guias}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
