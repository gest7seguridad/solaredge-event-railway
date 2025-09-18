# 🏗️ ARQUITECTURA DE LA APLICACIÓN - Sistema de Inscripción de Eventos

## 📊 Visión General

Sistema full-stack para gestión de inscripciones a eventos con arquitectura cliente-servidor, desarrollado con tecnologías modernas y desplegado en Plesk con base de datos PostgreSQL remota.

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                   React 18 + TypeScript                      │
│                     (Puerto: 3000)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/HTTPS
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                  Node.js + Express                           │
│                     (Puerto: 5000)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │ PostgreSQL Protocol
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      BASE DE DATOS                           │
│                PostgreSQL 12.22 (Remota)                     │
│              server.radioinsular.es:5432                     │
└─────────────────────────────────────────────────────────────┘
```

## 🗂️ Estructura de Directorios

```
Event-System/
├── 📁 frontend/                    # Aplicación React
│   ├── 📁 src/
│   │   ├── 📁 components/         # Componentes React
│   │   │   ├── AdminDashboard.tsx # Panel de administración
│   │   │   ├── AdminLogin.tsx     # Login de admin
│   │   │   ├── CheckInScanner.tsx # Scanner QR para check-in
│   │   │   ├── EventDetails.tsx   # Detalles del evento
│   │   │   ├── RegistrationForm.tsx # Formulario de inscripción
│   │   │   └── WhatsAppSender.tsx # Integración WhatsApp
│   │   ├── 📁 services/
│   │   │   └── api.ts             # Cliente API
│   │   ├── 📁 styles/
│   │   │   └── index.css          # Estilos Tailwind
│   │   ├── App.tsx                # Componente principal
│   │   └── main.tsx               # Punto de entrada
│   ├── 📁 dist/                   # Build de producción
│   ├── package.json               # Dependencias frontend
│   └── vite.config.ts             # Configuración Vite
│
├── 📁 backend/                     # API REST Node.js
│   ├── 📁 src/
│   │   ├── 📁 routes/
│   │   │   ├── auth.ts           # Rutas de autenticación
│   │   │   ├── events.ts         # Rutas de eventos
│   │   │   └── registrations.ts  # Rutas de inscripciones
│   │   ├── 📁 middleware/
│   │   │   ├── auth.ts           # Middleware JWT
│   │   │   └── errorHandler.ts   # Manejo de errores
│   │   ├── 📁 utils/
│   │   │   ├── emailService.ts   # Servicio de email
│   │   │   └── qrGenerator.ts    # Generador de QR
│   │   ├── database.ts           # Conexión a PostgreSQL
│   │   └── server.ts             # Servidor Express
│   ├── 📁 dist/                  # Build TypeScript compilado
│   └── package.json              # Dependencias backend
│
├── 📄 app.js                      # Servidor de producción Plesk
├── 📄 server.js                   # Servidor alternativo
├── 📄 package.json                # Dependencias principales
├── 📄 .env                        # Variables de entorno
├── 📄 .env.production             # Variables de producción
└── 📄 migrate-database.js         # Script de migración DB
```

## 🔧 Stack Tecnológico

### Frontend
- **Framework**: React 18.2
- **Lenguaje**: TypeScript 5.2
- **Bundler**: Vite 5.4
- **Estilos**: Tailwind CSS 3.4
- **Estado**: React Query + Context API
- **Routing**: React Router 6
- **Animaciones**: Framer Motion
- **Gráficos**: Recharts
- **QR Scanner**: React QR Scanner
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5.1
- **Lenguaje**: TypeScript (desarrollo) / JavaScript (producción)
- **Base de Datos**: PostgreSQL 12.22
- **ORM**: pg (node-postgres)
- **Autenticación**: JWT (jsonwebtoken)
- **Encriptación**: bcryptjs
- **Email**: Nodemailer
- **QR Generation**: qrcode
- **CORS**: cors middleware
- **Rate Limiting**: express-rate-limit

### DevOps & Deployment
- **Hosting**: Plesk (solarland.gestsiete.es)
- **Process Manager**: PM2 / Plesk Node.js
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (opcional)

## 🌐 Arquitectura de Red

### Producción
```
Usuario → HTTPS → solarland.gestsiete.es
                           ↓
                    Nginx/Apache (Proxy)
                           ↓
                 Node.js App (Puerto 3000)
                           ↓
              PostgreSQL (server.radioinsular.es:5432)
```

### Desarrollo Local
```
Usuario → HTTP → localhost:3000 (Frontend Vite)
                       ↓
               localhost:5000 (Backend Express)
                       ↓
              PostgreSQL (Remota)
```

## 📡 API REST Endpoints

### Autenticación
- `POST /api/auth/login` - Login de administrador
- `GET /api/auth/verify` - Verificar token JWT
- `POST /api/auth/logout` - Cerrar sesión

### Eventos
- `GET /api/events` - Listar eventos
- `GET /api/events/current` - Evento activo actual
- `GET /api/events/:id` - Detalles de evento
- `POST /api/events` - Crear evento (admin)
- `PUT /api/events/:id` - Actualizar evento (admin)
- `DELETE /api/events/:id` - Eliminar evento (admin)

### Inscripciones
- `GET /api/registrations` - Listar inscripciones (admin)
- `GET /api/registrations/:id` - Detalles de inscripción
- `POST /api/registrations` - Nueva inscripción
- `PUT /api/registrations/:id/confirm` - Confirmar inscripción
- `POST /api/registrations/:id/checkin` - Check-in con QR
- `DELETE /api/registrations/:id` - Cancelar inscripción

### Utilidades
- `GET /api/health` - Estado del servidor
- `POST /api/email/test` - Test de configuración SMTP
- `GET /api/stats` - Estadísticas del evento

## 💾 Base de Datos

### Esquema de Tablas

#### admin_users
```sql
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### events
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    capacity INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### registrations
```sql
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(100),
    distributor BOOLEAN DEFAULT false,
    country VARCHAR(100),
    gdpr_consent BOOLEAN DEFAULT false,
    is_confirmed BOOLEAN DEFAULT false,
    confirmation_token VARCHAR(255),
    qr_code TEXT,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, email)
);
```

