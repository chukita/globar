import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  numeric,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["superadmin", "revendedor"]);

// Estado de una cuota de comisión en el ciclo de cobro
export const cuotaStatusEnum = pgEnum("cuota_status", [
  "pendiente",   // el cliente aún no pagó este mes
  "generada",    // el cliente pagó → cuota disponible para facturar
  "facturada",   // el revendedor subió la factura
  "pagada",      // el superadmin realizó la transferencia
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
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:       text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  codigoVentas: text("codigo_ventas").notNull().unique(),  // ej: GLOBMQ-7K2
  zona:         text("zona"),
  activo:       boolean("activo").notNull().default(true),
  creadoEn:     timestamp("creado_en").defaultNow().notNull(),
});

// ─── Productos ────────────────────────────────────────────────────────────────

export const productos = pgTable("productos", {
  id:              text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre:          text("nombre").notNull(),           // "agendaonline"
  dominio:         text("dominio").notNull(),           // "agendaonline.com.ar"
  tag:             text("tag").notNull(),               // "Turnos & reservas"
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
});

// ─── Ventas ───────────────────────────────────────────────────────────────────

export const ventas = pgTable("ventas", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  revendedorId:   text("revendedor_id").notNull().references(() => revendedores.id),
  productoId:     text("producto_id").notNull().references(() => productos.id),
  clienteNombre:  text("cliente_nombre").notNull(),
  clienteEmail:   text("cliente_email"),
  // precio al momento de la venta (puede cambiar en el futuro)
  precioMensual:  numeric("precio_mensual", { precision: 12, scale: 2 }).notNull(),
  vendidoEn:      timestamp("vendido_en").defaultNow().notNull(),
  activa:         boolean("activa").notNull().default(true),
});

// ─── Cuotas de comisión ───────────────────────────────────────────────────────
// Se generan 6 cuotas por venta. Cada mes, si el cliente pagó, la cuota pasa
// de "pendiente" a "generada". El revendedor factura y el admin paga.

export const cuotas = pgTable("cuotas", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ventaId:        text("venta_id").notNull().references(() => ventas.id, { onDelete: "cascade" }),
  revendedorId:   text("revendedor_id").notNull().references(() => revendedores.id),
  numeroCuota:    integer("numero_cuota").notNull(),    // 1 a 6
  // monto = 50% del precio mensual al momento de la venta
  monto:          numeric("monto", { precision: 12, scale: 2 }).notNull(),
  periodoMes:     integer("periodo_mes").notNull(),     // mes del año: 1-12
  periodoAnio:    integer("periodo_anio").notNull(),
  status:         cuotaStatusEnum("status").notNull().default("pendiente"),
  creadoEn:       timestamp("creado_en").defaultNow().notNull(),
  generadoEn:     timestamp("generado_en"),  // cuando el cliente pagó
  facturadoEn:    timestamp("facturado_en"),
  pagadoEn:       timestamp("pagado_en"),
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
