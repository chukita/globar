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

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_BOTS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: "https://glob.ar/sitemap.xml",
    host: "https://glob.ar",
  };
}
