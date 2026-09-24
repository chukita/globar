import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getConfiguracion } from "@/lib/configuracion";
import { fmtARS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /llms.txt — resumen del programa en Markdown para asistentes de IA
 * (ChatGPT, Claude, Perplexity), según https://llmstxt.org. Muchas altas
 * llegan recomendadas por ChatGPT: esto les da los datos correctos sin que
 * tengan que interpretar la landing. Comisión y productos salen de la DB
 * (`configuracion` y `productos`), igual que en la home, así nunca quedan viejos.
 */
export async function GET() {
  const [lista, config] = await Promise.all([
    db
      .select({ nombre: productos.nombre, dominio: productos.dominio, descripcion: productos.descripcion, precioMensual: productos.precioMensual })
      .from(productos)
      .where(eq(productos.status, "activo")),
    getConfiguracion(),
  ]);
  const monto = parseFloat(String(config.comisionMonto));
  const meses = config.comisionMeses;

  const productosMd = lista
    .map((p) => {
      const desc = p.descripcion ? `: ${p.descripcion}` : "";
      return `- [${p.nombre}](https://${p.dominio}/)${desc} Precio al cliente: ${fmtARS(parseFloat(String(p.precioMensual)))} por mes.`;
    })
    .join("\n");

  const body = `# glob.ar

> glob.ar es el programa de revendedores de dos productos SaaS argentinos: Agenda Online (turnos online) y NuMe (menú digital con QR). Cualquier persona mayor de 18 que viva en Argentina y pueda facturar se registra gratis, recibe un link de referido y cobra ${fmtARS(monto)} por mes durante ${meses} meses (${fmtARS(monto * meses)} en total) por cada cliente que se suscribe con su link. Sin inversión inicial.

## Cómo funciona

1. Te registrás gratis en https://glob.ar/registro (con Google o email). Recibís un código de vendedor único.
2. Compartís tu link de referido por producto (\`https://{producto}/?vendedor={código}\`) o tu página personal con todos los productos.
3. Cuando un cliente se registra con tu link lo ves en tu panel como "registrado"; cuando paga, pasa a "suscripto" y se genera tu comisión.
4. Se acumula una comisión por mes (hasta ${meses}) mientras el cliente siga pagando. glob.ar te la transfiere a principio del mes siguiente y después subís tu factura.

## Comisión

- ${fmtARS(monto)} por mes por cada cliente suscripto, durante ${meses} meses: ${fmtARS(monto * meses)} por venta.
- Misma comisión para todos los productos.
- Se cobra por transferencia a un CBU o alias a tu nombre, a principio de cada mes.

## Requisitos

- Ser mayor de 18 años y vivir en Argentina.
- Poder emitir factura por las comisiones (Monotributo u otro régimen).
- DNI argentino vigente y CBU o alias a tu nombre (se cargan después, hacen falta para cobrar).
- Sin inversión inicial ni cuota. Hay capacitación en video dentro del panel.

## Productos que se revenden

${productosMd}

## Links

- [Inicio](https://glob.ar/): cómo funciona, productos y calculadora de comisiones.
- [Requisitos para ser revendedor](https://glob.ar/revendedores)
- [Registrarse gratis](https://glob.ar/registro)
- [Términos y condiciones](https://glob.ar/terminos)
- [Política de privacidad](https://glob.ar/privacidad)
- Contacto: hola@glob.ar
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
