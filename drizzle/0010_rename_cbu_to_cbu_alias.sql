-- drizzle-kit no puede autodetectar este rename en modo no interactivo (pide
-- confirmar "¿es un rename?" por prompt, que no existe en este entorno) — se
-- escribió a mano para no perder los CBU que ya estén cargados.
ALTER TABLE "revendedores" RENAME COLUMN "cbu" TO "cbu_alias";
