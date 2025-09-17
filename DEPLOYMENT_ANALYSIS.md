# 📊 ANÁLISIS COMPLETO - Event System (SolarEdge/Solarland)

## 🏗️ ARQUITECTURA DE LA APLICACIÓN

### Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS
- **Base de Datos**: PostgreSQL 14+ (remota en gestsiete.es)
- **ORM**: Knex.js
- **Autenticación**: JWT (jsonwebtoken)

### Estructura del Proyecto
```
Event-System/
├── backend/              # API REST en TypeScript
│   ├── src/             # Código fuente
│   │   ├── config/      # Configuración DB y app
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── database/    # Migraciones y seeds
│   │   ├── middleware/  # Auth, errores, validación
│   │   ├── models/      # Modelos de datos
│   │   ├── routes/      # Endpoints API
│   │   ├── services/    # Servicios (email, QR)
│   │   └── server.ts    # Entry point
│   ├── dist/            # JS compilado (generado)
│   └── package.json
├── frontend/            # SPA React
│   ├── src/            # Componentes y páginas
│   ├── dist/           # Build producción (generado)
│   └── package.json
└── package.json        # Scripts globales
```

## 🔑 CARACTERÍSTICAS PRINCIPALES

### Funcionalidades Core
1. **Sistema de Registro de Eventos**
   - Inscripción con formularios dinámicos
   - Generación de códigos QR únicos
   - Confirmación por email

2. **Panel de Administración**
   - Gestión de eventos y participantes
   - Exportación de datos (CSV)
   - Estadísticas en tiempo real
   - Control de capacidad

3. **Seguridad**
   - JWT authentication
   - Rate limiting (100 req/15min)
   - Helmet.js para headers seguros
   - Validación con express-validator
   - Encriptación con bcrypt

## 📦 DEPENDENCIAS CLAVE

### Backend (Principales)
```json
{
  "express": "^4.18.2",        # Framework web
  "typescript": "^5.3.3",       # Tipado estático
  "knex": "^3.1.0",            # Query builder
  "pg": "^8.11.3",             # Cliente PostgreSQL
  "jsonwebtoken": "^9.0.2",    # Autenticación
  "nodemailer": "^6.9.8",      # Envío emails
  "qrcode": "^1.5.3",          # Generación QR
  "helmet": "^7.1.0",          # Seguridad
  "cors": "^2.8.5"             # CORS handling
}
```

### Frontend (Principales)
```json
{
  "react": "^18.2.0",           # UI Framework
  "vite": "^5.0.11",           # Build tool
  "react-router-dom": "^6.21",  # Routing
  "axios": "^1.6.5",           # HTTP client
  "tailwindcss": "^3.4.1",     # Estilos
  "framer-motion": "^10.18",   # Animaciones
  "recharts": "^2.10.4"        # Gráficos
}
```

## 🗄️ BASE DE DATOS

### Conexión PostgreSQL
- **Host**: gestsiete.es
- **Puerto**: 5432
- **Database**: events_n
- **Usuario**: events_u
- **SSL**: Habilitado en producción

### Tablas Principales
- `users` - Usuarios administradores
- `events` - Eventos disponibles
- `registrations` - Inscripciones
- `event_configs` - Configuración dinámica

## 🌐 ENDPOINTS API

### Rutas Públicas
- `POST /api/auth/login` - Login admin
- `GET /api/events` - Lista eventos públicos
- `POST /api/registrations` - Nueva inscripción
- `GET /api/config/public` - Config pública

### Rutas Protegidas (JWT)
- `/api/admin/*` - Panel administración
- `/api/events/:id/registrations` - Gestión inscripciones
- `/api/admin/export` - Exportación datos

## 🔐 VARIABLES DE ENTORNO

### Requeridas para Producción
```bash
# Aplicación
NODE_ENV=production
PORT=3000

# Base de Datos
DB_HOST=gestsiete.es
DB_PORT=5432
DB_USER=events_u
DB_PASSWORD=events_pass$$
DB_NAME=events_n

# Seguridad
JWT_SECRET=[CAMBIAR_EN_PRODUCCIÓN]
JWT_EXPIRES_IN=24h

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[email@gmail.com]
SMTP_PASS=[app-password]

# URLs
FRONTEND_URL=https://solarland.gestsiete.es
BACKEND_URL=https://solarland.gestsiete.es
```

