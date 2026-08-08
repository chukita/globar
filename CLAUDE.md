@AGENTS.md

# globar

Panel de gestión de revendedores (superadmin, login, panel, revendedores) sobre Next.js.

## Modelo de negocio

glob.ar es la plataforma de reventa de dos productos SaaS propios: **agendaonline** (agendaonline.com.ar) y **nume** (nume.com.ar).

1. Alguien se registra en glob.ar (Google o email+password) → automáticamente se crea su fila en `revendedores` con un **código de ventas único** (ej. `GLOBMQ-7K2`, generado en `lib/revendedor.ts`).
2. El revendedor comparte su link por producto: `https://{dominio-del-producto}/?ref={codigoVentas}` (armado en `/panel/perfil`).
3. **Falta implementar en agendaonline y nume**: capturar ese `?ref=` en el registro/suscripción y, cuando el cliente paga, pegarle a `POST /api/webhooks/pago` de glob.ar (ver el JSDoc del payload en `src/app/api/webhooks/pago/route.ts`) con header `x-webhook-secret: $WEBHOOK_SECRET`. Hoy **ninguno de los dos repos tiene esto** — se auditó explícitamente y no hay ni captura de `?ref=` ni webhook saliente en ninguno de los dos.
4. Cuando ese webhook llega con un `codigoRevendedor` válido, glob.ar genera una cuota de comisión (monto y cantidad de meses configurables, ver abajo).
5. El revendedor ve sus cuotas "generadas" en `/panel/facturas`, sube una factura en PDF, y el superadmin la marca como pagada en `/admin/facturas` (eso marca la factura *y* las cuotas asociadas como `pagada`).

### Reglas de negocio configurables

Monto por cuota y cantidad de cuotas **no están hardcodeadas** — viven en la tabla singleton `configuracion` (`id` fijo = 1, con `CHECK` constraint), editable desde `/admin/configuracion` (solo superadmin). Default: $5.000 × 4 meses. El webhook de pagos (`src/app/api/webhooks/pago/route.ts`) lee esto en cada request, no cachea.

Un superadmin puede habilitar/deshabilitar productos por revendedor desde `/admin/revendedores` (tabla `habilitaciones`, constraint único `revendedor_id + producto_id`).

## Stack

- **Frontend/Backend**: Next.js 16 (App Router) + React 19 + Tailwind 4.
- **DB**: PostgreSQL vía Drizzle ORM (`src/db/schema.ts`), Postgres local con Docker Compose.
- **Auth**: NextAuth v5 (`@auth/drizzle-adapter`), passwords con bcryptjs. Dos flujos separados:
  - **Revendedores** (`/login`): Google OAuth o email+password, rol `revendedor` por default.
  - **Superadmin** (`/admin/login`): **solo contraseña, sin usuario** (provider `Credentials` con `id: "superadmin"` en `auth.ts`), comparada con bcrypt contra `SUPERADMIN_PASSWORD_HASH`. No está ligado a ninguna fila de `users` — mismo espíritu que el login de sistema de Agenda Online (clave única compartida), pero integrado a NextAuth (no un sistema paralelo) para reusar middleware/sesión/logout.
- Logout real en ambos paneles vía server action (`lib/actions.ts` → `logoutAction`, usa el `signOut` que exporta `auth.ts`).

## Comandos frecuentes

```bash
docker compose up -d      # levanta postgres local
npm run dev                # next dev

npm run db:generate        # genera migración desde el schema
npm run db:migrate         # aplica migraciones
npm run db:push            # push directo del schema (sin migración)
npm run db:studio          # UI de Drizzle Studio
npm run seed:admin         # crea usuario admin inicial (rol superadmin ligado a un user — legacy, ver nota abajo)
npm run seed:productos      # siembra agendaonline/nume en la tabla productos (idempotente)
```

> Nota: `seed:admin` crea un usuario con rol `superadmin` en la tabla `users` (login por email+password), pero **ya no es necesario para entrar al panel de superadmin** — ahora se entra por `/admin/login` con `SUPERADMIN_PASSWORD_HASH` únicamente. Se mantiene el script por compatibilidad.

## Variables de entorno

No hay `.env.example` en el repo todavía para desarrollo local — pedirle a Cynthia el `.env.local`. Para producción, la referencia real y actualizada es **`deploy/env.production.example`**. Resumen de lo que hace falta:

