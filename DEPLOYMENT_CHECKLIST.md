# ✅ CHECKLIST DE DEPLOYMENT - SOLARLAND EVENT SYSTEM

## 📋 PRE-DEPLOYMENT (Local)

### Build y Compilación
- [ ] Ejecutar `./build-plesk.sh` exitosamente
- [ ] Verificar que existe `backend/dist/server.js`
- [ ] Verificar que existe `frontend/dist/index.html`
- [ ] No hay errores en el proceso de build

### Configuración
- [ ] Editar `.env.plesk` con valores reales
- [ ] Cambiar `JWT_SECRET` por valor seguro único
- [ ] Configurar credenciales SMTP reales
- [ ] Verificar rutas del subdominio en `.env.plesk`

### Archivos Requeridos
- [ ] `backend/dist/` (carpeta completa)
- [ ] `frontend/dist/` (carpeta completa)
- [ ] `backend/package.json`
- [ ] `package.json` (principal)
- [ ] `.env.plesk` (renombrar a `.env`)
- [ ] `.htaccess`
- [ ] `nginx-plesk-node.conf` (para referencia)

---

## 🚀 DEPLOYMENT (En Plesk)

### 1. Subida de Archivos
- [ ] Crear carpeta `/solarland.gestsiete.es/backend/`
- [ ] Crear carpeta `/solarland.gestsiete.es/frontend/`
- [ ] Crear carpeta `/solarland.gestsiete.es/logs/`
- [ ] Crear carpeta `/solarland.gestsiete.es/uploads/`
- [ ] Subir `backend/dist/` → `/backend/dist/`
- [ ] Subir `frontend/dist/` → `/frontend/dist/`
- [ ] Subir `package.json` a raíz
- [ ] Subir `backend/package.json` → `/backend/`
- [ ] Subir `.env.plesk` como `.env`
- [ ] Subir `.htaccess` a raíz

### 2. Configuración Node.js
- [ ] Node.js version: 18.x o superior
- [ ] Application Mode: `production`
- [ ] Application Root: `/solarland.gestsiete.es`
- [ ] Startup File: `backend/dist/server.js`
- [ ] Application URL: `https://solarland.gestsiete.es`

### 3. Variables de Entorno
- [ ] NODE_ENV = production
- [ ] PORT = 3000
- [ ] DB_HOST = gestsiete.es
- [ ] DB_PORT = 5432
- [ ] DB_USER = events_u
- [ ] DB_PASSWORD = events_pass$$
- [ ] DB_NAME = events_n
- [ ] JWT_SECRET = [VALOR_SEGURO_ÚNICO]
- [ ] JWT_EXPIRES_IN = 24h
- [ ] FRONTEND_URL = https://solarland.gestsiete.es
- [ ] BACKEND_URL = https://solarland.gestsiete.es
- [ ] SMTP_HOST = [configurado]
- [ ] SMTP_PORT = [configurado]
- [ ] SMTP_USER = [configurado]
- [ ] SMTP_PASS = [configurado]
- [ ] EMAIL_FROM = [configurado]

### 4. NPM Install
- [ ] Ejecutar NPM Install desde panel
- [ ] Verificar "Successfully installed"
- [ ] No hay errores en los logs

### 5. Configuración Web Server
- [ ] Pegar configuración nginx en "Additional nginx directives"
- [ ] Aplicar cambios
- [ ] No hay errores de sintaxis

### 6. Iniciar Aplicación
- [ ] Click en "Start" o "Restart Application"
- [ ] Estado muestra "Running"
- [ ] Logs muestran "Server running on port 3000"
- [ ] Logs muestran "Database connection established"

---

## ✔️ POST-DEPLOYMENT (Verificación)

### Tests Básicos
- [ ] https://solarland.gestsiete.es carga correctamente
- [ ] https://solarland.gestsiete.es/api/health responde `{"status":"OK"}`
- [ ] No hay errores 404 o 502
- [ ] SSL/HTTPS funciona correctamente

### Funcionalidades Core
- [ ] Página principal se visualiza
- [ ] Lista de eventos aparece
- [ ] Formulario de registro funciona
- [ ] Se genera código QR al registrarse
- [ ] Login admin en `/admin` funciona
- [ ] Panel de administración accesible
- [ ] Exportación CSV funciona
- [ ] Emails se envían (si SMTP configurado)

### Performance
- [ ] Página carga en menos de 3 segundos
- [ ] Assets estáticos tienen cache headers
- [ ] Gzip compression activo
- [ ] No hay errores en consola del navegador

### Seguridad
- [ ] HTTPS forzado
- [ ] Headers de seguridad presentes
- [ ] Archivos .env no accesibles públicamente
- [ ] Rate limiting funcionando

### Base de Datos
- [ ] Conexión a PostgreSQL exitosa
- [ ] Tablas creadas correctamente
- [ ] Migraciones aplicadas
- [ ] Datos de prueba cargados (si aplica)

---

## 🔧 TROUBLESHOOTING

### Si algo falla, verificar:
- [ ] Logs en Node.js → Show Logs
- [ ] Logs del servidor en Plesk → Logs
- [ ] Puerto 3000 no está bloqueado
- [ ] Credenciales de BD correctas
- [ ] Node.js versión 18+
- [ ] Paths correctos para el subdominio

---

## 📝 NOTAS FINALES

### Información del Deployment
- **URL**: https://solarland.gestsiete.es
- **Servidor**: Plesk en gestsiete.es
- **Node.js Port**: 3000
- **Database**: PostgreSQL en gestsiete.es
- **Carpeta**: `/var/www/vhosts/gestsiete.es/solarland.gestsiete.es/`

### Para Actualizaciones Futuras
1. Hacer build local nuevo
2. Subir solo `backend/dist/` y `frontend/dist/`
3. Restart Application en Plesk
4. Verificar funcionamiento

### Contactos
- **Soporte Hosting**: [contacto de gestsiete.es]
- **Desarrollo**: [tu contacto]
- **Cliente**: Solarland

---

## 🎉 DEPLOYMENT COMPLETADO

Fecha: _______________
Hora: _______________
Realizado por: _______________
Versión: 1.0.0

**URL en Producción**: https://solarland.gestsiete.es

---

### Firma de Conformidad

- [ ] Todos los puntos del checklist completados
- [ ] Aplicación funcionando correctamente
- [ ] Cliente notificado
- [ ] Documentación actualizada