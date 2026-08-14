CREATE TABLE "contactos" (
	"id" text PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"email" text NOT NULL,
	"mensaje" text NOT NULL,
	"respondido" boolean DEFAULT false NOT NULL,
	"respondido_en" timestamp,
	"creado_en" timestamp DEFAULT now() NOT NULL
);
