import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  pgEnum,
  primaryKey,
  check,
  unique,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["superadmin", "revendedor"]);

// Estado de una cuota de comisión en el ciclo de cobro
export const cuotaStatusEnum = pgEnum("cuota_status", [
  "pendiente",   // el cliente aún no pagó este mes
  "generada",    // el cliente pagó → cuota disponible para facturar
  "facturada",   // el revendedor subió la factura
  "pagada",      // el superadmin realizó la transferencia
  "anulada",     // el cliente ejerció derecho de arrepentimiento (baja + reembolso dentro de los 10 días) — solo si seguía "generada"
]);

export const productoStatusEnum = pgEnum("producto_status", [
  "activo",
  "inactivo",
]);

// ─── NextAuth tables (required by @auth/drizzle-adapter) ──────────────────────

export const users = pgTable("users", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:          text("name"),
  email:         text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image:         text("image"),
  password:      text("password"),  // hashed, null for OAuth users
  role:          roleEnum("role").notNull().default("revendedor"),
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  userId:            text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:              text("type").notNull(),
  provider:          text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token:     text("refresh_token"),
  access_token:      text("access_token"),
  expires_at:        integer("expires_at"),
  token_type:        text("token_type"),
  scope:             text("scope"),
  id_token:          text("id_token"),
  session_state:     text("session_state"),
}, (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId:       text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires:      timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token:      text("token").notNull(),
  expires:    timestamp("expires", { mode: "date" }).notNull(),
}, (t) => [primaryKey({ columns: [t.identifier, t.token] })]);

// ─── Revendedores ─────────────────────────────────────────────────────────────

export const revendedores = pgTable("revendedores", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:         text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  codigoVentas:   text("codigo_ventas").notNull().unique(),
  zona:           text("zona"),
  pais:           text("pais").default("Argentina"),
  provincia:      text("provincia"),
  localidad:      text("localidad"),
  dni:            text("dni"),
  fechaNacimiento: text("fecha_nacimiento"),   // ISO date string YYYY-MM-DD
  puedeFacturar:  boolean("puede_facturar").notNull().default(false),
  cbu:            text("cbu"),
  activo:         boolean("activo").notNull().default(true),
  creadoEn:       timestamp("creado_en").defaultNow().notNull(),
});

// ─── Productos ────────────────────────────────────────────────────────────────

export const productos = pgTable("productos", {
  id:              text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre:          text("nombre").notNull(),
  dominio:         text("dominio").notNull(),           // "agendaonline.com.ar"
  urlRegistro:     text("url_registro").notNull(),      // URL donde el cliente se registra
  tag:             text("tag").notNull(),
  descripcion:     text("descripcion"),
  precioMensual:   numeric("precio_mensual", { precision: 12, scale: 2 }).notNull(),
  status:          productoStatusEnum("status").notNull().default("activo"),
  creadoEn:        timestamp("creado_en").defaultNow().notNull(),
});

// ─── Habilitaciones (revendedor ↔ producto) ───────────────────────────────────

export const habilitaciones = pgTable("habilitaciones", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  revendedorId:  text("revendedor_id").notNull().references(() => revendedores.id, { onDelete: "cascade" }),
  productoId:    text("producto_id").notNull().references(() => productos.id, { onDelete: "cascade" }),
  habilitadoEn:  timestamp("habilitado_en").defaultNow().notNull(),
}, (t) => [unique().on(t.revendedorId, t.productoId)]);

// ─── Ventas ───────────────────────────────────────────────────────────────────

export const ventas = pgTable("ventas", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  revendedorId:   text("revendedor_id").references(() => revendedores.id),  // null si no hay revendedor
  productoId:     text("producto_id").notNull().references(() => productos.id),
  clienteNombre:  text("cliente_nombre").notNull(),
  clienteEmail:   text("cliente_email"),
  // precio al momento de la venta (puede cambiar en el futuro)
  precioMensual:  numeric("precio_mensual", { precision: 12, scale: 2 }).notNull(),
  vendidoEn:      timestamp("vendido_en").defaultNow().notNull(),
  // Se actualiza en cada webhook de pago recibido para esta venta, incluso
  // después de agotar las cuotas de comisión (el webhook sigue llegando
  // igual todos los meses) — es la única señal real de si el cliente sigue
  // pagando. Se deriva "activa" comparando contra esto, no hay ningún
  // webhook de "se dio de baja" que lo actualice directamente.
  ultimoPagoEn:   timestamp("ultimo_pago_en").defaultNow().notNull(),
  activa:         boolean("activa").notNull().default(true),
});

