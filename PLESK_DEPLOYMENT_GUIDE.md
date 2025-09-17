# 🚀 GUÍA COMPLETA DE DEPLOYMENT EN PLESK

## 📋 CHECKLIST PRE-DEPLOYMENT

### Requisitos en Plesk
- [ ] Node.js 18+ instalado
- [ ] Acceso SSH/Terminal
- [ ] Dominio configurado (solarland.gestsiete.es)
- [ ] SSL/HTTPS activo
- [ ] Acceso a panel de Plesk

### Preparación Local
- [ ] Build local exitoso (`npm run build`)
- [ ] Variables de entorno listas
- [ ] Base de datos accesible desde servidor
- [ ] Backup del código

## 🔧 PASO 1: PREPARAR ARCHIVOS LOCALMENTE

### 1.1 Crear Build de Producción
```bash
# En tu máquina local
cd Event-System

# Limpiar builds anteriores
rm -rf backend/dist frontend/dist

# Ejecutar build completo
chmod +x build-plesk.sh
./build-plesk.sh

# Verificar que se generaron los directorios
ls -la backend/dist/
ls -la frontend/dist/
```

### 1.2 Preparar Archivo .env.production
```bash
# Crear .env para Plesk
cp .env.production .env.plesk

# Editar con los valores reales
nano .env.plesk
```

## 📤 PASO 2: SUBIR ARCHIVOS A PLESK

### 2.1 Via Panel de Plesk (File Manager)
1. Acceder a **File Manager** en Plesk
2. Navegar a la raíz del dominio
3. Crear estructura de carpetas:
```
/httpdocs/
  ├── backend/
  │   ├── dist/        (subir contenido compilado)
  │   ├── node_modules/ (se instalará después)
  │   └── package.json
  ├── frontend/
  │   └── dist/        (subir build de React)
  ├── .env             (archivo de producción)
  └── package.json     (principal)
```

### 2.2 Via SSH/SFTP (Recomendado)
```bash
# Conectar por SSH
ssh usuario@solarland.gestsiete.es

# O usar SFTP
sftp usuario@solarland.gestsiete.es

# Subir archivos
cd /var/www/vhosts/solarland.gestsiete.es/httpdocs
put -r backend/
put -r frontend/dist
put package.json
put .env.plesk .env
```

## ⚙️ PASO 3: CONFIGURAR NODE.JS EN PLESK

### 3.1 Acceder a Node.js Application Manager
1. En Plesk, ir a **Node.js**
2. Click en **"+ Add Node.js Application"**

### 3.2 Configuración de la Aplicación
```yaml
Application Mode: Production
Node.js version: 18.x o superior
Application Root: /httpdocs
Application Startup File: backend/dist/server.js
Application URL: https://solarland.gestsiete.es

Environment Variables (Click "Add Variable"):
  NODE_ENV: production
  PORT: 3000
  DB_HOST: gestsiete.es
  DB_PORT: 5432
  DB_USER: events_u
  DB_PASSWORD: events_pass$$
  DB_NAME: events_n
  JWT_SECRET: [CAMBIAR_POR_SECRETO_SEGURO]
  JWT_EXPIRES_IN: 24h
  SMTP_HOST: smtp.gmail.com
  SMTP_PORT: 587
  SMTP_USER: [tu-email@gmail.com]
  SMTP_PASS: [tu-app-password]
  FRONTEND_URL: https://solarland.gestsiete.es
  BACKEND_URL: https://solarland.gestsiete.es
```

### 3.3 NPM Install Script
En la sección **"NPM install"**:
```bash
cd /var/www/vhosts/solarland.gestsiete.es/httpdocs && npm install --production
cd backend && npm install --production
```

## 🌐 PASO 4: CONFIGURAR NGINX/APACHE

### 4.1 Configuración Nginx (Recomendado)
En **"Apache & nginx Settings"** → **"Additional nginx directives"**:

```nginx
# Proxy para API Backend
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Servir Frontend React
location / {
    root /var/www/vhosts/solarland.gestsiete.es/httpdocs/frontend/dist;
    try_files $uri $uri/ /index.html;

    # Cache para assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Compresión gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

# Seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 4.2 Si usas Apache (.htaccess)
Crear `/httpdocs/.htaccess`:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Redirigir API al backend Node.js
    RewriteRule ^api/(.*)$ http://127.0.0.1:3000/api/$1 [P,L]

    # Servir frontend para otras rutas
    RewriteCond %{REQUEST_URI} !^/api
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /frontend/dist/index.html [L]
</IfModule>

# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache de assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access 1 year"
    ExpiresByType image/jpeg "access 1 year"
    ExpiresByType image/gif "access 1 year"
    ExpiresByType image/png "access 1 year"
    ExpiresByType text/css "access 1 month"
    ExpiresByType text/javascript "access 1 month"
    ExpiresByType application/javascript "access 1 month"
</IfModule>
```

