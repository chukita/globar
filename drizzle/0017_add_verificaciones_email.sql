CREATE TABLE "verificaciones_email" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"codigo_hash" text NOT NULL,
	"codigo_expira_en" timestamp NOT NULL,
	"token_hash" text NOT NULL,
	"token_expira_en" timestamp NOT NULL,
	"intentos" integer DEFAULT 0 NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "verificaciones_email_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "verificaciones_email" ADD CONSTRAINT "verificaciones_email_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Backfill: las cuentas que ya existen quedan implícitamente verificadas
-- (se crearon antes de que existiera este gate) para no bloquear a nadie.
UPDATE "users" SET "email_verified" = "created_at" WHERE "email_verified" IS NULL;