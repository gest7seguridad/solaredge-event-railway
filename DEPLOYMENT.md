# 📘 Guía de Despliegue en Producción - Event System

## 🚀 Preparación para Producción

### 1. Requisitos del Servidor
- **Node.js**: v18.0 o superior
- **PostgreSQL**: v12.0 o superior
- **RAM**: Mínimo 1GB (recomendado 2GB)
- **Espacio en disco**: Mínimo 500MB
- **Sistema Operativo**: Linux (Ubuntu/CentOS) o Windows Server

### 2. Estructura del Proyecto
```
Event-System/
├── app.js                 # Servidor principal
├── backend/public/        # Frontend compilado
├── frontend/             # Código fuente del frontend
├── package.json          # Dependencias del proyecto
├── .env                  # Variables de entorno (crear desde .env.production.example)
├── ecosystem.config.js   # Configuración PM2
└── start-production.sh   # Script de inicio
```

## 🔧 Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/gest7seguridad/Event-System.git
cd Event-System
```

### 2. Configurar Variables de Entorno
```bash
cp .env.production.example .env
nano .env  # Editar con tus valores de producción
```

Variables importantes a configurar:
- `DB_HOST`: Servidor de base de datos PostgreSQL
- `DB_PASSWORD`: Contraseña de la base de datos
- `JWT_SECRET`: Clave secreta para tokens (¡CAMBIAR EN PRODUCCIÓN!)
- `FRONTEND_URL`: URL donde estará el frontend

### 3. Preparar la Base de Datos

#### Crear tablas iniciales:
```sql
-- Conectar a PostgreSQL y ejecutar:
CREATE DATABASE eventos_n;

-- Luego ejecutar los scripts de migración:
```

```bash
# Ejecutar scripts de migración
node update-database.js
node add-event-columns.js
```

### 4. Instalar Dependencias
```bash
# Instalar dependencias del backend
npm install --production

# Si necesitas compilar el frontend:
cd frontend
npm install
npm run build
cd ..
```

### 5. Compilar Frontend (si hay cambios)
```bash
cd frontend
npm run build
cd ..
```

## 🖥️ Despliegue en Plesk

### 1. Subir Archivos
1. Comprimir el proyecto (excluyendo node_modules)
2. Subir mediante FTP o Git
3. Descomprimir en el directorio del dominio

### 2. Configuración en Plesk
1. Ir a **Node.js** en el panel de Plesk
2. Seleccionar versión de Node.js (v18 o superior)
3. **Document Root**: `/httpdocs`
4. **Application Startup File**: `app.js`
5. **Application Mode**: `production`

### 3. Variables de Entorno en Plesk
En la sección de Node.js, agregar las siguientes variables:
- `NODE_ENV`: production
- `PORT`: 3000
- `DB_HOST`: server.radioinsular.es
- `DB_NAME`: eventos_n
- `DB_USER`: eventos_u
- `DB_PASSWORD`: [tu contraseña]
- `JWT_SECRET`: [generar una clave segura]

### 4. Instalar Dependencias en Plesk
En el terminal de Plesk o mediante SSH:
```bash
npm install --production
```

### 5. Iniciar la Aplicación
- Hacer clic en **"Restart App"** en el panel de Node.js de Plesk

## 🐳 Despliegue con PM2 (Recomendado)

### 1. Instalar PM2
```bash
npm install -g pm2
```

### 2. Iniciar la Aplicación
```bash
# Usando el archivo de configuración
pm2 start ecosystem.config.js --env production

# O directamente
pm2 start app.js --name "event-system" -i max
```

### 3. Configurar Auto-inicio
```bash
pm2 startup
pm2 save
```

### 4. Comandos Útiles de PM2
```bash
pm2 status           # Ver estado
pm2 logs            # Ver logs
pm2 restart all     # Reiniciar
pm2 stop all        # Detener
pm2 monit           # Monitor en tiempo real
```

## 🔐 Seguridad en Producción

### 1. Configuración HTTPS (con Nginx)
```nginx
server {
    listen 80;
    server_name solarland.gestsiete.es;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name solarland.gestsiete.es;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Firewall
```bash
# Permitir solo puertos necesarios
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

### 3. Actualizaciones de Seguridad
```bash
# Mantener dependencias actualizadas
npm audit
npm audit fix
```

## 📊 Monitoreo

### 1. Logs
Los logs se guardan en:
- `logs/production.log` - Log general
- `logs/error.log` - Errores (si usas PM2)

### 2. Health Check
Endpoint de salud disponible en:
```
GET /api/health
```

### 3. Métricas con PM2
```bash
pm2 web  # Dashboard web en puerto 9615
```

## 🔄 Actualización del Sistema

### 1. Proceso de Actualización
```bash
# 1. Hacer backup de la base de datos
pg_dump eventos_n > backup_$(date +%Y%m%d).sql

# 2. Obtener últimos cambios
git pull origin main

# 3. Instalar nuevas dependencias
npm install --production

# 4. Compilar frontend si hay cambios
cd frontend && npm run build && cd ..

# 5. Ejecutar migraciones si las hay
node update-database.js

# 6. Reiniciar aplicación
pm2 restart event-system
# O en Plesk: Click en "Restart App"
```

## 🆘 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar credenciales en `.env`
- Verificar que PostgreSQL esté ejecutándose
- Verificar conectividad de red

### Error: "Port already in use"
```bash
# Encontrar proceso usando el puerto
lsof -i :3000
# Matar el proceso
kill -9 [PID]
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install --production
```

### Frontend no se muestra
- Verificar que existe `backend/public/`
- Recompilar: `cd frontend && npm run build`

## 📝 Scripts Útiles

### Backup de Base de Datos
```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h server.radioinsular.es -U eventos_u eventos_n > backup_$DATE.sql
echo "Backup creado: backup_$DATE.sql"
```

### Limpieza de Logs
```bash
#!/bin/bash
# clean-logs.sh
find ./logs -name "*.log" -mtime +30 -delete
echo "Logs antiguos eliminados"
```

## 📞 Contacto y Soporte

Para problemas con el despliegue:
1. Revisar logs en `logs/`
2. Verificar configuración en `.env`
3. Consultar documentación en `README.md`

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos creada y migrada
- [ ] Frontend compilado
- [ ] Dependencias instaladas
- [ ] HTTPS configurado
- [ ] Backup configurado
- [ ] Monitoreo activo
- [ ] Logs funcionando
- [ ] Pruebas de funcionalidad realizadas

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0