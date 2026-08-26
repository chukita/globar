ALTER TABLE "revendedores" ADD COLUMN "onboarding_completed_at" timestamp;
--> statement-breakpoint
-- Backfill: los revendedores que ya existían cuando se agregó este gate
-- quedan con el onboarding general implícitamente completado (se dieron de
-- alta antes de que este paso existiera), mismo criterio que el backfill de
-- email_verified en 0017. Se usa creado_en en vez de now() para que quede
-- un timestamp con sentido si se audita más adelante.
UPDATE "revendedores" SET "onboarding_completed_at" = "creado_en" WHERE "onboarding_completed_at" IS NULL;