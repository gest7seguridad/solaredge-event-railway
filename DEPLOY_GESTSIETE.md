# 🚀 Guía de Despliegue en Producción - GESTSIETE.ES

## 📋 Información de la Base de Datos Remota

```
Host: gestsiete.es
Puerto: 5432
Base de datos: events_n
Usuario: events_u
Contraseña: events_pass$$
```

## 🔧 Archivos de Configuración Preparados

1. **`.env.production.remote`** - Variables de entorno con BD remota
2. **`docker-compose.production.yml`** - Docker Compose sin BD local
3. **`migrate-to-remote.sh`** - Script de migración automática
4. **`nginx.production.conf`** - Configuración Nginx para producción

## 📦 Paso 1: Preparar el Servidor

### Requisitos del servidor:
- Docker y Docker Compose instalados
- Puerto 80 y 443 abiertos
- 2GB RAM mínimo
- 10GB espacio en disco

### Instalar Docker (si no está instalado):
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## 🗄️ Paso 2: Migrar Base de Datos

### Opción A: Con datos de prueba
```bash
# Ejecutar el script de migración
./migrate-to-remote.sh

# Seleccionar opción 1 para migrar datos existentes
```

### Opción B: Solo estructura (recomendado para producción limpia)
```bash
# Ejecutar el script de migración
./migrate-to-remote.sh

# Seleccionar opción 2 para crear solo estructura
```

### Opción C: Migración manual
```bash
# Conectar a la BD remota
PGPASSWORD='events_pass$$' psql -h gestsiete.es -U events_u -d events_n

# Ejecutar el SQL de estructura
\i database_backup.sql
```

## ⚙️ Paso 3: Configurar Variables de Entorno

```bash
# Copiar archivo de producción
cp .env.production.remote .env

# Editar configuración
nano .env
```

### Configuraciones importantes a modificar:

#### 1. JWT Secret (OBLIGATORIO cambiar):
```env
JWT_SECRET=genera_una_cadena_aleatoria_segura_aqui_min_32_caracteres
```

#### 2. Configuración SMTP (para emails):

**Para Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM="SolarEdge Event" <noreply@gestsiete.es>
```

**Para servidor SMTP propio:**
```env
SMTP_HOST=mail.gestsiete.es
SMTP_PORT=587
SMTP_USER=noreply@gestsiete.es
SMTP_PASS=tu_contraseña_smtp
EMAIL_FROM="SolarEdge Event" <noreply@gestsiete.es>
```

#### 3. URLs de producción:
```env
FRONTEND_URL=https://events.gestsiete.es
BACKEND_URL=https://api.events.gestsiete.es
```

## 🐳 Paso 4: Iniciar con Docker

```bash
# Construir e iniciar servicios
docker-compose -f docker-compose.production.yml up -d

# Verificar que estén corriendo
docker-compose -f docker-compose.production.yml ps

# Ver logs
docker-compose -f docker-compose.production.yml logs -f
```

## 🔒 Paso 5: Configurar SSL (HTTPS)

### Opción A: Con Let's Encrypt (Gratis)
```bash
# Instalar Certbot
sudo apt-get update
sudo apt-get install certbot

# Generar certificado
sudo certbot certonly --standalone -d events.gestsiete.es

# Los certificados estarán en:
# /etc/letsencrypt/live/events.gestsiete.es/
```

### Opción B: Con certificado existente
1. Copiar certificados a `./ssl/`
2. Descomentar las líneas SSL en `nginx.production.conf`
3. Reiniciar el contenedor frontend

## ✅ Paso 6: Verificación

### 1. Verificar conexión a BD remota:
```bash
PGPASSWORD='events_pass$$' psql -h gestsiete.es -U events_u -d events_n -c '\dt'
```

### 2. Verificar API:
```bash
curl http://tu-servidor:5000/api/health
```

### 3. Acceder al sistema:
- Frontend: http://events.gestsiete.es
- Admin: http://events.gestsiete.es/admin
  - Email: `admin@solarland.com`
  - Password: `admin123`

## 🔐 Paso 7: Seguridad Post-Instalación

### 1. Cambiar contraseña de admin:
- Acceder a `/admin`
- Cambiar contraseña inmediatamente

### 2. Configurar firewall:
```bash
# Solo permitir puertos necesarios
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Configurar backups automáticos:
```bash
# Agregar a crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * PGPASSWORD='events_pass$$' pg_dump -h gestsiete.es -U events_u events_n > /backups/events_$(date +\%Y\%m\%d).sql
```

## 📊 Monitoreo

### Ver logs en tiempo real:
```bash
# Todos los servicios
docker-compose -f docker-compose.production.yml logs -f

# Solo backend
docker-compose -f docker-compose.production.yml logs -f backend

# Solo frontend
docker-compose -f docker-compose.production.yml logs -f frontend
```

### Reiniciar servicios:
```bash
docker-compose -f docker-compose.production.yml restart
```

### Detener servicios:
```bash
docker-compose -f docker-compose.production.yml down
```

## 🚨 Solución de Problemas

### Error de conexión a BD remota:
1. Verificar credenciales en `.env`
2. Verificar que el servidor PostgreSQL permita conexiones remotas
3. Verificar firewall del servidor de BD

### El frontend no carga:
1. Verificar que el build esté en `frontend/dist/`
2. Verificar logs de nginx: `docker logs solaredge_frontend_prod`
3. Verificar permisos de archivos

### Los emails no se envían:
1. Verificar configuración SMTP en `.env`
2. Para Gmail: usar contraseña de aplicación, no la contraseña normal
3. Verificar logs del backend para errores

### Error 502 Bad Gateway:
1. El backend no está corriendo
2. Verificar: `docker-compose -f docker-compose.production.yml ps`
3. Reiniciar backend: `docker-compose -f docker-compose.production.yml restart backend`

## 📝 Comandos Útiles

```bash
# Estado de los contenedores
docker-compose -f docker-compose.production.yml ps

# Reiniciar todo
docker-compose -f docker-compose.production.yml restart

# Actualizar solo el backend
docker-compose -f docker-compose.production.yml up -d --build backend

# Entrar al contenedor del backend
docker exec -it solaredge_backend_prod sh

# Ver uso de recursos
docker stats

# Limpiar contenedores y volúmenes antiguos
docker system prune -a
```

## 🔄 Actualización del Sistema

```bash
# 1. Hacer backup de BD
PGPASSWORD='events_pass$$' pg_dump -h gestsiete.es -U events_u events_n > backup_pre_update.sql

# 2. Obtener últimos cambios
git pull origin main

# 3. Reconstruir contenedores
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build

# 4. Verificar
docker-compose -f docker-compose.production.yml ps
```

## ✅ Checklist de Producción

- [ ] Base de datos remota conectada y funcionando
- [ ] Variables de entorno configuradas correctamente
- [ ] JWT Secret cambiado (NO usar el por defecto)
- [ ] SMTP configurado y probado
- [ ] Docker Compose iniciado sin errores
- [ ] Frontend accesible en el navegador
- [ ] API respondiendo en `/api/health`
- [ ] Contraseña de admin cambiada
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados
- [ ] Firewall configurado
- [ ] Monitoreo activo

## 📞 Información de Contacto

Si tienes problemas con el despliegue:
1. Revisa los logs con `docker-compose logs`
2. Verifica la conexión a la BD remota
3. Asegúrate de que todos los puertos estén abiertos

---

**¡El sistema está listo para producción en GESTSIETE.ES!** 🎉