# 🚀 Guía de Despliegue en Plesk con Node.js

## 📋 Requisitos Previos

### En el servidor Plesk:
- Plesk Obsidian 18.0+ 
- Extensión Node.js instalada
- PostgreSQL disponible (usaremos BD remota)
- Acceso SSH al servidor
- Dominio configurado en Plesk

## 🔧 Paso 1: Preparar el Dominio en Plesk

### 1.1 Crear el dominio/subdominio
1. Ir a **Sitios web y dominios**
2. **Añadir dominio** o **Añadir subdominio**
3. Crear: `events.gestsiete.es`

### 1.2 Habilitar Node.js
1. En el dominio, ir a **Node.js**
2. Hacer clic en **Habilitar Node.js**
3. Configurar:
   - **Versión Node.js:** 18.x o superior
   - **Modo de aplicación:** Producción
   - **Archivo de inicio:** `backend/dist/server.js`

## 📦 Paso 2: Subir los Archivos

### Opción A: Usando Git (Recomendado)
```bash
# Conectar por SSH al servidor
ssh usuario@servidor.com

# Ir al directorio del dominio
cd /var/www/vhosts/gestsiete.es/events.gestsiete.es

# Clonar el repositorio
git clone https://github.com/gest7seguridad/Event-System.git .

# Dar permisos
chmod -R 755 .
```

### Opción B: Usando FTP/Administrador de Archivos
1. Descargar el proyecto desde GitHub
2. Subir todos los archivos a `/httpdocs/` del dominio
3. Asegurarse de subir también archivos ocultos (.env, .gitignore)

## 🗄️ Paso 3: Configurar Base de Datos Remota

### 3.1 Crear archivo de configuración
```bash
# En el directorio del dominio
cp .env.production.remote .env

# Editar el archivo
nano .env
```

### 3.2 Configurar variables importantes:
```env
# Base de datos remota (YA CONFIGURADA)
DB_HOST=gestsiete.es
DB_PORT=5432
DB_USER=events_u
DB_PASSWORD=events_pass$$
DB_NAME=events_n

# Cambiar JWT Secret
JWT_SECRET=generar_cadena_aleatoria_segura_minimo_32_caracteres

# Configurar SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM="SolarEdge Event" <noreply@gestsiete.es>

# URLs
FRONTEND_URL=https://events.gestsiete.es
BACKEND_URL=https://events.gestsiete.es
PORT=3000  # Plesk suele usar 3000 para Node.js
```

## 📂 Paso 4: Preparar el Backend

### 4.1 Instalar dependencias del backend
```bash
cd backend

# Instalar todas las dependencias
npm install

# Compilar TypeScript a JavaScript
npm run build

# Verificar que se creó la carpeta dist/
ls -la dist/
```

### 4.2 Migrar base de datos
```bash
# Desde la raíz del proyecto
./migrate-to-remote.sh

# O manualmente:
PGPASSWORD='events_pass$$' psql -h gestsiete.es -U events_u -d events_n < database_backup.sql
```

## 🎨 Paso 5: Configurar el Frontend

