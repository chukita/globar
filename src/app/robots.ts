import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/panel", "/identidad", "/impersonar", "/r", "/api"],
    },
    host: "https://glob.ar",
  };
}
