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
export async function sendEmail({ to, toName, subject, html, replyTo }: { to: string; toName?: string; subject: string; html: string; replyTo?: string }) {
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
        replyTo: { email: replyTo || "hola@glob.ar" },
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

/** Avisa a todos los destinatarios configurados en /admin/configuracion, si ese tipo de evento está habilitado. */
export async function notifyAdmins(subject: string, html: string, tipo: "revendedorNuevo" | "facturaSubida") {
  const config = await getConfiguracion();

  const habilitado = tipo === "revendedorNuevo" ? config.notifRevendedorNuevo : config.notifFacturaSubida;
  if (!habilitado) return;

  const destinatarios = (config.notifAdminEmails ?? "")
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
    subject: "Se registró un nuevo revendedor",
    html: wrapHtml("Nuevo revendedor en glob.ar", `
      <p><strong>${nombre}</strong> (${email}) confirmó su email y se registró como revendedor.</p>
      <p>Podés ver sus datos en el panel de superadmin, sección Revendedores.</p>
    `),
  };
}

export function emailVerificarCuenta(codigo: string, verifyUrl: string) {
  return {
    subject: "Confirmá tu cuenta — glob.ar",
    html: wrapHtml("Confirmá tu cuenta", `
      <p>Para activar tu cuenta de revendedor, confirmá tu email:</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="${verifyUrl}" style="display:inline-block; background:#0E6BA8; color:#fff; text-decoration:none; font-weight:700; font-size:14.5px; padding:12px 28px; border-radius:10px;">Confirmar mi cuenta</a>
      </p>
      <p style="font-size:13px; color:#5B6577;">Si el botón no funciona, entrá a <a href="${verifyUrl}" style="color:#0E6BA8;">este enlace</a>.</p>
      <p style="margin-top:20px;">También podés ingresar este código en la página de verificación:</p>
      <p style="text-align:center; font-family: ui-monospace, monospace; font-size:26px; font-weight:800; letter-spacing:0.2em; color:#0C2A45;">${codigo}</p>
      <p style="font-size:12px; color:#9AA3B2; margin-top:20px;">El código vence en 15 minutos, el enlace en 24 horas. Si no creaste esta cuenta, ignorá este mensaje.</p>
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

export function emailCuentaActivada() {
  return {
    subject: "Tu cuenta de revendedor está activa",
    html: wrapHtml("¡Tu cuenta está activa!", `
      <p>Tu cuenta de revendedor en glob.ar fue activada — ya podés generar ventas y cobrar comisiones con normalidad.</p>
      <p>Cualquier duda, escribinos a <strong>hola@glob.ar</strong>.</p>
    `),
  };
}

export function emailCuentaDesactivada() {
  return {
    subject: "Tu cuenta de revendedor fue desactivada",
    html: wrapHtml("Tu cuenta fue desactivada", `
      <p>Tu cuenta de revendedor en glob.ar fue desactivada por el equipo de glob.ar. Mientras esté así, no vas a poder generar nuevas ventas ni comisiones.</p>
      <p>Si tenés dudas o creés que es un error, escribinos a <strong>hola@glob.ar</strong>.</p>
    `),
  };
}

export function emailRespuestaContacto(mensaje: string) {
  return {
    subject: "Re: tu consulta a glob.ar",
    html: wrapHtml("Respuesta a tu consulta", `
      <p style="white-space:pre-wrap;">${mensaje}</p>
      <p style="margin-top:20px;">— Equipo glob.ar</p>
    `),
  };
}

export function emailMensajeRevendedor(asunto: string, mensaje: string) {
  return {
    subject: asunto,
    html: wrapHtml(asunto, `
      <p style="white-space:pre-wrap;">${mensaje}</p>
      <p style="margin-top:20px;">— Equipo glob.ar</p>
    `),
  };
}

export function emailContacto(nombre: string, email: string, mensaje: string) {
  return {
    subject: `Nuevo mensaje de contacto de ${nombre}`,
    html: wrapHtml("Nuevo mensaje desde la landing", `
      <p><strong>${nombre}</strong> (${email}) escribió desde el formulario de contacto:</p>
      <p style="background:#F7F8FA; border-radius:10px; padding:14px 16px; white-space:pre-wrap;">${mensaje}</p>
    `),
  };
}
