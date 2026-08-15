CREATE TABLE "registros" (
	"id" text PRIMARY KEY NOT NULL,
	"revendedor_id" text,
	"producto_id" text NOT NULL,
	"cliente_nombre" text NOT NULL,
	"cliente_email" text NOT NULL,
	"externo_id" text NOT NULL,
	"registrado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "registros_producto_id_externo_id_unique" UNIQUE("producto_id","externo_id")
);
--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_revendedor_id_revendedores_id_fk" FOREIGN KEY ("revendedor_id") REFERENCES "public"."revendedores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registros" ADD CONSTRAINT "registros_producto_id_productos_id_fk" FOREIGN KEY ("producto_id") REFERENCES "public"."productos"("id") ON DELETE no action ON UPDATE no action;