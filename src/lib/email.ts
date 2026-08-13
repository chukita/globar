import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER = { name: "glob.ar", email: "notificaciones@glob.ar" };

function wrapHtml(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: 'Open Sans', system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #0C2A45;">
      <div style="background: #0E6BA8; border-radius: 14px; padding: 18px 24px; margin-bottom: 20px;">
        <span style="font-weight: 800; font-size: 20px; color: #fff;">glob<span style="color:#7FB4DC">.ar</span></span>
      </div>
      <h2 style="font-size: 19px; margin: 0 0 12px;">${title}</h2>
      <div style="font-size: 14.5px; line-height: 1.6; color: #3F4A5A;">${bodyHtml}</div>
      <p style="font-size: 12px; color: #9AA3B2; margin-top: 28px;">glob.ar — programa de revendedores</p>
    </div>
  `;
}

/** Envío best-effort a la API transaccional de Brevo — nunca tira, solo loguea. */
export async function sendEmail({ to, toName, subject, html }: { to: string; toName?: string; subject: string; html: string }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[email] BREVO_API_KEY no configurada, no se envía:", subject, "→", to);
    return;
  }
  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        sender: SENDER,
        replyTo: { email: "legal@glob.ar" },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[email] Brevo respondió", res.status, "para", to, text.slice(0, 500));
    }
  } catch (e) {
    console.error("[email] error enviando a", to, e instanceof Error ? e.message : e);
  }
}

/** Avisa a todos los destinatarios configurados en /admin/configuracion. */
export async function notifyAdmins(subject: string, html: string) {
  const { notifAdminEmails } = await getConfiguracion();
  const destinatarios = (notifAdminEmails ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (destinatarios.length === 0) {
    console.warn("[email] no hay destinatarios de admin configurados, no se avisa:", subject);
    return;
  }

  await Promise.all(destinatarios.map((to) => sendEmail({ to, subject, html })));
}

export function emailFacturaPagada(monto: number) {
  return {
    subject: "Tu factura fue marcada como pagada",
    html: wrapHtml("¡Tu factura ya está pagada!", `
      <p>Te confirmamos que tu factura por <strong>${fmtARS(monto)}</strong> fue marcada como pagada por el equipo de glob.ar.</p>
      <p>Podés ver el detalle en tu panel, sección Facturas.</p>
    `),
  };
}

export function emailComisionGenerada(monto: number, numeroCuota: number, comisionMeses: number) {
  return {
    subject: "Se generó una nueva cuota de comisión",
    html: wrapHtml("Nueva cuota de comisión disponible", `
      <p>Se generó la cuota <strong>${numeroCuota} de ${comisionMeses}</strong> de una de tus comisiones, por <strong>${fmtARS(monto)}</strong>.</p>
      <p>Ya podés subir la factura correspondiente desde tu panel para cobrarla.</p>
    `),
  };
}

export function emailRevendedorNuevo(nombre: string, email: string) {
  return {
    subject: "Nuevo revendedor completó su perfil",
    html: wrapHtml("Nuevo revendedor en glob.ar", `
      <p><strong>${nombre}</strong> (${email}) completó su perfil de revendedor.</p>
      <p>Podés ver sus datos completos en el panel de superadmin, sección Revendedores.</p>
    `),
  };
}

export function emailFacturaSubida(revendedorNombre: string, codigoVentas: string, monto: number) {
  return {
    subject: "Nueva factura subida por un revendedor",
    html: wrapHtml("Nueva factura para revisar", `
      <p><strong>${revendedorNombre}</strong> (${codigoVentas}) subió una factura por <strong>${fmtARS(monto)}</strong>.</p>
      <p>Podés revisarla y marcarla como pagada desde el panel de superadmin, sección Facturas.</p>
    `),
  };
}