## 🚀 PROCESO DE BUILD

### Scripts de Compilación
1. **build.sh** - Script local para Plesk
2. **railway-build.sh** - Optimizado para Railway
3. **build.mjs** - Node.js build orchestrator

### Proceso de Build
```bash
1. Instalar dependencias raíz
2. Backend:
   - npm install
   - tsc (compilar TypeScript)
   - Genera: backend/dist/
3. Frontend:
   - npm install
   - vite build
   - Genera: frontend/dist/
4. Copiar frontend/dist → backend/public (Railway)
```

## 📈 OPTIMIZACIONES

### Performance
- Lazy loading en frontend
- Compresión gzip
- Cache de assets estáticos
- Pool de conexiones DB (min:2, max:10)
- Rate limiting por IP

### Seguridad
- CORS configurado para dominios específicos
- Headers de seguridad (Helmet)
- Validación de inputs
- SQL injection prevention (Knex)
- XSS protection

## 🎯 ESTADO ACTUAL

### Railway Deployment
- **Estado**: ✅ FUNCIONANDO
- **URL**: [Por configurar]
- **Build**: railway-build.sh
- **Start**: node backend/dist/server.js
- **Frontend**: Servido desde backend/public/

### Configuración Railway
```toml
[build]
builder = "nixpacks"
buildCommand = "./railway-build.sh"

[deploy]
startCommand = "node backend/dist/server.js"
healthcheckPath = "/api/health"
```

## 📋 CHECKLIST PARA DEPLOYMENT

### Pre-Deployment
- [x] Build exitoso local
- [x] Variables de entorno configuradas
- [x] Base de datos accesible
- [x] Migraciones ejecutadas

### Deployment (Plesk o Railway)
- [ ] Subir código al servidor
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias
- [ ] Ejecutar build
- [ ] Configurar proxy/nginx
- [ ] SSL/HTTPS activo
- [ ] Verificar health endpoint
- [ ] Test funcionalidades críticas

### Post-Deployment
- [ ] Monitoreo activo
- [ ] Logs configurados
- [ ] Backups automatizados
- [ ] Alertas configuradas

## 🔧 COMANDOS ÚTILES

```bash
# Desarrollo local
npm run dev              # Frontend + Backend paralelo

# Build producción
npm run build           # Build completo
npm run build:backend   # Solo backend
npm run build:frontend  # Solo frontend

# Base de datos
npm run db:migrate      # Ejecutar migraciones
npm run db:seed        # Cargar datos iniciales

# Testing
npm test               # Tests completos
npm run test:backend   # Solo backend
npm run test:frontend  # Solo frontend
```

## 📊 MÉTRICAS

### Tamaño del Build
- Backend: ~2MB (dist compilado)
- Frontend: ~1.5MB (bundle optimizado)
- Total: ~3.5MB + node_modules

### Requisitos del Servidor
- Node.js: >=18.0.0
- NPM: >=9.0.0
- RAM: Mínimo 512MB, recomendado 1GB
- Disco: 1GB para app + logs

## 🚨 PUNTOS CRÍTICOS

1. **JWT_SECRET** debe cambiarse en producción
2. **SMTP** requiere configuración real
3. **SSL** obligatorio para producción
4. **Migraciones** deben ejecutarse antes del deploy
5. **CORS** configurado para dominio específico

## 🎯 RECOMENDACIONES

### Para Plesk
1. Usar Node.js Application Manager
2. Configurar Nginx como proxy reverso
3. Habilitar PM2 para auto-restart
4. Configurar logs en /logs

### Para Railway
1. Usar variables de entorno del dashboard
2. Habilitar health checks
3. Configurar auto-deploy desde GitHub
4. Monitorear métricas en dashboard

---

**Última actualización**: Septiembre 2025
**Versión**: 1.0.0
**Estado**: LISTO PARA PRODUCCIÓN