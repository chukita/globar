import type { MetadataRoute } from "next";

const DISALLOW = ["/admin", "/panel", "/identidad", "/impersonar", "/r/", "/api/", "/recuperar"];

// Asistentes de IA (entrenamiento, búsqueda y navegación a pedido del
// usuario): buena parte de las altas llegan desde ChatGPT y similares, así que
// se los habilita explícitamente. Un bot con grupo propio ignora el de "*",
// por eso cada grupo repite los disallow.
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-SearchBot", "Claude-User",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "Bingbot",
];

// Se evalúa en cada request (no en el build): la misma imagen corre en
// producción y en test.glob.ar, y test no tiene que indexarse.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const esProduccion = (process.env.AUTH_URL ?? "https://glob.ar").replace(/\/$/, "") === "https://glob.ar";
  if (!esProduccion) return { rules: [{ userAgent: "*", disallow: "/" }] };

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://glob.ar/sitemap.xml",
    host: "https://glob.ar",
  };
}