- `DATABASE_URL` (postgres, ver `docker-compose.yml` para user/pass/db locales: `globar`/`globar`/`globar`)
- `AUTH_SECRET` — secreto de NextAuth (`npx auth secret`).
- `AUTH_URL` — **imprescindible en producción/self-hosted**. Next.js self-hosted arma el `redirect_uri` de OAuth y otras URLs internas desde su propia dirección interna (`http://localhost:3000`), no desde los headers `X-Forwarded-*` que manda el reverse proxy (Caddy), aunque `AUTH_TRUST_HOST=true` esté seteado. Sin `AUTH_URL=https://glob.ar`, el login con Google falla con `redirect_uri_mismatch`. Ver `docker-compose.prod.yml` (usa `https://${PUBLIC_HOST}`).
- `AUTH_TRUST_HOST=true`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google Cloud Console → OAuth Client. Redirect URI a autorizar ahí: `https://glob.ar/api/auth/callback/google`.
- `SUPERADMIN_PASSWORD_HASH` — hash bcrypt para el login de `/admin/login`. Generar con:
  ```bash
  npx tsx -e "import bcrypt from 'bcryptjs'; bcrypt.hash(process.argv[1], 12).then(console.log)" -- 'la-clave-elegida'
  ```
  **Ojo al pegarlo en el `.env` de la VM**: los hashes bcrypt empiezan con `$2b$12$...` y `docker compose` interpreta `$` como referencia a variables al parsear `.env` (incluso si la variable no se usa en el compose file) — hay que escapar cada `$` como `$$`, si no el valor queda vacío/corrupto sin ningún error visible más que un warning de "variable not set".
- `WEBHOOK_SECRET` — el que deben mandar agendaonline/nume en el header `x-webhook-secret` al pegarle a `/api/webhooks/pago`.
- `UPLOAD_DIR` (opcional) — dónde se guardan las facturas subidas, default `/app/uploads` en el contenedor.

## Estructura clave

```
src/app/
  admin/            # panel superadmin (dashboard, ventas, comisiones, facturas, revendedores, configuracion, login)
  api/
    admin/configuracion/   # GET/PUT reglas de negocio (solo superadmin)
    auth/[...nextauth]/
    panel/facturas/         # subida de factura + listado, real desde el día 1
    webhooks/pago/          # recibe pagos de agendaonline/nume, genera cuotas de comisión
  identidad/        # sistema de diseño interno — NO tiene lógica de negocio, es documentación visual
  login/             # login de revendedores
  panel/             # panel del revendedor (productos, comisiones, facturas, perfil, capacitación)
  revendedores/      # landing pública de requisitos para sumarse
src/db/              # schema Drizzle (incluye tabla singleton `configuracion`)
src/lib/
  auth.ts / auth.config.ts   # NextAuth — auth.config.ts es edge-safe (usado por middleware), auth.ts tiene la lógica real (bcrypt, DB)
  revendedor.ts                # ensureRevendedor() — alta automática al loguearse
  configuracion.ts             # getConfiguracion() / updateConfiguracion() — singleton
  panel-data.ts                # queries del panel del revendedor
  admin-data.ts                # queries del panel de superadmin
  actions.ts                   # server actions (logout, marcar factura pagada, toggles de admin, etc.)
src/components/
scripts/
  seed-admin.ts
  seed-productos.ts
```

## Estado actual (2026-08-08)

Ya no queda contenido de ejemplo en el panel ni en el admin — todo consulta la base real. Lo que **sigue siendo estático a propósito** (marketing/onboarding, no toca plata, no se tocó todavía):
- La landing pública (`src/app/page.tsx`) y sus constantes en `src/lib/constants.ts` (`PRODUCTS`, `STEPS`, `REQUISITOS`, precios de ejemplo).
- `/panel/capacitacion` — sigue siendo un placeholder; no hay un sistema real de capacitación/quiz.
- `/identidad` — página de sistema de diseño, no debería estar indexada/linkeada en producción pero no es prioritario sacarla.

Pendiente más importante: **integrar agendaonline y nume** para que capturen `?ref=` y llamen al webhook de pagos (ver "Modelo de negocio" arriba) — sin eso, el flujo de comisiones de glob.ar no tiene forma de dispararse solo todavía.

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

## Infraestructura de producción

- VM: alias SSH `globar-vm` (`~/.ssh/config`), Ubuntu, Docker Compose (`docker-compose.prod.yml`) con servicios `app`, `db` (Postgres 16), `db_backup`, `caddy` (reverse proxy + TLS, `deploy/Caddyfile`, dominio via `PUBLIC_HOST`).
- CI/CD: `.github/workflows/ci.yml` — build+lint+test en cada push/PR; en push a `main`, build de imagen Docker → push a GHCR (`ghcr.io/chukita/globar`) → deploy por SSH (`deploy/deploy.sh`, hace `docker compose pull` + recreate). La imagen se compila en el runner de GitHub porque la VM tiene 1GB de RAM (no le alcanza para `next build`).
- El `.env` de la VM no está en git (`deploy.sh` hace `git reset --hard`, que no lo toca) — cualquier variable nueva hay que agregarla ahí a mano además de documentarla en `deploy/env.production.example`.
