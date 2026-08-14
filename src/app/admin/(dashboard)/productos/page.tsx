import { db } from "@/db";
import { productos } from "@/db/schema";
import { ProductosAdminClient } from "@/components/ProductosAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminProductosPage() {
  const lista = await db.select().from(productos).orderBy(productos.nombre);
  return <ProductosAdminClient productosIniciales={lista} />;
}
