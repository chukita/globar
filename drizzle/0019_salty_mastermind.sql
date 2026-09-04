CREATE TYPE "public"."liquidacion_status" AS ENUM('pagada', 'facturada', 'anulada');--> statement-breakpoint
ALTER TYPE "public"."cuota_status" ADD VALUE 'liquidada' BEFORE 'facturada';--> statement-breakpoint
CREATE TABLE "liquidaciones" (
	"id" text PRIMARY KEY NOT NULL,
	"revendedor_id" text NOT NULL,
	"periodo_mes" integer NOT NULL,
	"periodo_anio" integer NOT NULL,
	"monto" numeric(12, 2) NOT NULL,
	"cantidad_cuotas" integer NOT NULL,
	"status" "liquidacion_status" DEFAULT 'pagada' NOT NULL,
	"pagada_en" timestamp DEFAULT now() NOT NULL,
	"comprobante_url" text,
	"factura_url" text,
	"factura_recibida_en" timestamp,
	"factura_vence_en" timestamp NOT NULL,
	"nota" text,
	"recordatorios_enviados" integer DEFAULT 0 NOT NULL,
	"ultimo_recordatorio_en" timestamp,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "liquidaciones_revendedor_id_periodo_mes_periodo_anio_unique" UNIQUE("revendedor_id","periodo_mes","periodo_anio")
);
--> statement-breakpoint
ALTER TABLE "configuracion" ADD COLUMN "meses_gracia_factura" integer DEFAULT 3 NOT NULL;--> statement-breakpoint
ALTER TABLE "configuracion" ADD COLUMN "notif_liquidacion_bloqueada" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "cuotas" ADD COLUMN "liquidacion_id" text;--> statement-breakpoint
ALTER TABLE "cuotas" ADD COLUMN "liquidado_en" timestamp;--> statement-breakpoint
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cuotas" ADD CONSTRAINT "cuotas_liquidacion_id_liquidaciones_id_fk" FOREIGN KEY ("liquidacion_id") REFERENCES "public"."liquidaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
-- Backfills del rediseño de facturación (sept. 2026). Volumen de datos ~nulo, defensivo.
-- Revendedores preexistentes conservan acceso al panel (el gate nuevo exige puede_facturar).
UPDATE "revendedores" SET "puede_facturar" = true WHERE "puede_facturar" = false;--> statement-breakpoint
-- Cuotas legacy "facturada" (flujo viejo: factura subida, todavía sin pagar) vuelven al
-- pipeline nuevo como "generada" para entrar en la próxima liquidación mensual.
UPDATE "cuotas" SET "status" = 'generada', "facturado_en" = NULL WHERE "status" = 'facturada';