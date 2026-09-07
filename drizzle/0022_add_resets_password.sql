CREATE TABLE "resets_password" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expira_en" timestamp NOT NULL,
	"creado_en" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resets_password_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "resets_password" ADD CONSTRAINT "resets_password_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;