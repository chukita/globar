# Backups de glob.ar

Dos cosas para no perder: la **base** (revendedores, ventas, cuotas,
liquidaciones) y los **archivos subidos** (facturas en PDF y comprobantes de
pago, volumen Docker `globar_uploads`, montado en `/app/uploads`).

## 1. Dumps diarios en la VM (`db_backup`)

`pg_dump` comprimido una vez por día, con rotación (14 diarios / 8 semanales /
6 mensuales, ajustable con `BACKUP_KEEP_*` en `.env`). Quedan en
`~/globar/backups/{last,daily,weekly,monthly}`.

Protege contra borrados o migraciones malas, **no contra perder la VM**.

## 2. Copia off-site a Google Drive (`backup_sync`)

Cada 6 h, `rclone copy` sube a Drive:

```
globar-backups/
├── db/        # los dumps de ./backups (last, daily, weekly, monthly)
└── uploads/   # facturas y comprobantes
```

Es `copy`, no `sync`: nunca borra nada en Drive (un dump rotado o una factura
reemplazada se conservan allá). Está **inactivo por defecto**; para activarlo,
una sola vez:

### Generar el token de Google Drive (en tu PC)

El flujo abre el navegador, así que va en la PC (con Docker Desktop), no en la VM:

```bash
docker run --rm -it -p 53682:53682 rclone/rclone:1.68 authorize "drive" --drive-scope drive.file
```

Autorizás con tu cuenta de Google y rclone imprime un JSON
`{"access_token":"...","token_type":"Bearer","refresh_token":"...","expiry":"..."}`.
Copiá la línea entera. Con el scope `drive.file` rclone solo ve los archivos que
crea él (no el resto de tu Drive).

Podés reusar el mismo token que usa la agenda (`RCLONE_GDRIVE_TOKEN` del `.env`
de `agendaonline-vm`): es la misma cuenta y el mismo scope, y cada sistema
escribe en su carpeta.

### Configurar la VM

```bash
ssh globar-vm
cd ~/globar
nano .env
```

Agregar:

```
COMPOSE_PROFILES=backup-sync
RCLONE_GDRIVE_TOKEN={"access_token":"...","refresh_token":"...","expiry":"..."}
```

Si el token tiene algún `$`, escapalo como `$$`.

```bash
docker compose -f docker-compose.prod.yml up -d backup_sync
docker compose -f docker-compose.prod.yml logs -f backup_sync   # tiene que decir [backup_sync] OK
```

En Drive aparece la carpeta **globar-backups**.

`deploy/deploy.sh` levanta el stack con el mismo `.env`, así que el servicio
sigue activo en cada deploy. En la VM de test (`globar-test`) no se activa: su
base es de prueba.

### Forzar una copia ahora

```bash
docker compose -f docker-compose.prod.yml restart backup_sync
```

## Restaurar paso a paso

⚠️ Restaurar **pisa** los datos actuales. Si la base todavía anda, primero forzá
un dump de lo que hay (`docker compose -f docker-compose.prod.yml exec db_backup /backup.sh`)
y bajalo a tu PC, por si hay que volver atrás.

Todos los comandos, en la VM:

```bash
cd ~/globar
C="docker compose -f docker-compose.prod.yml"
```

### 1. Elegir el dump

| Qué pasó | De dónde sale |
| --- | --- |
| Se borró o rompió algo, la VM anda | `~/globar/backups/last/` (último) o `daily/`, `weekly/`, `monthly/` |
| Se perdió la VM | Google Drive → `globar-backups/db/` (misma estructura) |

Desde Drive: bajalo de drive.google.com y subilo a la VM nueva con
`scp globar-AAAAMMDD-000000.sql.gz globar-vm:~/globar/backups/`. Antes, en la
VM nueva: clonar el repo, poner el `.env` (con `POSTGRES_PASSWORD`, `AUTH_SECRET`,
etc. del gestor de contraseñas) y `docker login ghcr.io` (ver `deploy/setup-vm.sh`).

Verificar que sea SQL válido: `gunzip -c backups/<archivo>.sql.gz | head -40`
(tiene que mostrar `CREATE TABLE …`).

### 2. Restaurar la base (siempre sobre una base vacía)

```bash
$C down                                 # frena todo
docker volume rm globar_db_data         # borra la base vieja (en una VM nueva no existe)
$C up -d db                             # base nueva, vacía; esperar healthy: $C ps db
gunzip -c backups/<archivo>.sql.gz | $C exec -T db psql -U globar -d globar -q
$C up -d                                # el resto
```

Tiene que cargar sin ningún `ERROR`.

### 3. Restaurar las facturas (solo si se perdió el volumen `globar_uploads`)

```bash
$C run --rm -v globar_uploads:/restore backup_sync 'rclone copy "$DEST/uploads" /restore'
```

Requiere el `RCLONE_GDRIVE_TOKEN` en el `.env` (el mismo que usa la agenda).

### 4. Comprobar

```bash
$C exec -T db psql -U globar -d globar -tAc \
  "select (select count(*) from revendedores) revendedores, (select count(*) from registros) leads,
          (select count(*) from ventas) ventas, (select count(*) from cuotas) cuotas,
          (select count(*) from liquidaciones) liquidaciones"
```

Y entrar a https://glob.ar/admin y a un panel de revendedor.

Probado el 2026-11-13: el dump de producción cargado en un `postgres:16`
aparte dio cero errores y los mismos conteos que producción; las 6 facturas se
bajaron de Drive completas a un volumen de prueba.
