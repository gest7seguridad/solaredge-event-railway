# 🚀 Guía de Despliegue en Plesk Onyx con Node.js

## 📋 Requisitos Previos

### En el servidor Plesk Onyx:
- **Plesk Onyx 17.8+** (versión mínima)
- **Extensión Node.js** instalada desde el catálogo
- **Git** instalado en el servidor
- **Acceso SSH** al servidor
- **Dominio/Subdominio** configurado en Plesk

> ⚠️ **Importante:** La base de datos PostgreSQL está en gestsiete.es (remota), NO necesitas configurar base de datos en Plesk.

## 🏗️ Script de Build

Antes de subir a Plesk, ejecuta el build localmente:

```bash
# En tu máquina local
./build.sh

# Esto genera:
# - backend/dist/   (código compilado del servidor)
# - frontend/dist/  (archivos estáticos del frontend)
```

## 📦 Paso 1: Configurar Dominio en Plesk

### 1.1 Crear dominio o subdominio
1. Acceder a Plesk con tu usuario
2. Ir a **"Sitios web y dominios"**
3. Clic en **"Añadir dominio"** o **"Añadir subdominio"**
4. Configurar:
   - Nombre: `solarland.gestsiete.es`
   - Directorio: `/httpdocs` (por defecto)

### 1.2 Habilitar SSL
1. En el dominio, ir a **"Certificados SSL/TLS"**
2. Instalar **Let's Encrypt** (gratis):
   - Email: tu-email@dominio.com
   - Marcar: Incluir dominio con y sin www
3. Clic en **"Instalar"**

## 📱 Paso 2: Configurar Node.js en Plesk Onyx

### 2.1 Instalar extensión Node.js (si no está)
1. Ir a **"Extensiones"** → **"Catálogo de extensiones"**
2. Buscar **"Node.js"**
3. Instalar la extensión

### 2.2 Habilitar Node.js para el dominio
1. En el dominio, buscar **"Node.js"** en el panel
2. Clic en **"Node.js"**
3. Activar con el botón **"Habilitar Node.js"**

### 2.3 Configuración de Node.js:

```
Versión de Node.js:        18.x (o la más reciente disponible)
Modo de aplicación:        production
Raíz del documento:        /solarland.gestsiete.es
Directorio de aplicación:  /solarland.gestsiete.es
Archivo de inicio:         app.js
```

## 📂 Paso 3: Subir Archivos

### Opción A: Usando Git por SSH (Recomendado)

```bash
# Conectar por SSH
ssh tu_usuario@gestsiete.es

# Navegar al directorio del dominio
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/

# Clonar repositorio
git clone https://github.com/gest7seguridad/Event-System.git .

# Dar permisos correctos
chown -R tu_usuario:psacln .
chmod -R 755 .
```

### Opción B: Usando Administrador de Archivos de Plesk

1. Ir a **"Administrador de archivos"**
2. Navegar a `/httpdocs`
3. Subir archivo `.tar.gz` o `.zip` del proyecto
4. Extraer en el servidor
5. Verificar permisos (755 para directorios, 644 para archivos)

### Opción C: Usando FTP

```bash
# Conectar con FileZilla o cliente FTP
Host: ftp.solarland.gestsiete.es
Usuario: tu_usuario_ftp
Puerto: 21

# Subir todas las carpetas:
- backend/
- frontend/
- Todos los archivos de la raíz
```

## 🔧 Paso 4: Configurar Variables de Entorno

### 4.1 Crear archivo .env
```bash
# Por SSH
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
cp .env.example .env
nano .env
```

### 4.2 Configurar variables importantes:
```env
# Entorno
NODE_ENV=production
PORT=3000

# Base de datos remota (NO CAMBIAR)
DB_HOST=gestsiete.es
DB_PORT=5432
DB_USER=events_u
DB_PASSWORD=events_pass$$
DB_NAME=events_n

# JWT (CAMBIAR)
JWT_SECRET=genera_string_aleatorio_seguro_minimo_32_caracteres

# SMTP (Configurar con tus datos)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM="SolarEdge Event" <noreply@solarland.gestsiete.es>

# URLs
FRONTEND_URL=https://solarland.gestsiete.es
BACKEND_URL=https://solarland.gestsiete.es
```

### 4.3 Variables en Panel de Plesk

En la configuración de Node.js, sección **"Variables de entorno personalizadas"**:

Añadir cada variable clave:
- `NODE_ENV` → `production`
- `DB_HOST` → `gestsiete.es`
- `DB_USER` → `events_u`
- `DB_PASSWORD` → `events_pass$$`
- `DB_NAME` → `events_n`
- `JWT_SECRET` → `tu_secret_seguro`

## 🔨 Paso 5: Compilar y Preparar

### 5.1 Instalar dependencias y compilar
```bash
# Por SSH en el directorio del dominio
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/

# Backend
cd backend
npm ci --production=false
npm run build
npm prune --production

# Frontend
cd ../frontend
npm ci --production=false  
npm run build
```

### 5.2 Verificar compilación
```bash
# Debe existir:
ls -la backend/dist/server.js
ls -la frontend/dist/index.html
```