### Índices
- `idx_admin_users_email` - Búsqueda rápida por email
- `idx_events_date` - Ordenamiento por fecha
- `idx_events_active` - Filtrado de eventos activos
- `idx_registrations_event` - Inscripciones por evento
- `idx_registrations_email` - Búsqueda por email
- `idx_registrations_token` - Validación de tokens

## 🔐 Seguridad

### Autenticación y Autorización
- **JWT Tokens**: Expiración 24h
- **Bcrypt**: Salt rounds = 10
- **CORS**: Configurado para dominios específicos
- **Rate Limiting**: 100 requests/15min por IP

### Headers de Seguridad
```javascript
app.use(helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: true,
    xssFilter: true
}));
```

### Validación de Datos
- Input sanitization en frontend y backend
- Validación de esquemas con express-validator
- Prepared statements para consultas SQL
- Escape de caracteres especiales

## 🚀 Flujos de Trabajo

### Flujo de Inscripción
```
1. Usuario accede al formulario
2. Completa datos personales
3. Acepta términos GDPR
4. Submit → POST /api/registrations
5. Backend valida datos
6. Genera QR único
7. Guarda en base de datos
8. Envía email con QR
9. Retorna confirmación
```

### Flujo de Check-in
```
1. Admin accede al scanner
2. Escanea QR del asistente
3. POST /api/registrations/:id/checkin
4. Valida token
5. Marca checked_in = true
6. Registra timestamp
7. Muestra confirmación
```

### Flujo de Autenticación Admin
```
1. Admin accede a /admin
2. Ingresa credenciales
3. POST /api/auth/login
4. Valida contra bcrypt hash
5. Genera JWT token
6. Almacena en localStorage
7. Incluye en headers de requests
8. Backend valida con middleware
```

## 🔄 Estados de la Aplicación

### Frontend State Management
```typescript
// Context Global
AuthContext: {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// React Query Cache
- events (5 min TTL)
- registrations (1 min TTL)
- stats (30 sec TTL)
```

### Backend Session Management
- Stateless (JWT based)
- Token en Authorization header
- Refresh automático antes de expirar

## 📦 Servicios Node.js

### Servidor Principal (app.js)
```javascript
// Servicios activos
- Express Server (Puerto 3000)
- Static File Server (frontend/dist)
- API Router (/api/*)
- Database Connection Pool
- Error Handler Middleware
```

### Servicios Auxiliares
- **Email Service**: Nodemailer con SMTP
- **QR Generator**: Genera códigos únicos
- **WhatsApp Integration**: Protocolo wa.me
- **File Upload**: Multer para logos
- **Logging**: Winston/Morgan

## 🔧 Variables de Entorno

### Producción
```env
NODE_ENV=production
PORT=3000

# Database
DB_HOST=server.radioinsular.es
DB_PORT=5432
DB_NAME=eventos_n
DB_USER=eventos_u
DB_PASSWORD=eventos_pass

# JWT
JWT_SECRET=SolarLand2025ProductionToken

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app_password

# URLs
FRONTEND_URL=https://solarland.gestsiete.es
BACKEND_URL=https://solarland.gestsiete.es
```

## 📈 Monitoreo y Logs

### Logs del Sistema
- `/logs/app.log` - Logs generales
- `/logs/error.log` - Errores
- `/logs/access.log` - Accesos HTTP

### Métricas
- Registros totales
- Check-ins realizados
- Tasa de confirmación
- Tiempo de respuesta API
- Uptime del servidor

## 🔄 CI/CD Pipeline

### Build Process
```bash
# Frontend
cd frontend
npm install
npm run build → dist/

# Backend
cd backend
npm install
npm run build → dist/

# Deploy
git push → GitHub
Plesk pull → Deploy
```

## 🎯 Optimizaciones

### Performance
- Lazy loading de componentes React
- Code splitting con Vite
- Compresión gzip
- Cache headers
- Connection pooling PostgreSQL
- Índices de base de datos

### Escalabilidad
- Horizontal scaling con PM2 cluster
- CDN para assets estáticos
- Rate limiting por endpoint
- Query optimization
- Pagination en listados

## 📝 Consideraciones de Despliegue

### Requisitos Mínimos
- Node.js 18+
- 2GB RAM
- 10GB almacenamiento
- PostgreSQL 12+
- SSL certificado

### Checklist de Producción
- [x] Variables de entorno configuradas
- [x] Base de datos migrada
- [x] Build de producción generado
- [x] SSL/HTTPS configurado
- [x] Backup automatizado
- [x] Monitoreo activo
- [x] Rate limiting habilitado
- [x] Logs configurados

---

**Última actualización**: Septiembre 2025
**Versión**: 1.0.0
**Mantenedor**: Solarland Development Team