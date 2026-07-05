import { fmtARS, COMMISSION_PER_MONTH } from "./constants";

export const MOCK_REVENDEDORES = [
  { id: "r1", nombre: "Martina Quiroga",   email: "martina.quiroga@gmail.com",  zona: "Córdoba Capital", codigo: "GLOBMQ-7K2", activo: true,  ventas: 6, ingreso: COMMISSION_PER_MONTH * 13 },
  { id: "r2", nombre: "Pablo Fernández",   email: "pablo.fernandez@gmail.com",  zona: "Rosario",         codigo: "GLOBPF-3R8", activo: true,  ventas: 3, ingreso: COMMISSION_PER_MONTH * 5  },
  { id: "r3", nombre: "Laura Sánchez",     email: "laura.sanchez@gmail.com",    zona: "CABA",            codigo: "GLOBLS-9M1", activo: false, ventas: 1, ingreso: COMMISSION_PER_MONTH * 3  },
];

export const MOCK_VENTAS = [
  { id: "v1", revendedor: "Martina Quiroga", producto: "agendaonline", cliente: "Centro Odontológico Sur", precio: 9000, fecha: "21 May 2026", activa: true  },
  { id: "v2", revendedor: "Martina Quiroga", producto: "nume",         cliente: "Bodegón Las Tinajas",     precio: 9000, fecha: "12 Jun 2026", activa: true  },
  { id: "v3", revendedor: "Martina Quiroga", producto: "agendaonline", cliente: "Estudio Kinesio Norte",   precio: 9000, fecha: "04 Jun 2026", activa: true  },
  { id: "v4", revendedor: "Pablo Fernández", producto: "agendaonline", cliente: "Peluquería Bloom",        precio: 9000, fecha: "18 Abr 2026", activa: true  },
  { id: "v5", revendedor: "Pablo Fernández", producto: "nume",         cliente: "Café Mistral",            precio: 9000, fecha: "09 May 2026", activa: true  },
  { id: "v6", revendedor: "Laura Sánchez",   producto: "agendaonline", cliente: "Consultorio Dra. Pérez",  precio: 9000, fecha: "10 Mar 2026", activa: false },
];

const CM = COMMISSION_PER_MONTH; // 50% de $9000 = $4500
export const MOCK_CUOTAS = [
  // Martina — venta v1
  { id:"c1",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:1, mes:"Jun 2026", monto:CM, status:"pagada"   },
  { id:"c2",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:2, mes:"Jul 2026", monto:CM, status:"facturada" },
  { id:"c3",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:3, mes:"Ago 2026", monto:CM, status:"generada"  },
  { id:"c4",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:4, mes:"Sep 2026", monto:CM, status:"pendiente" },
  { id:"c5",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:5, mes:"Oct 2026", monto:CM, status:"pendiente" },
  { id:"c6",  ventaId:"v1", revendedor:"Martina Quiroga", producto:"agendaonline", cliente:"Centro Odontológico Sur", cuota:6, mes:"Nov 2026", monto:CM, status:"pendiente" },
  // Martina — venta v2
  { id:"c7",  ventaId:"v2", revendedor:"Martina Quiroga", producto:"nume",         cliente:"Bodegón Las Tinajas",     cuota:1, mes:"Jul 2026", monto:CM, status:"facturada" },
  { id:"c8",  ventaId:"v2", revendedor:"Martina Quiroga", producto:"nume",         cliente:"Bodegón Las Tinajas",     cuota:2, mes:"Ago 2026", monto:CM, status:"generada"  },
  { id:"c9",  ventaId:"v2", revendedor:"Martina Quiroga", producto:"nume",         cliente:"Bodegón Las Tinajas",     cuota:3, mes:"Sep 2026", monto:CM, status:"pendiente" },
  // Pablo — venta v4
  { id:"c10", ventaId:"v4", revendedor:"Pablo Fernández", producto:"agendaonline", cliente:"Peluquería Bloom",        cuota:1, mes:"May 2026", monto:CM, status:"pagada"    },
  { id:"c11", ventaId:"v4", revendedor:"Pablo Fernández", producto:"agendaonline", cliente:"Peluquería Bloom",        cuota:2, mes:"Jun 2026", monto:CM, status:"pagada"    },
  { id:"c12", ventaId:"v4", revendedor:"Pablo Fernández", producto:"agendaonline", cliente:"Peluquería Bloom",        cuota:3, mes:"Jul 2026", monto:CM, status:"generada"  },
];

export const MOCK_FACTURAS = [
  { id:"f1", revendedor:"Martina Quiroga", monto: CM*2, cuotas:2, subida:"28 Jun 2026", archivo:"factura_junio_mq.pdf", pagada: false, nota:"Cuotas junio y julio agendaonline"   },
  { id:"f2", revendedor:"Martina Quiroga", monto: CM,   cuotas:1, subida:"29 Jun 2026", archivo:"factura_julio_nume.pdf", pagada: false, nota:"Cuota julio nume"                   },
  { id:"f3", revendedor:"Pablo Fernández", monto: CM*2, cuotas:2, subida:"15 Jun 2026", archivo:"factura_pf_mayo.pdf",  pagada: true,  nota:"Cuotas mayo y junio agendaonline" },
];

// Totales para el dashboard
export const MOCK_TOTALS = {
  ventasTotales: MOCK_VENTAS.length,
  revendedoresActivos: MOCK_REVENDEDORES.filter(r => r.activo).length,
  comisionesPagadas: fmtARS(CM * 5),
  facturasPendientes: MOCK_FACTURAS.filter(f => !f.pagada).length,
  comisionesPorPagar: fmtARS(MOCK_FACTURAS.filter(f => !f.pagada).reduce((s, f) => s + f.monto, 0)),
};
