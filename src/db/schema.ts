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
  telefono:       text("telefono"),
  puedeFacturar:  boolean("puede_facturar").notNull().default(false),
  cbuAlias:       text("cbu_alias"),   // CBU (22 dígitos) o alias tipo Mercado Pago
  titularNombre:  text("titular_nombre"),   // a nombre de quién está la cuenta de cobro
  titularCuit:    text("titular_cuit"),     // obligatorio a nivel de app si puedeFacturar
  activo:         boolean("activo").notNull().default(true),
  // Se completa cuando el revendedor aprueba el onboarding general de glob.ar
  // (video + quiz, /panel/onboarding). NULL = todavía no lo hizo. El backfill
  // de la migración marca como completado a todo revendedor preexistente —
  // el gate solo aplica a altas nuevas.
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  notifFacturaPagada:    boolean("notif_factura_pagada").notNull().default(true),
  notifComisionGenerada: boolean("notif_comision_generada").notNull().default(true),
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

// ─── Registros ────────────────────────────────────────────────────────────────
// Alguien se registró en un producto con el link `?vendedor=` de un
// revendedor, todavía sin pagar. Señal aparte de `ventas` (que recién se
// crea cuando llega el primer pago) — sirve para que el revendedor vea
// "registrados" (leads) además de "suscriptos" (clientes pagos) en su panel.

export const registros = pgTable("registros", {
  id:             text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  revendedorId:   text("revendedor_id").references(() => revendedores.id),  // null si el código venía inválido/inactivo
  productoId:     text("producto_id").notNull().references(() => productos.id),
  clienteNombre:  text("cliente_nombre").notNull(),
  clienteEmail:   text("cliente_email").notNull(),
  externoId:      text("externo_id").notNull(),  // id del registro en el producto (ej. shopId) — idempotencia
  registradoEn:   timestamp("registrado_en").defaultNow().notNull(),
}, (t) => [unique().on(t.productoId, t.externoId)]);

// ─── Verificación de email ─────────────────────────────────────────────────────
// Código de 6 dígitos + token de link (dos credenciales independientes, cada
// una con su propia expiración) para confirmar el email en el alta por
// email+contraseña. Google no la necesita (Google ya confirma el email).
// Una fila por usuario: "reenviar" reemplaza código y token juntos.

export const verificacionesEmail = pgTable("verificaciones_email", {
  id:            text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:        text("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  codigoHash:    text("codigo_hash").notNull(),
  codigoExpiraEn: timestamp("codigo_expira_en").notNull(),
  tokenHash:     text("token_hash").notNull(),
  tokenExpiraEn: timestamp("token_expira_en").notNull(),
  intentos:      integer("intentos").notNull().default(0),
  creadoEn:      timestamp("creado_en").defaultNow().notNull(),
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
  comprobanteUrl: text("comprobante_url"),        // comprobante de transferencia, subido por el superadmin al pagar
});

// ─── Cuota ↔ Factura (una factura puede cubrir varias cuotas) ─────────────────

export const cuotasFacturas = pgTable("cuotas_facturas", {
  cuotaId:    text("cuota_id").notNull().references(() => cuotas.id),
  facturaId:  text("factura_id").notNull().references(() => facturas.id),
}, (t) => [primaryKey({ columns: [t.cuotaId, t.facturaId] })]);

// ─── Contactos (formulario público de la landing) ─────────────────────────────

export const contactos = pgTable("contactos", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nombre:       text("nombre").notNull(),
  email:        text("email").notNull(),
  mensaje:      text("mensaje").notNull(),
  respondido:   boolean("respondido").notNull().default(false),
  respondidoEn: timestamp("respondido_en"),
  creadoEn:     timestamp("creado_en").defaultNow().notNull(),
});

// ─── Configuración global ──────────────────────────────────────────────────────
// Fila única (id fijo = 1) con las reglas de negocio editables desde el panel
// de superadmin, para no tener que hardcodear/redeployar cada vez que cambian.

export const configuracion = pgTable("configuracion", {
  id:            integer("id").primaryKey().default(1),
  comisionMonto: numeric("comision_monto", { precision: 12, scale: 2 }).notNull().default("5000"),
  comisionMeses: integer("comision_meses").notNull().default(4),
  // Lista de emails separados por coma que reciben los avisos de "revendedor
  // nuevo" y "factura subida" — no hay usuario superadmin en `users` (login
  // solo por contraseña), así que no hay otra forma de saber a quién avisar.
  notifAdminEmails: text("notif_admin_emails"),
  // Toggles independientes por tipo de evento — mismo espíritu que las
  // preferencias de notificación del revendedor (notifFacturaPagada/
  // notifComisionGenerada más arriba), pero a nivel global de superadmin.
  notifRevendedorNuevo: boolean("notif_revendedor_nuevo").notNull().default(true),
  notifFacturaSubida: boolean("notif_factura_subida").notNull().default(true),
  actualizadoEn: timestamp("actualizado_en").defaultNow().notNull(),
}, (t) => [check("configuracion_singleton", sql`${t.id} = 1`)]);
