import type { MetadataRoute } from "next";
import { GUIAS, PRODUCTOS_LANDING } from "@/lib/contenidoPublico";

const ORIGIN = "https://glob.ar";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${ORIGIN}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${ORIGIN}/revendedores`, changeFrequency: "monthly", priority: 0.9 },
    ...PRODUCTOS_LANDING.map((p) => ({
      url: `${ORIGIN}/revender/${p.key}`,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${ORIGIN}/preguntas`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ORIGIN}/registro`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ORIGIN}/guias`, changeFrequency: "weekly", priority: 0.7 },
    ...GUIAS.map((g) => ({
      url: `${ORIGIN}/guias/${g.slug}`,
      lastModified: g.publicada,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${ORIGIN}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${ORIGIN}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
