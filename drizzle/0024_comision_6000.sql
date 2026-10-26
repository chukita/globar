ALTER TABLE "configuracion" ALTER COLUMN "comision_monto" SET DEFAULT '6000';--> statement-breakpoint
-- Aumento de comisión (oct. 2026): $5.000 → $6.000 por mes. Solo si sigue en
-- el valor viejo, para no pisar un monto que el superadmin haya cambiado a mano.
UPDATE "configuracion" SET "comision_monto" = '6000', "actualizado_en" = now() WHERE "id" = 1 AND "comision_monto" = '5000';
