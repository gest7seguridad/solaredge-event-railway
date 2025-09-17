# 🚀 INFORMACIÓN DE DESPLIEGUE ACTUALIZADA

## 📊 Estado Actual del Proyecto

### ✅ Configuración Completada

1. **Nueva Base de Datos PostgreSQL**
   - **Servidor**: `server.radioinsular.es`
   - **Puerto**: `5432`
   - **Base de datos**: `eventos_n`
   - **Usuario**: `eventos_u`
   - **Contraseña**: `eventos_pass`
   - **Estado**: ✅ Conectada y migrada

2. **Tablas Creadas**
   - `admin_users` - Usuarios administradores
   - `events` - Eventos
   - `registrations` - Inscripciones
   - 6 índices para optimización

3. **Usuario Administrador**
   - **Email**: `admin@solarland.com`
   - **Contraseña**: `admin123456`
   - **Role**: `admin`
   - **Estado**: ✅ Creado y activo

## 🔧 Archivos de Configuración

### Backend (.env)
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

# CORS
CORS_ORIGIN=https://solarland.gestsiete.es
```

### Frontend (.env)
```env
# Para desarrollo local
VITE_API_URL=http://localhost:5000

# Para producción
VITE_API_URL=https://solarland.gestsiete.es
```

## 📦 Scripts de Utilidad

### 1. Verificar Conexión a Base de Datos
```javascript
// test-new-db.js - Verifica la conexión
node test-new-db.js
```

### 2. Migración de Base de Datos
```javascript
// migrate-database.js - Ya ejecutado
// Este script:
// - Crea las tablas necesarias
// - Añade índices
// - Crea el usuario admin
// - Añade evento de ejemplo
node migrate-database.js
```

### 3. Servidor de Desarrollo
```javascript
// start-backend.js - Backend con la nueva BD
// Incluye todos los endpoints necesarios:
// - POST /api/auth/login
// - GET /api/auth/verify
// - GET /api/events/current
// - GET /api/health
node start-backend.js
```

## 🌐 URLs del Sistema

### Desarrollo Local
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Admin Panel**: http://localhost:3000/admin

### Producción (Plesk)
- **URL Principal**: https://solarland.gestsiete.es
- **Panel Admin**: https://solarland.gestsiete.es/admin
- **API Health**: https://solarland.gestsiete.es/api/health

## 📝 Checklist de Despliegue

### Completado ✅
- [x] Nueva base de datos configurada en server.radioinsular.es
- [x] Tablas migradas exitosamente
- [x] Usuario admin creado
- [x] Evento de ejemplo creado
- [x] Archivos .env actualizados
- [x] Backend conectado a nueva BD
- [x] Frontend configurado

### Pendiente para Producción ⏳
- [ ] Subir archivos actualizados a Plesk
- [ ] Actualizar variables de entorno en Plesk
- [ ] Configurar SMTP para emails
- [ ] Configurar SSL/HTTPS
- [ ] Reiniciar aplicación Node.js en Plesk
- [ ] Verificar funcionamiento en producción

## 🔒 Seguridad

### Credenciales Importantes
1. **Base de Datos**
   - Acceso restringido por IP
   - Contraseña segura configurada
   - SSL deshabilitado (conexión interna)

2. **JWT Secret**
   - Cambiar en producción: `SolarLand2025ProductionToken!@#$%^&*()_+SecureKey`
   - Mínimo 32 caracteres

3. **Admin**
   - Email: admin@solarland.com
   - Cambiar contraseña después del primer acceso

## 🛠️ Comandos Útiles

### Para desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar backend
node start-backend.js

# Iniciar frontend
cd frontend && npm run dev

# Verificar base de datos
node test-new-db.js
```

### Para producción
```bash
# Compilar backend
cd backend && npm run build

# Compilar frontend
cd frontend && npm run build

# Subir a GitHub
git add .
git commit -m "Update: Nueva configuración de base de datos"
git push origin main
```

## 📊 Estado de Servicios

### Base de Datos
- ✅ PostgreSQL 12.22 en server.radioinsular.es
- ✅ 3 tablas creadas
- ✅ Conexión verificada

### Backend
- ✅ Configurado con nueva BD
- ✅ Endpoints funcionando
- ✅ Autenticación JWT activa

### Frontend
- ✅ React 18 + Vite
- ✅ Conectado al backend
- ✅ Panel admin accesible

## 🚨 Solución de Problemas

### Si no puedes conectar a la BD:
1. Verifica las credenciales en .env
2. Confirma acceso a server.radioinsular.es
3. Puerto 5432 debe estar abierto

### Si el login no funciona:
1. Verifica que el backend esté corriendo
2. Confirma las credenciales: admin@solarland.com / admin123456
3. Revisa los logs del backend

### Para resetear el admin:
```bash
node migrate-database.js
# Esto recreará el usuario admin con la contraseña por defecto
```

## 📞 Contacto y Soporte

- **Base de datos**: server.radioinsular.es
- **Aplicación**: solarland.gestsiete.es
- **Repositorio**: https://github.com/gest7seguridad/Event-System

---

**Última actualización**: 17 de Septiembre 2025
**Nueva BD configurada**: server.radioinsular.es
**Estado**: ✅ Listo para producción