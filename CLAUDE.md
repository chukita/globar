@AGENTS.md

# globar

Panel de gestión de revendedores (superadmin, login, panel, revendedores) sobre Next.js.

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + React 19 + Tailwind 4.
- **DB**: PostgreSQL vía Drizzle ORM (`src/db/schema.ts`), Postgres local con Docker Compose.
- **Auth**: NextAuth v5 (`@auth/drizzle-adapter`), passwords con bcryptjs.

## Comandos frecuentes

```bash
docker compose up -d      # levanta postgres local
npm run dev                # next dev

npm run db:generate        # genera migración desde el schema
npm run db:migrate         # aplica migraciones
npm run db:push            # push directo del schema (sin migración)
npm run db:studio          # UI de Drizzle Studio
npm run seed:admin         # crea usuario admin inicial
```

## Variables de entorno

No hay `.env.example` en el repo todavía — pedirle a Cynthia el `.env.local` con al menos:
- `DATABASE_URL` (postgres, ver `docker-compose.yml` para user/pass/db locales: `globar`/`globar`/`globar`)
- variables de NextAuth (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, etc.)

## Estructura clave

```
src/app/
  admin/          # panel superadmin
  api/            # route handlers (incl. webhooks de pago)
  identidad/
  login/
  panel/
  revendedores/
src/db/           # schema Drizzle
src/lib/
src/components/
scripts/seed-admin.ts
```

## Flujo de trabajo en equipo

> **Temporal (desde 2026-08-07, hasta que Carlos diga lo contrario):** el sitio está en producción pero todavía sin clientes reales, así que por ahora los cambios se pushean directo a `main` (sin PR) y eso dispara el deploy automático a producción — no pedir confirmación para esto salvo que algo se vea riesgoso. Cuando esté todo más asentado, van a clonar producción a un ambiente de test para deployar ahí automáticamente en vez de production directo; cuando eso exista, retomar el flujo de PR de abajo (o el que corresponda al nuevo ambiente).

Se trabaja con ramas por feature/fix, mergeadas a `main` vía Pull Request (no pushear directo a `main`).

```bash
git checkout -b feature/mi-cambio     # o fix/..., chore/..., perf/...
# ... cambios y commits ...
git push -u origin feature/mi-cambio
```

Después abrir el Pull Request en GitHub (`compare & pull request`) para que lo revise el otro dev antes de mergear.

Convención de prefijos de rama (igual que en el resto de los proyectos de Cynthia):
- `feature/` — funcionalidad nueva
- `fix/` — corrección de bug
- `chore/` — tareas menores, limpieza, copy
- `perf/` — mejoras de performance
