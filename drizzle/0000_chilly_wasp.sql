CREATE TYPE "public"."cuota_status" AS ENUM('pendiente', 'generada', 'facturada', 'pagada');--> statement-breakpoint
CREATE TYPE "public"."producto_status" AS ENUM('activo', 'inactivo');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'revendedor');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "cuotas" (
	"id" text PRIMARY KEY NOT NULL,
	"venta_id" text NOT NULL,
	"revendedor_id" text NOT NULL,
	"numero_cuota" integer NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"periodo_mes" integer NOT NULL,
	"periodo_anio" integer NOT NULL,
	"status" "cuota_status" DEFAULT 'pendiente' NOT NULL,
	"pago_externo_id" text,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	"generado_en" timestamp,
	"facturado_en" timestamp,
	"pagado_en" timestamp,
	CONSTRAINT "cuotas_pago_externo_id_unique" UNIQUE("pago_externo_id")
);
--> statement-breakpoint
CREATE TABLE "cuotas_facturas" (
	"cuota_id" text NOT NULL,
	"factura_id" text NOT NULL,
	CONSTRAINT "cuotas_facturas_cuota_id_factura_id_pk" PRIMARY KEY("cuota_id","factura_id")
);
--> statement-breakpoint
CREATE TABLE "facturas" (
	"id" text PRIMARY KEY NOT NULL,
	"revendedor_id" text NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"archivo_url" text NOT NULL,
	"nota" text,
	"pagada" boolean DEFAULT false NOT NULL,
	"subida_en" timestamp DEFAULT now() NOT NULL,
	"pagada_en" timestamp,
	"pagada_por" text
);
--> statement-breakpoint
CREATE TABLE "habilitaciones" (
	"id" text PRIMARY KEY NOT NULL,
	"revendedor_id" text NOT NULL,
	"producto_id" text NOT NULL,
	"habilitado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "productos" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"dominio" text NOT NULL,
	"tag" text NOT NULL,
	"descripcion" text,
	"precio_mensual" numeric(12, 2) NOT NULL,
	"status" "producto_status" DEFAULT 'activo' NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revendedores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"codigo_ventas" text NOT NULL,
	"zona" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "revendedores_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "revendedores_codigo_ventas_unique" UNIQUE("codigo_ventas")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"password" text,
	"role" "role" DEFAULT 'revendedor' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ventas" (
	"id" text PRIMARY KEY NOT NULL,
	"revendedor_id" text,
	"producto_id" text NOT NULL,
	"cliente_nombre" text NOT NULL,
	"cliente_email" text,
	"precio_mensual" numeric(12, 2) NOT NULL,
	"vendido_en" timestamp DEFAULT now() NOT NULL,
	"activa" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_venta_id_ventas_id_fk" FOREIGN KEY ("venta_id") REFERENCES "public"."ventas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuotas_facturas" ADD CONSTRAINT "cuotas_facturas_cuota_id_cuotas_id_fk" FOREIGN KEY ("cuota_id") REFERENCES "public"."cuotas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuotas_facturas" ADD CONSTRAINT "cuotas_facturas_factura_id_facturas_id_fk" FOREIGN KEY ("factura_id") REFERENCES "public"."facturas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_pagada_por_users_id_fk" FOREIGN KEY ("pagada_por") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habilitaciones" ADD CONSTRAINT "habilitaciones_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habilitaciones" ADD CONSTRAINT "habilitaciones_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revendedores" ADD CONSTRAINT "revendedores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;