import { db } from "../src/db";
import { revendedores, productos, ventas, cuotas } from "../src/db/schema";

const COMISION_PCT = 0.5;
const MAX_CUOTAS   = 6;

// Fecha de hace N meses
function haceMeses(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

async function main() {
  // Buscar el primer revendedor que no sea admin
  const [rev] = await db
    .select({ id: revendedores.id, codigoVentas: revendedores.codigoVentas })
    .from(revendedores)
    .limit(1);

  if (!rev) {
    console.error("No hay revendedores en la DB. Registrate primero como revendedor.");
    process.exit(1);
  }

  const todosProductos = await db.select({ id: productos.id, nombre: productos.nombre, precioMensual: productos.precioMensual }).from(productos);
  if (todosProductos.length === 0) {
    console.error("No hay productos. Corré npm run seed:productos primero.");
    process.exit(1);
  }

  const agenda = todosProductos.find(p => p.nombre === "agendaonline")!;
  const nume   = todosProductos.find(p => p.nombre === "nume")!;

  const VENTAS_SEED = [
    // Venta de hace 4 meses — 4 cuotas ya generadas (el cliente pagó 4 veces), 2 pendientes
    { producto: agenda, cliente: "Centro Odontológico Sur",  mesesAtras: 4, cuotasPagadas: 4 },
    // Venta de hace 3 meses — 3 cuotas generadas, 3 pendientes
    { producto: nume,   cliente: "Bodegón Las Tinajas",      mesesAtras: 3, cuotasPagadas: 3 },
    // Venta de hace 2 meses — 2 cuotas generadas, 4 pendientes
    { producto: agenda, cliente: "Peluquería Bloom",         mesesAtras: 2, cuotasPagadas: 2 },
    // Venta de hace 1 mes — 1 cuota generada, 5 pendientes
    { producto: nume,   cliente: "Café Mistral",             mesesAtras: 1, cuotasPagadas: 1 },
    // Venta reciente — sin cuotas generadas aún
    { producto: agenda, cliente: "Estudio Kinesio Norte",    mesesAtras: 0, cuotasPagadas: 0 },
  ];

  for (const v of VENTAS_SEED) {
    const fechaVenta = haceMeses(v.mesesAtras);
    const precioMensual = String(v.producto.precioMensual);
    const comision = (parseFloat(precioMensual) * COMISION_PCT).toFixed(2);

    const [venta] = await db.insert(ventas).values({
      revendedorId:  rev.id,
      productoId:    v.producto.id,
      clienteNombre: v.cliente,
      precioMensual,
      vendidoEn:     fechaVenta,
    }).returning();

    // Crear 6 cuotas
    for (let i = 1; i <= MAX_CUOTAS; i++) {
      const fechaCuota = new Date(fechaVenta);
      fechaCuota.setMonth(fechaCuota.getMonth() + (i - 1));

      const status = i <= v.cuotasPagadas ? "generada" : "pendiente";

      await db.insert(cuotas).values({
        ventaId:      venta.id,
        revendedorId: rev.id,
        numeroCuota:  i,
        monto:        comision,
        periodoMes:   fechaCuota.getMonth() + 1,
        periodoAnio:  fechaCuota.getFullYear(),
        status,
        generadoEn:   status === "generada" ? new Date() : null,
        pagoExternoId: `seed-${venta.id}-${i}`,
      });
    }

    console.log(`✓ Venta: ${v.cliente} · ${v.producto.nombre} · ${v.cuotasPagadas} cuotas generadas`);
  }

  console.log(`\n✓ Seed completado para revendedor: ${rev.codigoVentas}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
