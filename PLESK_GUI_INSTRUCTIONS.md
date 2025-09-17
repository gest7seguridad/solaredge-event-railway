# 📘 INSTRUCCIONES PLESK - CONFIGURACIÓN DESDE PANEL (SIN TERMINAL)

## 🎯 INFORMACIÓN DEL PROYECTO
- **Subdominio**: solarland.gestsiete.es
- **Carpeta en servidor**: `/solarland.gestsiete.es/`
- **Tipo de aplicación**: Node.js + React
- **Base de datos**: PostgreSQL (configurada en server.radioinsular.es)

---

## 📋 PASO 0: PREPARACIÓN LOCAL (EN TU COMPUTADORA)

### 0.1 Compilar el Proyecto
Antes de subir los archivos, necesitas compilar el proyecto en tu computadora:

1. Abre una terminal en tu computadora
2. Navega a la carpeta del proyecto
3. Ejecuta:
```bash
# Windows
build-plesk.bat

# Mac/Linux
./build-plesk.sh
```

### 0.2 Archivos que Necesitas
Después del build, estos son los archivos/carpetas que debes subir:

```
✅ backend/dist/          (carpeta completa)
✅ frontend/dist/         (carpeta completa)
✅ backend/package.json
✅ package.json          (el principal)
✅ .env.plesk           (renombrar a .env al subir)
✅ .htaccess
```

---

## 📤 PASO 1: SUBIR ARCHIVOS A PLESK

### 1.1 Acceder al File Manager
1. Inicia sesión en Plesk
2. Selecciona el dominio **solarland.gestsiete.es**
3. Click en **File Manager**

### 1.2 Crear Estructura de Carpetas
En la carpeta raíz `/solarland.gestsiete.es/`, crear:

```
/solarland.gestsiete.es/
├── backend/
│   ├── dist/           (subir contenido compilado aquí)
│   └── package.json    (subir archivo)
├── frontend/
│   └── dist/          (subir contenido de React aquí)
├── logs/              (crear carpeta vacía)
├── uploads/           (crear carpeta vacía)
├── .env               (subir .env.plesk y renombrar)
├── .htaccess          (subir archivo)
└── package.json       (subir el principal)
```

### 1.3 Subir Archivos
1. Click en **Upload Files**
2. Sube las carpetas una por una:
   - Selecciona `backend/dist` → Súbela dentro de `/backend/`
   - Selecciona `frontend/dist` → Súbela dentro de `/frontend/`
   - Sube `package.json` a la raíz
   - Sube `.env.plesk` y renómbralo a `.env`
   - Sube `.htaccess` a la raíz

---

## ⚙️ PASO 2: CONFIGURAR NODE.JS EN PLESK

### 2.1 Acceder a Node.js
1. En el panel de Plesk, busca **"Node.js"**
2. Click en **"Enable Node.js"** o **"Add Application"**

### 2.2 Configuración Básica
Completa los siguientes campos:

| Campo | Valor |
|-------|-------|
| **Node.js Version** | 18.x o superior |
| **Application Mode** | `production` |
| **Application Root** | `/solarland.gestsiete.es` |
| **Application Startup File** | `backend/dist/server.js` |
| **Application URL** | `https://solarland.gestsiete.es` |

### 2.3 Variables de Entorno
Click en **"Environment variables"** y añade TODAS estas (una por una):

```
NODE_ENV                = production
PORT                    = 3000
DB_HOST                 = gestsiete.es
DB_PORT                 = 5432
DB_USER                 = events_u
DB_PASSWORD             = events_pass$$
DB_NAME                 = events_n
JWT_SECRET              = CambiarPorUnValorSeguro2025!@#$%
JWT_EXPIRES_IN          = 24h
FRONTEND_URL            = https://solarland.gestsiete.es
BACKEND_URL             = https://solarland.gestsiete.es
SMTP_HOST               = smtp.gmail.com
SMTP_PORT               = 587
SMTP_SECURE             = false
SMTP_USER               = tu-email@gmail.com
SMTP_PASS               = tu-contraseña-app
EMAIL_FROM              = "SolarEdge Event" <noreply@solarland.gestsiete.es>
```

⚠️ **IMPORTANTE**:
- Cambia `JWT_SECRET` por un valor único y seguro
- Configura `SMTP_USER` y `SMTP_PASS` con credenciales reales