// ─── Cuotas de comisión ───────────────────────────────────────────────────────
// La cantidad de cuotas por venta y el monto de cada una salen de la tabla
// `configuracion` (no están hardcodeados acá). Cada mes, si el cliente pagó,
// la cuota pasa de "pendiente" a "generada". El revendedor factura y el admin paga.

export const cuotas = pgTable("cuotas", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ventaId:        text("venta_id").notNull().references(() => ventas.id, { onDelete: "cascade" }),
  revendedorId:   text("revendedor_id").notNull().references(() => revendedores.id),
  numeroCuota:    integer("numero_cuota").notNull(),    // 1 a comisionMeses
  monto:          numeric("monto", { precision: 12, scale: 2 }).notNull(),  // comisionMonto vigente al momento de la venta
  periodoMes:     integer("periodo_mes").notNull(),     // mes del año: 1-12
  periodoAnio:    integer("periodo_anio").notNull(),
  status:         cuotaStatusEnum("status").notNull().default("pendiente"),
  pagoExternoId:  text("pago_externo_id").unique(),    // ID del pago en el producto digital (idempotencia)
  creadoEn:       timestamp("creado_en").defaultNow().notNull(),
  generadoEn:     timestamp("generado_en"),  // cuando el cliente pagó
  facturadoEn:    timestamp("facturado_en"),
  pagadoEn:       timestamp("pagado_en"),
  anuladoEn:      timestamp("anulado_en"),  // derecho de arrepentimiento del cliente
});

// ─── Facturas ─────────────────────────────────────────────────────────────────

export const facturas = pgTable("facturas", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  revendedorId:  text("revendedor_id").notNull().references(() => revendedores.id),
  monto:         numeric("monto", { precision: 12, scale: 2 }).notNull(),
  archivoUrl:    text("archivo_url").notNull(),   // URL del PDF subido
  nota:          text("nota"),
  pagada:        boolean("pagada").notNull().default(false),
  subidaEn:      timestamp("subida_en").defaultNow().notNull(),
  pagadaEn:      timestamp("pagada_en"),
  pagadaPor:     text("pagada_por").references(() => users.id),  // superadmin
});

// ─── Cuota ↔ Factura (una factura puede cubrir varias cuotas) ─────────────────

export const cuotasFacturas = pgTable("cuotas_facturas", {
  cuotaId:    text("cuota_id").notNull().references(() => cuotas.id),
  facturaId:  text("factura_id").notNull().references(() => facturas.id),
}, (t) => [primaryKey({ columns: [t.cuotaId, t.facturaId] })]);

// ─── Configuración global ──────────────────────────────────────────────────────
// Fila única (id fijo = 1) con las reglas de negocio editables desde el panel
// de superadmin, para no tener que hardcodear/redeployar cada vez que cambian.

export const configuracion = pgTable("configuracion", {
  id:            integer("id").primaryKey().default(1),
  comisionMonto: numeric("comision_monto", { precision: 12, scale: 2 }).notNull().default("5000"),
  comisionMeses: integer("comision_meses").notNull().default(4),
  // Días desde que se generó la cuota (= cuando el cliente pagó) hasta que
  // se la considera "firme" y se le puede pagar la comisión al revendedor.
  // No es cuándo Mercado Pago liquida esa plata al superadmin (eso tarda
  // ~35 días) — es la ventana de derecho de arrepentimiento (10 días,
  // Ley 24.240): pasado ese plazo el cliente ya no puede darse de baja y
  // pedir reembolso, así que la venta es segura aunque el superadmin todavía
  // no haya cobrado. Si se paga la comisión antes de que MP liquide, el
  // superadmin la adelanta de su bolsillo. Antes de esos días, la cuota no
  // aparece como facturable aunque ya esté "generada".
  diasLiquidacionMp: integer("dias_liquidacion_mp").notNull().default(10),
  actualizadoEn: timestamp("actualizado_en").defaultNow().notNull(),
}, (t) => [check("configuracion_singleton", sql`${t.id} = 1`)]);
