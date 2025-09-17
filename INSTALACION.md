# 📋 Instrucciones de Instalación - Sistema de Inscripción SolarEdge

## 🚀 Requisitos Previos

### Opción A: Instalación con Docker (Recomendado)
- Docker y Docker Compose instalados
- Puerto 80 y 5432 disponibles
- Mínimo 2GB RAM, 10GB espacio en disco

### Opción B: Instalación Manual
- Node.js 18+ y npm
- PostgreSQL 14+
- Nginx (opcional para servir el frontend)
- Mínimo 2GB RAM, 10GB espacio en disco

## 📦 Instalación con Docker (Recomendado)

### 1. Descomprimir el archivo
```bash
tar -xzf solaredge-event.tar.gz
cd solaredge-event
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de configuración de ejemplo
cp .env.production .env

# Editar el archivo con tus configuraciones
nano .env
```

**Configuraciones importantes a modificar:**
```env
# Base de datos
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_segura
DB_NAME=solaredge_event

# JWT (genera una cadena aleatoria segura)
JWT_SECRET=genera-una-cadena-aleatoria-muy-segura-aqui

# SMTP (configuración de email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM="SolarEdge Event" <noreply@tu-dominio.com>

# URL del frontend
FRONTEND_URL=https://tu-dominio.com
```

### 3. Iniciar los servicios
```bash
# Construir e iniciar todos los contenedores
docker-compose up -d

# Verificar que todos los servicios estén corriendo
docker-compose ps
```

### 4. Verificar la instalación
- Frontend: http://tu-servidor
- Backend API: http://tu-servidor:5000/api/health
- Base de datos: puerto 5432

## 🔧 Instalación Manual

### 1. Descomprimir y preparar
```bash
tar -xzf solaredge-event.tar.gz
cd solaredge-event
```

### 2. Configurar PostgreSQL
```bash
# Crear base de datos
createdb solaredge_event

# Importar estructura y datos
psql -U tu_usuario -d solaredge_event < database_backup.sql
```

### 3. Instalar y configurar el Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../.env.production .env
nano .env  # Editar con tus configuraciones

# Compilar TypeScript
npm run build

# Iniciar el servidor
npm start
```

### 4. Configurar el Frontend
```bash
cd ../frontend

# Si necesitas recompilar (ya viene compilado en dist/)
npm install
npm run build

# Servir con Nginx o cualquier servidor web
# Copiar dist/ a tu directorio web
cp -r dist/* /var/www/html/
```

### 5. Configurar Nginx (opcional)
```bash
# Copiar configuración de nginx
sudo cp nginx.conf /etc/nginx/sites-available/solaredge
sudo ln -s /etc/nginx/sites-available/solaredge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔑 Acceso Inicial

### Credenciales de Administrador
- **Email:** admin@solarland.com
- **Contraseña:** admin123

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer acceso

## 📧 Configuración de Email (SMTP)

### Para Gmail:
1. Activa la verificación en 2 pasos en tu cuenta
2. Genera una contraseña de aplicación:
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera una contraseña para "Mail"
3. Usa esa contraseña en `SMTP_PASS`

### Para otros servicios:
- **Outlook:** smtp-mail.outlook.com:587
- **SendGrid:** smtp.sendgrid.net:587 (usuario: apikey)
- **Amazon SES:** email-smtp.[region].amazonaws.com:587

## 🔄 Actualización del Sistema

### Con Docker:
```bash
# Detener servicios
docker-compose down

# Hacer backup de la base de datos
docker exec solaredge_postgres pg_dump -U postgres solaredge_event > backup_$(date +%Y%m%d).sql

# Actualizar archivos
# (copiar nuevos archivos)

# Reconstruir e iniciar
docker-compose up -d --build
```

### Manual:
```bash
# Hacer backup de la base de datos
pg_dump -U tu_usuario solaredge_event > backup_$(date +%Y%m%d).sql

# Detener servicios
pm2 stop all  # o como tengas configurado

# Actualizar archivos
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build

# Reiniciar servicios
pm2 restart all
```

## 🛠️ Solución de Problemas

### El frontend no conecta con el backend
- Verificar que el backend esté corriendo: `curl http://localhost:5000/api/health`
- Revisar configuración de CORS en el backend
- Verificar la URL del API en el frontend

### Error de conexión a la base de datos
- Verificar credenciales en `.env`
- Comprobar que PostgreSQL esté corriendo
- Verificar permisos del usuario de BD

### Los emails no se envían
1. Verificar configuración SMTP en el panel de admin
2. Probar con el botón "Enviar Email de Prueba"
3. Revisar logs del backend para errores

### WhatsApp no funciona
- Asegúrate de tener WhatsApp Web configurado
- Permite ventanas emergentes en tu navegador
- Verifica el formato del número de teléfono

## 📊 Monitoreo

### Logs con Docker:
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
```

### Logs manuales:
```bash
# Backend
tail -f backend/logs/app.log

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔒 Seguridad

### Recomendaciones importantes:
1. **Cambia todas las contraseñas por defecto**
2. **Usa HTTPS en producción** (configura certificados SSL)
3. **Configura un firewall** (solo abre puertos necesarios)
4. **Mantén actualizadas las dependencias**
5. **Realiza backups regulares** de la base de datos
6. **Configura rate limiting** para prevenir ataques

### Backup automático (cron):
```bash
# Agregar a crontab
0 2 * * * docker exec solaredge_postgres pg_dump -U postgres solaredge_event > /backups/backup_$(date +\%Y\%m\%d).sql
```

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs del sistema
2. Verifica que todos los requisitos estén instalados
3. Asegúrate de que los puertos no estén en uso
4. Verifica los permisos de archivos y directorios

## 🎯 Verificación Final

### Lista de comprobación post-instalación:
- [ ] El sitio web carga correctamente
- [ ] Puedes acceder al panel de administración
- [ ] Los emails de confirmación se envían
- [ ] El sistema de check-in con QR funciona
- [ ] WhatsApp se abre correctamente
- [ ] Los logos se muestran en la página principal
- [ ] Puedes crear y editar eventos
- [ ] Las inscripciones se procesan correctamente

## 📝 Notas Adicionales

- El sistema incluye rate limiting por defecto (100 requests/15min)
- Los QR codes se generan automáticamente para cada inscripción
- El sistema maneja lista de espera automáticamente cuando se alcanza la capacidad
- Los archivos estáticos se sirven con compresión gzip para mejor rendimiento
- La base de datos se inicializa automáticamente con la estructura necesaria

¡El sistema está listo para usar! 🚀