## 🗄️ PASO 5: CONFIGURAR BASE DE DATOS

### 5.1 Ejecutar Migraciones
```bash
# Conectar por SSH
ssh usuario@solarland.gestsiete.es

# Ir al directorio
cd /var/www/vhosts/solarland.gestsiete.es/httpdocs/backend

# Ejecutar migraciones
npm run db:migrate

# Cargar datos iniciales (opcional)
npm run db:seed
```

### 5.2 Verificar Conexión
```bash
# Test de conexión
node -e "
const pg = require('pg');
const client = new pg.Client({
  host: 'gestsiete.es',
  port: 5432,
  database: 'events_n',
  user: 'events_u',
  password: 'events_pass$$'
});
client.connect().then(() => {
  console.log('✅ DB conectada');
  client.end();
}).catch(err => {
  console.error('❌ Error:', err);
});
"
```

## 🚀 PASO 6: INICIAR APLICACIÓN

### 6.1 Desde Panel de Plesk
1. En **Node.js Application Manager**
2. Click en **"Start Application"** o **"Restart"**
3. Verificar estado: debe mostrar **"Running"**

### 6.2 Verificar Logs
En el panel de Node.js, click en **"Show Logs"**:
```
✅ Database connection established successfully
🚀 Server running on port 3000
📝 Environment: production
```

## ✅ PASO 7: VERIFICACIÓN FINAL

### 7.1 Health Check
```bash
# Desde terminal
curl https://solarland.gestsiete.es/api/health

# Respuesta esperada:
{"status":"OK","timestamp":"2024-..."}
```

### 7.2 Verificar Frontend
1. Abrir https://solarland.gestsiete.es
2. Debe cargar la página de React
3. Verificar consola del navegador (sin errores)

### 7.3 Test de Funcionalidad
- [ ] Página principal carga
- [ ] API responde (/api/events)
- [ ] Login funciona
- [ ] Registro de eventos opera
- [ ] Emails se envían

## 🔧 PASO 8: CONFIGURACIÓN PM2 (Opcional pero Recomendado)

### 8.1 Instalar PM2
```bash
npm install -g pm2
```

### 8.2 Crear ecosystem.config.js
```javascript
module.exports = {
  apps: [{
    name: 'solaredge-event',
    script: './backend/dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    restart_delay: 3000,
    autorestart: true
  }]
};
```

### 8.3 Iniciar con PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🚨 TROUBLESHOOTING

### Error: "Application could not be started"
```bash
# Verificar logs
tail -f /var/www/vhosts/solarland.gestsiete.es/logs/error_log

# Verificar permisos
chmod -R 755 /var/www/vhosts/solarland.gestsiete.es/httpdocs
```

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
cd /var/www/vhosts/solarland.gestsiete.es/httpdocs
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install
```

### Error: "EADDRINUSE: Port 3000 already in use"
```bash
# Matar proceso existente
lsof -i :3000
kill -9 [PID]

# O cambiar puerto en .env
PORT=3001
```

### Error: Base de datos no conecta
```bash
# Verificar conectividad
telnet gestsiete.es 5432

# Verificar credenciales en .env
cat .env | grep DB_
```

## 📊 MONITOREO POST-DEPLOYMENT

### Configurar Monitoreo
1. **Logs**: Configurar rotación en `/logs`
2. **Uptime**: Usar servicio externo (UptimeRobot)
3. **Métricas**: Panel de Plesk → Statistics
4. **Alertas**: Configurar email notifications en Plesk

### Backup Automático
```bash
# Crear script backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backup_$DATE.tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  /var/www/vhosts/solarland.gestsiete.es/httpdocs
```

## 🎯 COMANDOS ÚTILES POST-DEPLOYMENT

```bash
# Ver logs en tiempo real
tail -f /var/www/vhosts/solarland.gestsiete.es/logs/error_log

# Reiniciar aplicación
# Desde Plesk Node.js Manager → Restart

# Ver procesos Node.js
ps aux | grep node

# Ver uso de recursos
top -p $(pgrep -d',' node)

# Limpiar cache
npm cache clean --force

# Actualizar dependencias
npm update

# Ver variables de entorno
printenv | grep -E "DB_|JWT_|NODE_"
```

## ✨ OPTIMIZACIONES FINALES

1. **Habilitar HTTP/2** en Plesk → Web Server Settings
2. **Configurar CDN** para assets estáticos
3. **Habilitar Brotli** compression si está disponible
4. **Configurar CSP** (Content Security Policy)
5. **Implementar Redis** para sesiones (opcional)

---

**¡LISTO!** Tu aplicación debería estar funcionando en https://solarland.gestsiete.es

Para soporte: verificar logs y usar el script de verificación incluido.