## 🌐 Paso 6: Configurar Apache & Nginx

En Plesk, ir a **"Configuración de Apache & nginx"** del dominio:

### 6.1 Configuración adicional de nginx:

```nginx
# Servir archivos estáticos del frontend
location / {
    root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;
    try_files $uri $uri/ /index.html;
    expires 1d;
    add_header Cache-Control "public, immutable";
}

# Proxy para API backend
location /api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Archivos estáticos
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Tamaño máximo de upload
client_max_body_size 10M;

# Compresión
gzip on;
gzip_types text/plain text/css text/javascript application/javascript application/json;
gzip_vary on;
```

### 6.2 Configuración HTTP adicional de Apache:

```apache
# Headers de seguridad
Header set X-Frame-Options "SAMEORIGIN"
Header set X-Content-Type-Options "nosniff"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# Habilitar compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

## ▶️ Paso 7: Iniciar Aplicación

### 7.1 En el panel de Node.js de Plesk:

1. Verificar configuración:
   - **Archivo de inicio:** `app.js`
   - **Modo:** `production`
   - **Puerto:** Dejar que Node.js lo asigne o usar 3000

2. Clic en **"Reiniciar aplicación"**

3. Clic en **"Ejecutar script NPM"**:
   - Seleccionar: `install`
   - Directorio: `/backend`
   - Ejecutar

### 7.2 Verificar que funciona:
```bash
# Por SSH
curl http://127.0.0.1:3000/api/health

# Debe responder:
# {"status":"OK","timestamp":"..."}
```

## ⚠️ IMPORTANTE: Si aparece error de Phusion Passenger

Ver archivo [FIX_PLESK_ERROR.md](./FIX_PLESK_ERROR.md) para solución detallada.

## ✅ Paso 8: Verificación Final

### URLs para verificar:
- **Frontend:** https://solarland.gestsiete.es
- **API Health:** https://solarland.gestsiete.es/api/health
- **Admin Panel:** https://solarland.gestsiete.es/admin

### Credenciales iniciales:
- Email: `admin@solarland.com`
- Password: `admin123`

## 🔧 Solución de Problemas

### Error 502 Bad Gateway
```bash
# Verificar que Node.js está ejecutándose
ps aux | grep node

# Ver logs de Node.js en Plesk
tail -f /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/logs/proxy_error_log

# Reiniciar desde Plesk
plesk bin extension --exec nodejs restart.js
```

### La aplicación no inicia
```bash
# Verificar archivo de inicio
ls -la /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/backend/dist/server.js

# Verificar permisos
chown -R tu_usuario:psacln /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
chmod -R 755 /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
```

### Frontend muestra página en blanco
```bash
# Verificar que frontend está compilado
ls -la frontend/dist/

# Si no existe, compilar:
cd frontend && npm run build

# Verificar configuración de nginx
nginx -t
```

### Base de datos no conecta
```bash
# Probar conexión desde el servidor
PGPASSWORD='events_pass$$' psql -h gestsiete.es -U events_u -d events_n -c '\dt'

# Verificar variables de entorno
cd backend && node -e "console.log(process.env.DB_HOST)"
```

## 📊 Monitoreo

### Ver logs en Plesk:
1. Ir a **"Registros"** del dominio
2. Seleccionar tipo de log:
   - **access_ssl_log** - Accesos HTTPS
   - **error_log** - Errores de Apache
   - **proxy_error_log** - Errores de Node.js

### Monitorear recursos:
1. Ir a **"Estadísticas"**
2. Ver uso de CPU, RAM y disco
3. Configurar alertas si es necesario

## 🔄 Actualización del Código

### Script de actualización (`update.sh`):
```bash
#!/bin/bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/

# Backup
tar -czf backup-$(date +%Y%m%d).tar.gz backend/dist frontend/dist

# Actualizar código
git pull origin main

# Recompilar
cd backend && npm ci && npm run build
cd ../frontend && npm ci && npm run build

# Reiniciar Node.js desde Plesk
plesk bin extension --exec nodejs restart.js

echo "✅ Actualización completada"
```

## 🚀 Optimizaciones para Producción

### 1. Configurar PM2 (Opcional pero recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Crear configuración
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'solaredge-backend',
    script: 'backend/dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
```

### 2. Configurar CDN para archivos estáticos
- Usar Cloudflare o CDN de Plesk
- Cachear archivos en `/frontend/dist`

### 3. Activar HTTP/2
En Plesk → Configuración de hosting → Habilitar HTTP/2

## 📝 Checklist Final

- [ ] Node.js 18+ configurado en Plesk
- [ ] Archivo de inicio: `app.js` en la raíz
- [ ] Variables de entorno configuradas
- [ ] Backend compilado (`npm run build`)
- [ ] Frontend compilado (`npm run build`)
- [ ] SSL/HTTPS activado
- [ ] Nginx configurado para SPA
- [ ] API respondiendo en `/api/health`
- [ ] Frontend cargando correctamente
- [ ] Admin password cambiado
- [ ] Backups configurados en Plesk

---

¡Sistema listo en Plesk Onyx! 🎉