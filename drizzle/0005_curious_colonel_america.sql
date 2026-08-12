ALTER TYPE "public"."cuota_status" ADD VALUE 'anulada';--> statement-breakpoint
ALTER TABLE "cuotas" ADD COLUMN "anulado_en" timestamp;