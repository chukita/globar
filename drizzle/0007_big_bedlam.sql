ALTER TABLE "configuracion" ALTER COLUMN "dias_liquidacion_mp" SET DEFAULT 10;
--> statement-breakpoint
-- Solo si sigue en el valor default anterior (35) — si el superadmin ya lo
-- cambió a mano a otra cosa, no lo pisamos.
UPDATE "configuracion" SET "dias_liquidacion_mp" = 10 WHERE "id" = 1 AND "dias_liquidacion_mp" = 35;