ALTER TABLE "configuracion" ADD COLUMN "notif_admin_emails" text;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "notif_factura_pagada" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "revendedores" ADD COLUMN "notif_comision_generada" boolean DEFAULT true NOT NULL;