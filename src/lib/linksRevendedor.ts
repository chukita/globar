import { db } from "@/db";
import { productos } from "@/db/schema";
import { eq } from "drizzle-orm";

export type LinkProducto = { nombre: string; dominio: string; url: string };
export type LinksRevendedor = { general: string; productos: LinkProducto[] };

/**
 * Links de referido del revendedor, armados igual que en /panel/productos:
 * uno por producto activo (`urlRegistro?vendedor=CODIGO`) y el general
 * (`/r/CODIGO`). Lo usan los mails que llevan los links para compartir.
 */
export async function getLinksRevendedor(codigoVentas: string): Promise<LinksRevendedor> {
  const lista = await db
    .select({ nombre: productos.nombre, dominio: productos.dominio, urlRegistro: productos.urlRegistro })
    .from(productos)
    .where(eq(productos.status, "activo"));

  return {
    general: `${process.env.AUTH_URL || "http://localhost:3000"}/r/${codigoVentas}`,
    productos: lista.map((p) => ({
      nombre: p.nombre,
      dominio: p.dominio,
      url: `${p.urlRegistro}?vendedor=${codigoVentas}`,
    })),
  };
}
