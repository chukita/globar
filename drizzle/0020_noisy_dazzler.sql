ALTER TYPE "public"."liquidacion_status" ADD VALUE 'en_revision' BEFORE 'facturada';--> statement-breakpoint
ALTER TABLE "liquidaciones" ADD COLUMN "factura_aprobada_en" timestamp;--> statement-breakpoint
ALTER TABLE "liquidaciones" ADD COLUMN "factura_rechazada_en" timestamp;--> statement-breakpoint
ALTER TABLE "liquidaciones" ADD COLUMN "factura_rechazo_motivo" text;