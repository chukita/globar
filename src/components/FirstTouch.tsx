"use client";

import { useEffect } from "react";
import { FIRST_TOUCH_COOKIE, FIRST_TOUCH_MAX_AGE_S, type SignupSource } from "@/lib/signupSource";

/**
 * Guarda de dónde llegó el visitante la PRIMERA vez (first touch) en una
 * cookie, para atribuir el alta del revendedor (ver lib/signupSource.ts).
 * Cookie y no localStorage porque el alta por Google se resuelve en el
 * servidor, en el callback del OAuth. Vence a los 30 días para que una visita
 * vieja no atribuya un alta de hoy. No corre en los paneles: ahí entra gente
 * que ya tiene cuenta.
 */
export function FirstTouch() {
  useEffect(() => {
    try {
      const { pathname, search, host } = window.location;
      if (/^\/(panel|admin|impersonar)(\/|$)/.test(pathname)) return;
      if (document.cookie.split("; ").some((c) => c.startsWith(`${FIRST_TOUCH_COOKIE}=`))) return;

      const params = new URLSearchParams(search);
      const touch: SignupSource = { landing: pathname.slice(0, 120) };

      try {
        const refHost = document.referrer ? new URL(document.referrer).host : "";
        if (refHost && refHost !== host) touch.referrerHost = refHost.slice(0, 100);
      } catch {
        /* referrer inválido: se ignora */
      }

      const utmSource = params.get("utm_source")?.trim();
      const utmMedium = params.get("utm_medium")?.trim();
      const utmCampaign = params.get("utm_campaign")?.trim();
      if (utmSource) touch.utmSource = utmSource.slice(0, 60);
      if (utmMedium) touch.utmMedium = utmMedium.slice(0, 60);
      if (utmCampaign) touch.utmCampaign = utmCampaign.slice(0, 100);

      if (params.has("gclid") || params.has("gbraid") || params.has("wbraid")) touch.paid = "google";
      else if (params.has("fbclid")) touch.paid = "meta";

      const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie =
        `${FIRST_TOUCH_COOKIE}=${encodeURIComponent(JSON.stringify(touch))}` +
        `; Max-Age=${FIRST_TOUCH_MAX_AGE_S}; Path=/; SameSite=Lax${secure}`;
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
