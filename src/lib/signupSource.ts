/**
 * Origen de un alta de revendedor ("first touch"): por dónde entró el
 * visitante la primera vez y de dónde venía. Lo captura el navegador
 * (`components/FirstTouch.tsx`) en la cookie `FIRST_TOUCH_COOKIE`, y el alta
 * la lee del lado del servidor — tanto por email (`/api/registro`) como por
 * Google (`ensureRevendedor`, que no puede recibir un body porque pasa por el
 * OAuth). Mismo formato y clasificación que agendaonline
 * (`server/src/signupSource.ts`) y nume (`backend/src/lib/signupSource.js`).
 *
 * Es un dato de atribución, nunca bloquea un registro: lo que llegue mal
 * formado se descarta.
 *
 * Privacidad: solo el HOST del referer (sin ruta ni query), la ruta de
 * entrada SIN query string, y UTM acotados. No se guardan ids de click
 * (gclid/fbclid) — apenas si vino de un anuncio de Google o de Meta.
 */
export type SignupSource = {
  /** Ruta por la que entró (sin query), ej. `/revendedores`. */
  landing?: string;
  /** Host del sitio de origen, ej. `chatgpt.com`, `www.google.com`. */
  referrerHost?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  /** Vino de un anuncio pago (gclid / fbclid en la URL de entrada). */
  paid?: "google" | "meta";
};

export const FIRST_TOUCH_COOKIE = "globar_ft";
export const FIRST_TOUCH_MAX_AGE_S = 30 * 24 * 60 * 60;

const clip = (v: unknown, max: number): string | undefined => {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, max);
  return t === "" ? undefined : t;
};

/** Deja solo campos conocidos, acotados. Devuelve `undefined` si no queda nada útil. */
export function sanitizeSignupSource(v: unknown): SignupSource | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  const out: SignupSource = {};

  const landing = clip(o.landing, 120);
  if (landing && landing.startsWith("/")) out.landing = landing.split(/[?#]/)[0];

  const host = clip(o.referrerHost, 100)?.toLowerCase();
  if (host && /^[a-z0-9.-]+$/.test(host)) out.referrerHost = host;

  const utmSource = clip(o.utmSource, 60);
  if (utmSource) out.utmSource = utmSource;
  const utmMedium = clip(o.utmMedium, 60);
  if (utmMedium) out.utmMedium = utmMedium;
  const utmCampaign = clip(o.utmCampaign, 100);
  if (utmCampaign) out.utmCampaign = utmCampaign;

  if (o.paid === "google" || o.paid === "meta") out.paid = o.paid;

  return Object.keys(out).length > 0 ? out : undefined;
}

/** Parsea el valor crudo de la cookie de first touch. */
export function parseSignupSourceCookie(raw: string | undefined): SignupSource | undefined {
  if (!raw) return undefined;
  try {
    return sanitizeSignupSource(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return undefined;
  }
}

// Asistentes de IA. Van antes que Google para que gemini.google.com no caiga
// en "Google (orgánico)".
const AI_HOSTS: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)claude\.ai$/, "Claude"],
  [/(^|\.)gemini\.google\.com$/, "Gemini"],
  [/(^|\.)copilot\.microsoft\.com$/, "Copilot"],
];

const SOCIAL_HOSTS: [RegExp, string][] = [
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/, "Facebook"],
  [/(^|\.)whatsapp\.com$|(^|\.)wa\.me$/, "WhatsApp"],
  [/(^|\.)tiktok\.com$/, "TikTok"],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, "YouTube"],
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, "X / Twitter"],
];

/**
 * Canal legible de un alta, para el dashboard del superadmin. Prioridad:
 * anuncio pago, UTM explícito, referer, y "Directo" si entró sin referer.
 * Los revendedores anteriores a esta captura quedan como "Sin dato".
 */
export function classifySignupChannel(source: SignupSource | null | undefined): string {
  if (!source) return "Sin dato";
  if (source.paid === "google") return "Google Ads";
  if (source.paid === "meta") return "Meta Ads";
  if (source.utmSource) {
    const s = source.utmSource.toLowerCase();
    // ChatGPT y otros asistentes agregan utm_source=chatgpt.com a sus links.
    for (const [re, name] of AI_HOSTS) if (re.test(s)) return name;
    const medium = source.utmMedium?.toLowerCase() ?? "";
    if (/(cpc|paid|ads|ppc)/.test(medium)) return `${source.utmSource} (pago)`;
    return `${s.charAt(0).toUpperCase()}${s.slice(1)} (campaña)`;
  }
  const host = source.referrerHost;
  if (!host) return "Directo";
  for (const [re, name] of AI_HOSTS) if (re.test(host)) return name;
  if (/(^|\.)google\./.test(host)) return "Google (orgánico)";
  if (/(^|\.)(bing|duckduckgo|yahoo|ecosia)\./.test(host)) return "Otros buscadores";
  for (const [re, name] of SOCIAL_HOSTS) if (re.test(host)) return name;
  if (/(^|\.)glob\.ar$/.test(host)) return "Directo";
  if (/(^|\.)agendaonline\.com\.ar$/.test(host)) return "agendaonline";
  if (/(^|\.)nume\.com\.ar$/.test(host)) return "nume";
  return `Otro sitio (${host})`;
}
