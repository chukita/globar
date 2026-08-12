ALTER TABLE "ventas" ADD COLUMN "ultimo_pago_en" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint
-- Backfill para ventas ya existentes: si tienen cuotas, el pago más reciente
-- conocido; si no, la fecha de alta. Sin esto quedarían con la fecha de esta
-- migración, que las haría ver "recién pagadas" sin serlo.
UPDATE "ventas" SET "ultimo_pago_en" = COALESCE(
  (SELECT MAX("generado_en") FROM "cuotas" WHERE "cuotas"."venta_id" = "ventas"."id"),
  "vendido_en"
);