# 🚂 Guía de Despliegue en Railway

## 🎯 Configuración Rápida

### 1. Conectar con GitHub

1. Ir a [Railway.app](https://railway.app)
2. Iniciar sesión con GitHub
3. Crear nuevo proyecto: **"New Project"** → **"Deploy from GitHub repo"**
4. Seleccionar: `gest7seguridad/Event-System`
5. Railway detectará automáticamente la configuración

### 2. Variables de Entorno

En Railway Dashboard → **Variables** → Añadir todas estas:

```env
# Base de datos PostgreSQL (Railway o Externa)
DB_HOST=gestsiete.es
DB_PORT=5432
DB_USER=events_u
DB_PASSWORD=events_pass$
DB_NAME=events_n

# Seguridad
JWT_SECRET=Railway2025SecureToken!@#$%^&*()
JWT_EXPIRES_IN=24h

# URLs (Railway te dará el dominio)
FRONTEND_URL=https://tu-app.up.railway.app
BACKEND_URL=https://tu-app.up.railway.app

# SMTP Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM="SolarEdge Event" <noreply@solarland.es>

# Configuración
NODE_ENV=production
PORT=${{PORT}}
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Base de Datos

#### Opción A: Usar PostgreSQL de Railway (Recomendado)
1. En tu proyecto → **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway creará automáticamente las variables:
   - `DATABASE_URL`
   - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Actualizar las variables DB_* con estos valores

#### Opción B: Usar BD Externa (gestsiete.es)
- Mantener las variables como están arriba

### 4. Configurar Dominio Personalizado (Opcional)

1. En **Settings** → **Domains**
2. Añadir dominio personalizado: `events.tudominio.com`
3. Configurar DNS con CNAME apuntando a Railway

## 📁 Archivos de Configuración

El proyecto incluye estos archivos para Railway:

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build:railway"
  },
  "deploy": {
    "startCommand": "npm run start:production",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "postgresql"]

[phases.install]
cmds = [
  "npm install",
  "cd backend && npm install",
  "cd frontend && npm install"
]

[phases.build]
cmds = [
  "cd backend && npm run build",
  "cd frontend && npm run build"
]

[start]
cmd = "node backend/dist/server.js"
```

### `Procfile`
```
web: node backend/dist/server.js
release: cd backend && npx knex migrate:latest
```

## 🚀 Deploy Automático

Railway desplegará automáticamente cuando:
1. Hagas push a la rama `main` en GitHub
2. El build se complete exitosamente
3. Las migraciones de BD se ejecuten

## 📊 Monitoreo

### Ver Logs
- Dashboard → Tu proyecto → **Logs**
- Filtrar por: `error`, `info`, `warn`

### Métricas
- Dashboard → **Metrics**
- Ver: CPU, Memoria, Red

### Health Check
```bash
curl https://tu-app.up.railway.app/api/health
```

## 🔧 Comandos Útiles

### Ejecutar comandos en Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ver logs
railway logs

# Ejecutar comandos
railway run npm run db:migrate
railway run npm run db:seed

# Variables de entorno
railway variables
```

## 🐛 Solución de Problemas

### Error: "tsc: not found"
✅ **Solucionado**: TypeScript movido a dependencies

### Error: "Cannot find module"
```bash
# Reconstruir en Railway
railway run npm run build:railway
```

### Error: Base de datos no conecta
1. Verificar variables de entorno en Railway
2. Si usas Railway PostgreSQL, usar `DATABASE_URL`
3. Verificar firewall si es BD externa

### Frontend no se sirve correctamente
Railway sirve archivos estáticos desde Express:
- Los archivos están en `frontend/dist`
- Express los sirve desde el backend

## 📝 Scripts Disponibles

```json
{
  "start": "node backend/dist/server.js",
  "build:railway": "npm run install:all && npm run build:backend && npm run build:frontend",
  "install:all": "npm install && cd backend && npm install && cd ../frontend && npm install"
}
```

## ✅ Checklist de Despliegue

- [ ] Repositorio conectado con Railway
- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada (Railway o externa)
- [ ] Build exitoso sin errores
- [ ] Migraciones ejecutadas
- [ ] Health check respondiendo
- [ ] Frontend accesible
- [ ] API funcionando
- [ ] Emails enviándose correctamente
- [ ] Admin puede hacer login

## 🌐 URLs de Producción

Después del deploy:
- **App**: `https://tu-app.up.railway.app`
- **API**: `https://tu-app.up.railway.app/api`
- **Health**: `https://tu-app.up.railway.app/api/health`
- **Admin**: `https://tu-app.up.railway.app/admin`

## 💡 Tips para Railway

1. **Límites Free Tier**:
   - 500 horas/mes de ejecución
   - $5 USD de crédito mensual
   - Sleeps después de inactividad

2. **Optimización de Costos**:
   - Usar variables de entorno para todo
   - Configurar health checks
   - Monitorear uso de recursos

3. **Seguridad**:
   - Nunca hardcodear secretos
   - Usar Railway Secrets para datos sensibles
   - Rotar JWT_SECRET regularmente

## 🔄 Actualización del Código

```bash
# Hacer cambios localmente
git add .
git commit -m "Update: descripción"
git push origin main

# Railway desplegará automáticamente
```

## 📞 Soporte

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Status Page](https://status.railway.app)

---

¡Tu aplicación está lista para producción en Railway! 🎉