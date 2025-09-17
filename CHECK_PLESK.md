# 🔍 Lista de verificación para solucionar el error en Plesk

## ⚠️ El frontend carga pero el backend no responde

### 1. Verificar por SSH que el backend está compilado:

```bash
ssh tu_usuario@gestsiete.es
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/

# Verificar que existe el backend compilado
ls -la backend/dist/server.js

# Si NO existe, compilar:
cd backend
npm install
npm run build
cd ..
```

### 2. Verificar el archivo .env:

```bash
# Verificar que existe .env
ls -la .env

# Si NO existe, crearlo desde el ejemplo:
cp .env.production .env

# Editar y verificar las credenciales
nano .env
```

Debe contener:
```env
NODE_ENV=production
PORT=3000
DB_HOST=gestsiete.es
DB_PORT=5432
DB_USER=events_u
DB_PASSWORD=events_pass$
DB_NAME=events_n
JWT_SECRET=SolarLand2025SecureKey
FRONTEND_URL=https://solarland.gestsiete.es
BACKEND_URL=https://solarland.gestsiete.es
```

### 3. En el panel de Node.js de Plesk:

#### Configuración correcta:
- **Node.js Version:** 18.x o superior (NO 24.8.0 si da problemas)
- **Document Root:** `/solarland.gestsiete.es/frontend/dist`
- **Application Root:** `/solarland.gestsiete.es`
- **Application Startup File:** `app.js`
- **Application Mode:** `production`

#### Variables de entorno personalizadas (clic en [specify]):
```
NODE_ENV = production
PORT = 3000
DB_HOST = gestsiete.es
DB_PORT = 5432
DB_USER = events_u
DB_PASSWORD = events_pass$
DB_NAME = events_n
JWT_SECRET = SolarLand2025SecureKey
FRONTEND_URL = https://solarland.gestsiete.es
BACKEND_URL = https://solarland.gestsiete.es
```

### 4. Instalar dependencias y reiniciar:

En el panel de Node.js:
1. Clic en **"NPM install"** - Esperar a que termine
2. Clic en **"Restart App"**
3. Esperar 30 segundos

### 5. Verificar que el backend responde:

```bash
# Por SSH, probar localmente:
curl http://127.0.0.1:3000/api/health

# Debe responder algo como:
# {"status":"OK","timestamp":"2024-..."}
```

### 6. Ver logs de errores:

```bash
# Ver logs de Node.js
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
tail -f logs/error_log

# O desde Plesk:
# Ir a "Logs" → "error_log"
```

### 7. Si sigue sin funcionar - Solución alternativa:

#### Opción A: Cambiar el Document Root en Plesk
En lugar de `/solarland.gestsiete.es/frontend/dist`, usar solo `/solarland.gestsiete.es`

#### Opción B: Verificar permisos
```bash
# Dar permisos correctos
chown -R tu_usuario:psacln /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
chmod -R 755 /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
```

### 8. Configuración nginx actual (correcta):

```nginx
location ~ \.(html|htm|xml|txt|json)$ {
    passenger_enabled off;
    root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;
}

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
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### 9. Probar la aplicación:

- Frontend: https://solarland.gestsiete.es (✅ Ya funciona)
- API Health: https://solarland.gestsiete.es/api/health (❌ Debe funcionar)
- Admin: https://solarland.gestsiete.es/admin (❌ Necesita el backend)

## 🚨 Problema más común:

El backend NO está ejecutándose. Phusion Passenger no está ejecutando correctamente el archivo `app.js`.

### Solución rápida:

1. En Plesk Node.js, cambiar versión de Node.js a 18.x (no 24.x)
2. Clic en "NPM install"
3. Clic en "Restart App"
4. Esperar 1 minuto
5. Probar https://solarland.gestsiete.es/api/health