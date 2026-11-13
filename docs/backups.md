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

## Restaurar

⚠️ Sobrescribe los datos actuales.

```bash
cd ~/globar
# base (desde la VM o bajando el .sql.gz de Drive):
gunzip -c backups/last/globar-latest.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T db psql -U globar -d globar
# facturas (desde Drive, con el contenedor de backup_sync):
docker compose -f docker-compose.prod.yml run --rm -v globar_uploads:/restore backup_sync \
  'rclone copy "$DEST/uploads" /restore'
```

Para la base, conviene restaurar sobre una base vacía (recrear el volumen
`globar_db_data` o hacer `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` antes).
