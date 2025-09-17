# 🔧 Solución Error Phusion Passenger en Plesk

## ❌ Problema Identificado
La aplicación no está ejecutándose correctamente en Plesk debido a la configuración de Phusion Passenger.

## ✅ Solución Paso a Paso

### 1. Conectar por SSH al servidor
```bash
ssh tu_usuario@gestsiete.es
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
```

### 2. Verificar estructura de archivos
```bash
# Verificar que existan estos archivos
ls -la app.js
ls -la backend/dist/server.js
ls -la frontend/dist/index.html
ls -la package.json
```

### 3. Crear package.json en la raíz si no existe
```bash
# Si no existe package.json en la raíz, créalo:
cat > package.json << 'EOF'
{
  "name": "solaredge-event",
  "version": "1.0.0",
  "description": "Sistema de inscripción de eventos SolarEdge",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "build": "./build.sh"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "dotenv": "^16.0.0"
  }
}
EOF
```

### 4. Instalar dependencias en la raíz
```bash
# Instalar dotenv en la raíz
npm install dotenv
```

### 5. Verificar compilación del backend
```bash
# Si no está compilado, compilar:
cd backend
npm ci
npm run build
cd ..
```

### 6. Configurar Plesk correctamente

#### En el panel de Plesk → Node.js:

1. **Deshabilitar y volver a habilitar Node.js**
   - Clic en "Deshabilitar Node.js"
   - Esperar 30 segundos
   - Clic en "Habilitar Node.js"

2. **Configuración correcta:**
   ```
   Versión de Node.js:         18.x (o superior)
   Raíz del documento:         /solarland.gestsiete.es
   Modo de aplicación:         production
   Archivo de inicio:          app.js
   ```

3. **Variables de entorno** (añadir en Plesk):
   ```
   NODE_ENV = production
   PORT = 3000
   DB_HOST = gestsiete.es
   DB_PORT = 5432
   DB_USER = events_u
   DB_PASSWORD = events_pass$
   DB_NAME = events_n
   JWT_SECRET = SolarLand2025ProductionSecureKey
   FRONTEND_URL = https://solarland.gestsiete.es
   BACKEND_URL = https://solarland.gestsiete.es
   ```

### 7. Configurar Nginx para servir el frontend

En **Configuración de Apache & nginx** → **Configuración adicional de nginx**:

```nginx
# IMPORTANTE: Servir el frontend estático, NO el backend
location / {
    root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;
    try_files $uri $uri/ /index.html;
    
    # Headers de caché para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# API del backend
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

# Desactivar el procesamiento de Phusion para archivos estáticos
location ~ \.(html|htm|js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    passenger_enabled off;
}
```

### 8. Reiniciar la aplicación

En el panel de Node.js:
1. Clic en **"Detener aplicación"**
2. Esperar 10 segundos
3. Clic en **"Iniciar aplicación"**

### 9. Verificar logs

```bash
# Ver logs de errores
tail -f /var/www/vhosts/solarland.gestsiete.es/logs/error_log

# Ver logs de Node.js
tail -f /var/www/vhosts/solarland.gestsiete.es/logs/passenger.log
```

### 10. Test de funcionamiento

```bash
# Verificar que el backend responde
curl http://127.0.0.1:3000/api/health

# Verificar que el frontend está accesible
curl -I https://solarland.gestsiete.es/
```

## 🚨 Si el error persiste:

### Opción A: Modo estático + PM2

1. **Desactivar Node.js en Plesk completamente**
2. **Servir solo archivos estáticos del frontend**
3. **Ejecutar backend con PM2 manualmente:**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'solarland-backend',
    script: './backend/dist/server.js',
    cwd: '/var/www/vhosts/gestsiete.es/solarland.gestsiete.es',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Opción B: Configuración alternativa de Phusion

Si Plesk usa Phusion Passenger, crear archivo `passenger-standalone.json`:

```json
{
  "environment": "production",
  "port": 3000,
  "daemonize": true,
  "user": "tu_usuario",
  "instance_registry_dir": "/var/run/passenger-instreg",
  "log_file": "/var/www/vhosts/gestsiete.es/solarland.gestsiete.es/logs/passenger.log",
  "pid_file": "/var/www/vhosts/gestsiete.es/solarland.gestsiete.es/passenger.pid",
  "startup_file": "app.js"
}
```

## 📋 Checklist de verificación

- [ ] Archivo `app.js` existe en la raíz
- [ ] `backend/dist/server.js` está compilado
- [ ] `frontend/dist/index.html` existe
- [ ] Variables de entorno configuradas en Plesk
- [ ] Nginx configurado para servir frontend estático
- [ ] Node.js 18+ seleccionado en Plesk
- [ ] Permisos correctos (755 para directorios, 644 para archivos)
- [ ] Base de datos remota accesible

## 🆘 Comandos de emergencia

```bash
# Reiniciar todo
plesk bin extension --call nodejs --restart

# Ver procesos de Node
ps aux | grep node

# Matar todos los procesos Node
killall node

# Reiniciar Nginx
service nginx restart

# Verificar puertos en uso
netstat -tlnp | grep 3000
```

## 📝 Nota importante

El error de Phusion Passenger generalmente ocurre cuando:
1. El archivo de entrada no está configurado correctamente
2. Las dependencias no están instaladas
3. El código no está compilado
4. Los permisos son incorrectos
5. La configuración de Nginx está mal

Esta guía cubre todas estas posibilidades.