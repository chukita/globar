import { db } from "../src/db";
import { productos } from "../src/db/schema";
import { eq } from "drizzle-orm";

const PRODUCTOS = [
  {
    nombre: "agendaonline",
    dominio: "agendaonline.com.ar",
    tag: "Turnos & reservas",
    descripcion: "Sistema de reservas y gestión de turnos para profesionales, estudios y clínicas.",
    precioMensual: "9000",
  },
  {
    nombre: "nume",
    dominio: "nume.com.ar",
    tag: "Gastronomía",
    descripcion: "Carta digital para restaurantes con gestión de menú y precios en tiempo real.",
    precioMensual: "9000",
  },
];

async function main() {
  for (const p of PRODUCTOS) {
    const [existing] = await db.select().from(productos).where(eq(productos.nombre, p.nombre)).limit(1);
    if (existing) {
      console.log(`✓ Producto ya existe: ${p.nombre}`);
      continue;
    }
    await db.insert(productos).values(p);
    console.log(`✓ Producto creado: ${p.nombre}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