### 2.4 NPM Install
En la sección **"Run NPM Install"**:
1. Click en el botón **"NPM Install"**
2. Espera a que termine (puede tardar 2-3 minutos)
3. Verifica que diga "Successfully installed"

---

## 🌐 PASO 3: CONFIGURAR APACHE & NGINX

### 3.1 Ir a Configuración Web
1. En Plesk, ve a **"Apache & nginx Settings"**

### 3.2 Configuración de Nginx (COPIAR Y PEGAR)
En **"Additional nginx directives"**, pega TODO esto:

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
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}

# Health check
location = /health {
    proxy_pass http://127.0.0.1:3000/api/health;
}

# Servir Frontend React
location / {
    root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;
    try_files $uri $uri/ /index.html;
}

# Cache para assets
location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
    root /var/www/vhosts/gestsiete.es/solarland.gestsiete.es/frontend/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Compresión gzip
gzip on;
gzip_types text/plain text/css text/javascript application/javascript application/json;

# Seguridad
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 3.3 Aplicar Cambios
1. Click en **"OK"** o **"Apply"**
2. Los cambios se aplicarán automáticamente

---

## 🚀 PASO 4: INICIAR LA APLICACIÓN

### 4.1 Iniciar Node.js
1. Vuelve a **Node.js** en el panel
2. Click en **"Restart Application"** o **"Start"**
3. Espera 30 segundos
4. El estado debe cambiar a **"Running"**

### 4.2 Ver Logs (Si hay errores)
1. En Node.js, click en **"Show Logs"**
2. Busca mensajes como:
   - ✅ "Database connection established"
   - ✅ "Server running on port 3000"

---

## ✅ PASO 5: VERIFICACIÓN

### 5.1 Verificar API
Abre en tu navegador:
```
https://solarland.gestsiete.es/api/health
```

Deberías ver:
```json
{"status":"OK","timestamp":"2024-..."}
```

### 5.2 Verificar Frontend
Abre:
```
https://solarland.gestsiete.es
```

Deberías ver la página principal de la aplicación.

### 5.3 Verificar Funcionalidades
- [ ] La página carga correctamente
- [ ] El formulario de registro funciona
- [ ] Se pueden ver los eventos
- [ ] El login de admin funciona en `/admin`

---

## 🔧 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: "502 Bad Gateway"
**Solución**:
1. Ve a Node.js → Restart Application
2. Verifica que el puerto sea 3000
3. Revisa los logs

### Problema: "Cannot find module"
**Solución**:
1. Ve a Node.js → NPM Install
2. Click en "Run NPM Install" de nuevo
3. Restart Application

### Problema: "Database connection failed"
**Solución**:
1. Verifica las variables de entorno DB_*
2. Confirma que DB_PASSWORD = events_pass$$
3. Restart Application

### Problema: Frontend no carga
**Solución**:
1. Verifica que frontend/dist tenga index.html
2. Revisa la configuración de nginx
3. Limpia caché del navegador (Ctrl+F5)

### Problema: "Application could not be started"
**Solución**:
1. Verifica Application Startup File: `backend/dist/server.js`
2. Confirma que el archivo existe en File Manager
3. Revisa que Node.js version sea 18+

---

## 📝 NOTAS IMPORTANTES

### Rutas en el Servidor
Tu aplicación está en:
```
/var/www/vhosts/gestsiete.es/solarland.gestsiete.es/
```

### Archivos Críticos
- **Backend**: `/backend/dist/server.js` (punto de entrada)
- **Frontend**: `/frontend/dist/index.html` (página principal)
- **Config**: `/.env` (variables de entorno)

### Mantenimiento
Para actualizar la app en el futuro:
1. Compila nuevo build en local
2. Sube solo las carpetas `backend/dist` y `frontend/dist`
3. En Plesk: Node.js → Restart Application

---

## 📞 CHECKLIST FINAL

Antes de considerar terminado, verifica:

- [ ] Node.js muestra "Running"
- [ ] https://solarland.gestsiete.es carga
- [ ] https://solarland.gestsiete.es/api/health responde OK
- [ ] El formulario de registro funciona
- [ ] Los emails se envían (si configuraste SMTP)
- [ ] El panel admin en /admin es accesible
- [ ] SSL/HTTPS funciona correctamente

---

## 🎉 ¡LISTO!

Si todo funciona, tu aplicación está en producción en:
**https://solarland.gestsiete.es**

Para soporte adicional, revisa los logs en:
- Plesk → Node.js → Show Logs
- Plesk → Logs → Access/Error Logs