### 5.1 Compilar el frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# Verificar que se creó dist/
ls -la dist/
```

### 5.2 Mover archivos estáticos
```bash
# Desde la raíz del proyecto
cp -r frontend/dist/* httpdocs/

# O crear enlace simbólico
ln -s /var/www/vhosts/gestsiete.es/events.gestsiete.es/frontend/dist /var/www/vhosts/gestsiete.es/events.gestsiete.es/httpdocs
```

## ⚙️ Paso 6: Configurar Node.js en Plesk

### 6.1 En el panel de Node.js del dominio:

1. **Archivo de inicio de la aplicación:**
   ```
   backend/dist/server.js
   ```

2. **Directorio raíz de la aplicación:**
   ```
   /backend
   ```

3. **Variables de entorno:** (Añadir una por una)
   - `NODE_ENV` = `production`
   - `DB_HOST` = `gestsiete.es`
   - `DB_PORT` = `5432`
   - `DB_USER` = `events_u`
   - `DB_PASSWORD` = `events_pass$$`
   - `DB_NAME` = `events_n`
   - `JWT_SECRET` = `tu_secret_seguro`
   - Agregar todas las variables del .env

4. **Hacer clic en "Reiniciar aplicación"**

## 🌐 Paso 7: Configurar Nginx/Apache en Plesk

### 7.1 Configuración adicional de Apache & nginx

En **Configuración de Apache & nginx** del dominio, agregar:

#### Directivas adicionales de nginx:
```nginx
# Proxy para API Backend
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

# Frontend React
location / {
    try_files $uri $uri/ /index.html;
}

# Tamaño máximo de archivo
client_max_body_size 10M;

# Headers de seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

#### Directivas adicionales de Apache:
```apache
# Si usas Apache como proxy
ProxyPass /api http://127.0.0.1:3000/api
ProxyPassReverse /api http://127.0.0.1:3000/api

# Rewrite para React Router
<Directory /var/www/vhosts/gestsiete.es/events.gestsiete.es/httpdocs>
    Options -MultiViews
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.html [QSA,L]
</Directory>
```

## 🔒 Paso 8: Configurar SSL

### En Plesk:
1. Ir a **SSL/TLS Certificates**
2. Instalar certificado Let's Encrypt (gratis)
3. Activar redirección permanente 301 de HTTP a HTTPS
4. Activar HTTP/2

## ✅ Paso 9: Verificación

### 9.1 Verificar el backend:
```bash
# Desde SSH
curl http://localhost:3000/api/health

# Desde navegador
https://events.gestsiete.es/api/health
```

### 9.2 Verificar el frontend:
- Abrir: https://events.gestsiete.es
- Debe cargar la página principal del evento

### 9.3 Verificar el admin:
- Acceder a: https://events.gestsiete.es/admin
- Usuario: `admin@solarland.com`
- Contraseña: `admin123`

## 🔄 Paso 10: Configurar PM2 (Opcional pero Recomendado)

### Instalar PM2 para mejor gestión:
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'solaredge-backend',
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
    time: true
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save
pm2 startup
```

## 📊 Monitoreo y Logs

### Ver logs en Plesk:
1. Ir a **Registros** en el dominio
2. Seleccionar **Registro de Node.js**

### Ver logs por SSH:
```bash
# Logs de Node.js
tail -f /var/www/vhosts/gestsiete.es/logs/error_log

# Logs de PM2 (si lo usas)
pm2 logs

# Logs del sistema
journalctl -u plesk-node -f
```

## 🚨 Solución de Problemas Comunes

### Error: "502 Bad Gateway"
```bash
# Reiniciar Node.js desde Plesk
# O por SSH:
plesk bin extension --exec nodejs npm_restart.js

# Verificar que el puerto sea correcto
netstat -tlpn | grep 3000
```

### Error: "Cannot find module"
```bash
cd backend
npm install --production
npm run build
```

### El frontend no carga archivos estáticos:
```bash
# Verificar permisos
chmod -R 755 /var/www/vhosts/gestsiete.es/events.gestsiete.es/httpdocs
chown -R psacln:psaserv httpdocs/
```

### La base de datos no conecta:
```bash
# Probar conexión
PGPASSWORD='events_pass$$' psql -h gestsiete.es -U events_u -d events_n -c '\dt'

# Verificar variables de entorno en Plesk
plesk bin extension --exec nodejs show-config.js
```

## 🔐 Seguridad Post-Instalación

1. **Cambiar contraseña de admin inmediatamente**
2. **Configurar Firewall de Plesk:**
   - Solo permitir puertos necesarios
   - Activar Fail2Ban

3. **Configurar Backups en Plesk:**
   - Ir a **Copias de seguridad**
   - Configurar backup diario
   - Incluir base de datos remota si es posible

4. **Monitoreo:**
   - Activar **Monitor de Salud** en Plesk
   - Configurar alertas por email

## 📝 Script de Despliegue Automatizado

Crear archivo `deploy-plesk.sh`:
```bash
#!/bin/bash

echo "🚀 Desplegando en Plesk..."

# Variables
DOMAIN_PATH="/var/www/vhosts/gestsiete.es/events.gestsiete.es"

# Actualizar código
cd $DOMAIN_PATH
git pull origin main

# Backend
cd backend
npm install --production
npm run build

# Frontend
cd ../frontend
npm install
npm run build

# Copiar frontend a httpdocs
cp -r dist/* ../httpdocs/

# Reiniciar Node.js
plesk bin extension --exec nodejs npm_restart.js

echo "✅ Despliegue completado"
```

## ✅ Checklist Final

- [ ] Dominio creado en Plesk
- [ ] Node.js habilitado y configurado
- [ ] Archivos subidos al servidor
- [ ] Base de datos remota conectada
- [ ] Backend compilado y funcionando
- [ ] Frontend compilado y accesible
- [ ] SSL/HTTPS configurado
- [ ] Variables de entorno configuradas
- [ ] Nginx/Apache configurado correctamente
- [ ] Admin password cambiado
- [ ] Backups configurados
- [ ] Monitoreo activo

## 📞 Soporte

Si tienes problemas:
1. Revisar logs en Plesk → Registros
2. Verificar estado de Node.js en el panel
3. Comprobar conexión a BD remota
4. Verificar que todos los puertos estén correctos

---

**¡Sistema listo para producción en Plesk!** 🎉

**Nota:** Plesk gestiona automáticamente el reinicio de Node.js si se cae, pero PM2 ofrece mejor control y monitoreo.