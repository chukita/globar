ALTER TABLE "configuracion" ALTER COLUMN "meses_gracia_factura" SET DEFAULT 1;--> statement-breakpoint
-- La fila singleton ya existe con el valor viejo (3). El cambio de default no la
-- toca, así que la bajamos a 1 explícitamente (nuevo plazo: 1 mes para facturar).
UPDATE "configuracion" SET "meses_gracia_factura" = 1 WHERE "id" = 1 AND "meses_gracia_factura" = 3;
