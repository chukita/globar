import { db } from "../src/db";
import { productos } from "../src/db/schema";
import { eq } from "drizzle-orm";

const PRODUCTOS = [
  {
    nombre:        "agendaonline",
    dominio:       "agendaonline.com.ar",
    urlRegistro:   "https://agendaonline.com.ar/register",
    tag:           "Turnos & reservas",
    descripcion:   "Sistema de turnos y reservas online para profesionales, clínicas, estudios y cualquier negocio que gestione citas. Permite a los clientes sacar turnos 24/7 desde el celular.",
    precioMensual: "6900",
  },
  {
    nombre:        "nume",
    dominio:       "nume.com.ar",
    urlRegistro:   "https://nume.com.ar/admin",
    tag:           "Carta digital & menú QR",
    descripcion:   "Carta digital con código QR para bares, restaurantes y cafeterías. Tus clientes escanean el QR y ven el menú actualizado desde el celular, sin app. El dueño edita precios y productos desde cualquier lugar.",
    precioMensual: "6900",
  },
];

async function main() {
  for (const p of PRODUCTOS) {
    const [existing] = await db.select({ id: productos.id }).from(productos).where(eq(productos.nombre, p.nombre)).limit(1);
    if (existing) {
      console.log(`✓ Ya existe: ${p.nombre}`);
      continue;
    }
    await db.insert(productos).values({ ...p, status: "activo" });
    console.log(`✓ Creado: ${p.nombre}`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
