CREATE TABLE "configuracion" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"comision_monto" numeric(12, 2) DEFAULT '5000' NOT NULL,
	"comision_meses" integer DEFAULT 4 NOT NULL,
	"actualizado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "configuracion_singleton" CHECK ("configuracion"."id" = 1)
);
