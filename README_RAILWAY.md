# 🚂 Despliegue en Railway

## Configuración para Railway

Este proyecto está preparado para desplegarse en Railway con la base de datos PostgreSQL remota.

## Variables de Entorno Requeridas

Configura estas variables en el dashboard de Railway:

```env
# Base de datos remota
DB_HOST=gestsiete.es
DB_PORT=5432
DB_NAME=events_n
DB_USER=events_u
DB_PASSWORD=events_pass$$

# JWT Secret (genera uno nuevo)
JWT_SECRET=tu-secret-key-aqui

# Frontend URL (Railway lo asigna automáticamente)
FRONTEND_URL=${{RAILWAY_STATIC_URL}}

# CORS
CORS_ORIGINS=${{RAILWAY_STATIC_URL}}

# API URL para el frontend
VITE_API_URL=${{RAILWAY_STATIC_URL}}/api
```

## Pasos para Desplegar

### 1. Preparar el Repositorio

```bash
# Inicializar git si no existe
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Preparar para Railway"

# Crear repositorio en GitHub
gh repo create solaredge-event-railway --public

# Push al repositorio
git push -u origin main
```

### 2. Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio `solaredge-event-railway`

### 3. Configurar Variables de Entorno

En el dashboard de Railway:

1. Click en tu servicio
2. Ve a la pestaña "Variables"
3. Agrega todas las variables del archivo `.env.railway`
4. **IMPORTANTE**: Actualiza `DB_PASSWORD` con la contraseña correcta

### 4. Configurar el Dominio

1. En la pestaña "Settings"
2. Genera un dominio público
3. Copia la URL generada
4. Actualiza las variables `FRONTEND_URL` y `VITE_API_URL` con esta URL

### 5. Deploy

Railway desplegará automáticamente cuando:
- Hagas push a la rama main
- Cambies variables de entorno
- Manualmente desde el dashboard

## Comandos Útiles

```bash
# Ver logs
railway logs

# Ejecutar comandos en el contenedor
railway run npm run db:migrate:prod

# Variables locales
railway variables
```

## Estructura del Proyecto

```
solaredge-event/
├── backend/           # API Node.js/Express
├── frontend/          # React/Vite App
├── railway.json       # Configuración Railway
├── nixpacks.toml     # Build configuration
└── package.json       # Scripts principales
```

## Base de Datos

El proyecto usa la base de datos PostgreSQL remota en `gestsiete.es`.

### Migraciones

Las migraciones se ejecutan automáticamente en el build, pero puedes ejecutarlas manualmente:

```bash
railway run cd backend && NODE_ENV=production npm run db:migrate
```

## Troubleshooting

### Error de Conexión a BD

Si hay error de autenticación con la base de datos:

1. Verifica que `DB_PASSWORD` esté correcta en Railway
2. Prueba con diferentes valores:
   - `events_pass$$`
   - `events_pass`
   - Contacta al administrador para la contraseña correcta

### Build Fallido

Si el build falla:

1. Verifica los logs en Railway
2. Asegúrate que todas las dependencias estén en `package.json`
3. Revisa que TypeScript compile sin errores localmente

### CORS Issues

Si hay problemas de CORS:

1. Verifica que `FRONTEND_URL` tenga la URL correcta de Railway
2. Actualiza `CORS_ORIGINS` con todos los dominios permitidos

## Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de uso
- Alertas de errores
- Estado del servicio

## Costos

Railway ofrece:
- $5 USD de crédito gratis al mes
- Ideal para proyectos pequeños/medianos
- Escala automáticamente según demanda

## Soporte

- [Documentación Railway](https://docs.railway.app)
- [Discord Railway](https://discord.gg/railway)
- [Status Page](https://railway.instatus.com)