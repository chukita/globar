import type { MetadataRoute } from "next";

const ORIGIN = "https://glob.ar";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${ORIGIN}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${ORIGIN}/revendedores`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${ORIGIN}/registro`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${ORIGIN}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${ORIGIN}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
