/**
 * Mail masivo a los revendedores activos avisando el aumento de comisión,
 * con sus links personales para compartir (oct. 2026).
 *
 * Por defecto NO envía nada: lista a quién le llegaría y el asunto. Para
 * mandar de verdad hay que pasar `--enviar`. En producción, dentro del
 * contenedor de la app (que ya tiene las env vars, incluida BREVO_API_KEY):
 *
 *   docker compose -f docker-compose.prod.yml exec app npx tsx scripts/aviso-aumento-comision.ts
 *   docker compose -f docker-compose.prod.yml exec app npx tsx scripts/aviso-aumento-comision.ts --enviar
 */
import { db } from "../src/db";
import { revendedores, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, emailAumentoComision, datosParaCompartir } from "../src/lib/email";

const enviar = process.argv.includes("--enviar");

async function main() {
  const destinatarios = await db
    .select({ nombre: users.name, email: users.email, codigo: revendedores.codigoVentas })
    .from(revendedores)
    .innerJoin(users, eq(users.id, revendedores.userId))
    .where(eq(revendedores.activo, true));

  console.log(`${destinatarios.length} revendedores activos${enviar ? "" : " (dry-run, agregá --enviar para mandar)"}`);

  for (const d of destinatarios) {
    const { links, comision } = await datosParaCompartir(d.codigo);
    const mail = emailAumentoComision(d.nombre ?? undefined, links, comision);
    if (!enviar) {
      console.log(`- ${d.email} (${d.codigo}) · "${mail.subject}"`);
      continue;
    }
    await sendEmail({ to: d.email, toName: d.nombre ?? undefined, subject: mail.subject, html: mail.html });
    console.log(`enviado → ${d.email}`);
    // Brevo tolera ráfagas, pero no hace falta apurarse.
    await new Promise((r) => setTimeout(r, 300));
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
