ALTER TABLE "productos" ADD COLUMN "url_registro" text;--> statement-breakpoint
UPDATE "productos" SET "url_registro" = 'https://' || "dominio" WHERE "url_registro" IS NULL;--> statement-breakpoint
ALTER TABLE "productos" ALTER COLUMN "url_registro" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "pais" text DEFAULT 'Argentina';--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "provincia" text;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "localidad" text;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "dni" text;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "fecha_nacimiento" text;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "puede_facturar" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "cbu" text;