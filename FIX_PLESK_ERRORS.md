# 🔧 SOLUCIÓN DE ERRORES - PLESK DEPLOYMENT

## 🚨 PROBLEMAS IDENTIFICADOS

1. **502 Bad Gateway** en llamadas API (`/api/events/current`)
2. **500 Internal Server Error** en archivos estáticos (`favicon.svg`)
3. **500 Internal Server Error** en rutas de React (`/admin`)
4. Node.js no está respondiendo en puerto 3000

---

## ✅ SOLUCIONES PASO A PASO

### SOLUCIÓN 1: VERIFICAR NODE.JS

#### En Panel Plesk → Node.js

1. **Verificar Estado**:
   - Debe mostrar **"Running"**
   - Si muestra "Stopped", click en **"Start"**

2. **Verificar Configuración**:
   ```
   Application Root: /solarland.gestsiete.es
   Startup File: backend/dist/server.js
   Application Mode: production
   Node.js Version: 18.x o superior
   ```

3. **Ver Logs**:
   - Click en **"Show Logs"**
   - Buscar errores específicos
   - Si hay error de puerto, cambiar PORT a 3001 en variables

---

### SOLUCIÓN 2: REEMPLAZAR .HTACCESS

**Usar el archivo `.htaccess-fixed` que es más simple y compatible**:

1. En **File Manager** de Plesk
2. Renombrar `.htaccess` actual a `.htaccess.backup`
3. Subir `.htaccess-fixed`
4. Renombrar `.htaccess-fixed` a `.htaccess`

---

### SOLUCIÓN 3: VERIFICAR ESTRUCTURA DE CARPETAS

La estructura DEBE ser exactamente así:
```
/solarland.gestsiete.es/
├── backend/
│   ├── dist/
│   │   └── server.js    ← VERIFICAR QUE EXISTE
│   └── package.json
├── frontend/
│   └── dist/
│       ├── index.html   ← VERIFICAR QUE EXISTE
│       ├── assets/      ← VERIFICAR QUE EXISTE
│       └── favicon.svg
├── .env                 ← VERIFICAR QUE EXISTE
├── .htaccess
└── package.json
```

---

### SOLUCIÓN 4: CONFIGURACIÓN NGINX ALTERNATIVA

Si Apache no funciona bien, usar **solo Nginx**:

#### En Plesk → Apache & nginx Settings

1. **Deshabilitar Apache**:
   - [ ] Proxy mode (DESMARCAR)
   - [x] Serve static files directly by nginx

2. **En "Additional nginx directives"**, pegar TODO esto:

```nginx
# === CONFIGURACIÓN COMPLETA NGINX ===

# Backend Node.js
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

# Health check
location = /health {
    proxy_pass http://127.0.0.1:3000/api/health;
}

# Root del frontend
root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;

# Index file
index index.html;

# React Router - IMPORTANTE
location / {
    try_files $uri $uri/ /index.html;
}

# Cache de assets
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. Click **"Apply"**

---

### SOLUCIÓN 5: VERIFICAR VARIABLES DE ENTORNO

#### En Node.js → Environment Variables

Asegurarse que TODAS estas están configuradas:

```
NODE_ENV = production
PORT = 3000
DB_HOST = gestsiete.es
DB_PORT = 5432
DB_USER = events_u
DB_PASSWORD = events_pass$$
DB_NAME = events_n
JWT_SECRET = [UN_VALOR_SEGURO_ÚNICO]
FRONTEND_URL = https://solarland.gestsiete.es
BACKEND_URL = https://solarland.gestsiete.es
```

---

### SOLUCIÓN 6: REINSTALAR DEPENDENCIAS

Si Node.js no arranca:

1. En **Node.js** → **NPM Install Script**:
   ```bash
   cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es && npm install --production && cd backend && npm install --production
   ```

2. Click **"Run NPM Install"**
3. Esperar a que termine
4. **"Restart Application"**

---

### SOLUCIÓN 7: CAMBIAR PUERTO SI ESTÁ OCUPADO

Si el puerto 3000 está ocupado:

1. En **Environment Variables**, cambiar:
   ```
   PORT = 3001
   ```

2. En **nginx directives**, cambiar todas las referencias:
   ```nginx
   proxy_pass http://127.0.0.1:3001;
   ```

3. **Restart Application**

---

## 🔍 DIAGNÓSTICO RÁPIDO

### Test 1: Verificar Node.js
Abrir en navegador:
```
https://solarland.gestsiete.es:3000
```
Si responde, Node.js está funcionando pero el proxy no.

### Test 2: Health Check Directo
```
https://solarland.gestsiete.es/health
```
Debe responder `{"status":"OK"}`

### Test 3: Verificar Frontend
```
https://solarland.gestsiete.es/index.html
```
Si carga, el problema es el routing.

---

## 🚀 SCRIPT DE VERIFICACIÓN MANUAL

En **Scheduled Tasks** de Plesk, crear tarea única:

```bash
#!/bin/bash
# Verificar que Node.js está corriendo
ps aux | grep node | grep -v grep

# Verificar puerto 3000
netstat -tulpn | grep :3000

# Test de conexión
curl -I http://127.0.0.1:3000/api/health

# Verificar archivos
ls -la /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/backend/dist/
ls -la /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist/
```

---

## 📝 CHECKLIST DE VERIFICACIÓN

- [ ] Node.js muestra "Running" en panel
- [ ] No hay errores en logs de Node.js
- [ ] Archivo `backend/dist/server.js` existe
- [ ] Archivo `frontend/dist/index.html` existe
- [ ] Variables de entorno configuradas
- [ ] `.htaccess` actualizado
- [ ] nginx configurado correctamente
- [ ] Puerto 3000 no está bloqueado

---

## 💡 SOLUCIÓN ALTERNATIVA: PM2

Si Node.js de Plesk sigue fallando, usar **PM2**:

1. En **Scheduled Tasks**, crear tarea:
   ```bash
   cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es
   npm install -g pm2
   pm2 start backend/dist/server.js --name solarland
   pm2 save
   pm2 startup
   ```

2. Para ver logs:
   ```bash
   pm2 logs solarland
   ```

---

## 🆘 SI NADA FUNCIONA

### Opción 1: Modo Desarrollo Temporal
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/backend
node dist/server.js
```

### Opción 2: Contactar Soporte
Proporcionar:
1. Logs de Node.js
2. Error logs de Apache/Nginx
3. Este documento con checkmarks de lo intentado

---

## ✅ CONFIRMACIÓN DE ÉXITO

Cuando todo funcione correctamente:

1. `https://solarland.gestsiete.es` → Página principal
2. `https://solarland.gestsiete.es/admin` → Panel admin
3. `https://solarland.gestsiete.es/api/health` → `{"status":"OK"}`
4. No hay errores 500 o 502 en consola

---

**IMPORTANTE**: Después de cada cambio, siempre:
1. Restart Application (Node.js)
2. Limpiar caché del navegador (Ctrl+F5)
3. Esperar 30 segundos para que se apliquen cambios