# 🚨 SOLUCIÓN PARA ERROR 502 EN PLESK

## ⚡ Instrucciones Rápidas

### 1️⃣ Descargar los nuevos archivos desde GitHub

En tu computadora:
```bash
git pull origin main
```

### 2️⃣ Archivos a subir a Plesk

Sube estos archivos a la raíz de `/solarland.gestsiete.es/`:

1. **server.js** (NUEVO - archivo principal)
2. **package.json** (actualizado)
3. **package-lock.json** (actualizado)
4. **frontend/dist/** (carpeta completa compilada)
5. **.env** con esta configuración:

```env
# Base de datos
DB_HOST=server.radioinsular.es
DB_PORT=5432
DB_NAME=eventos_n
DB_USER=eventos_u
DB_PASSWORD=eventos_pass
DB_SSL=false

# JWT
JWT_SECRET=SolarLand2025ProductionToken!@#$%^&*()_+SecureKey

# Puerto
PORT=3000

# Entorno
NODE_ENV=production
```

### 3️⃣ En el Panel de Plesk - Node.js

1. Ve a **Websites & Domains** → **solarland.gestsiete.es**
2. Click en **Node.js**
3. Configura:
   - **Application Root**: `/solarland.gestsiete.es`
   - **Application Startup File**: `server.js` (IMPORTANTE: cambiar de backend/dist/server.js a server.js)
   - **Node.js version**: 18 o superior

### 4️⃣ Variables de Entorno en Plesk

En la sección **Application Variables**, añadir:

| Variable | Valor |
|----------|-------|
| DB_HOST | server.radioinsular.es |
| DB_PORT | 5432 |
| DB_NAME | eventos_n |
| DB_USER | eventos_u |
| DB_PASSWORD | eventos_pass |
| JWT_SECRET | SolarLand2025ProductionToken!@#$%^&*()_+SecureKey |
| NODE_ENV | production |
| PORT | 3000 |

### 5️⃣ Instalar Dependencias

En Plesk, sección Node.js:
1. Click en **NPM Install**
2. Esperar a que termine

O si tienes acceso SSH:
```bash
cd /var/www/vhosts/gestsiete.es/solarland.gestsiete.es
npm install
```

### 6️⃣ Reiniciar la Aplicación

1. En la sección Node.js de Plesk
2. Click en **Restart Application**
3. Verificar el estado (debe decir "Running")

## 🔍 Verificación

### Test 1: API Health Check
Abre en tu navegador:
```
https://solarland.gestsiete.es/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2025-09-17T...",
  "database": "server.radioinsular.es",
  "environment": "production"
}
```

### Test 2: Login
1. Ve a https://solarland.gestsiete.es/admin
2. Usa las credenciales:
   - Email: `admin@solarland.com`
   - Contraseña: `admin123456`

## 🛠️ Si sigue sin funcionar

### Opción A: Verificar Logs
En Plesk, sección Node.js:
1. Click en **Show Logs**
2. Buscar errores

### Opción B: Verificar Puerto
El servidor DEBE ejecutarse en el puerto que Plesk espera (generalmente 3000).

### Opción C: Verificar Proxy
En Apache/Nginx config, debe existir:
```
ProxyPass /api http://localhost:3000/api
ProxyPassReverse /api http://localhost:3000/api
```

## 📝 Estructura de Archivos en el Servidor

```
/solarland.gestsiete.es/
├── server.js               ← ARCHIVO PRINCIPAL (nuevo)
├── package.json
├── package-lock.json
├── .env
├── frontend/
│   └── dist/              ← Frontend compilado
│       ├── index.html
│       ├── assets/
│       └── ...
└── node_modules/          ← Se crea con npm install
```

## 🔑 Información Importante

### Base de Datos
- **Servidor**: server.radioinsular.es
- **BD**: eventos_n
- **Usuario**: eventos_u
- **Pass**: eventos_pass

### Admin
- **Email**: admin@solarland.com
- **Pass**: admin123456

## ⚠️ Errores Comunes

### Error 502 Bad Gateway
- El servidor Node.js no está corriendo
- Solución: Reiniciar aplicación en Plesk

### Error 503 Service Unavailable
- Puerto incorrecto o aplicación caída
- Solución: Verificar que PORT=3000 en variables

### Cannot find module
- Faltan dependencias
- Solución: Ejecutar NPM Install en Plesk

### ECONNREFUSED database
- No puede conectar a la BD
- Solución: Verificar credenciales de BD

---

**IMPORTANTE**: El archivo `server.js` es un servidor completo que:
- Sirve el frontend desde `/frontend/dist`
- Maneja todas las rutas API (`/api/*`)
- Conecta con la base de datos PostgreSQL
- No requiere compilación TypeScript
- Funciona directamente con `node server.js`