# 📋 Instrucciones de Instalación - Sistema de Inscripción SolarEdge

## 🚀 Requisitos Previos

- **Node.js 18+** y npm
- **Git** para clonar el repositorio
- **Editor de texto** para configurar variables
- **Mínimo 2GB RAM**, 10GB espacio en disco

> ⚠️ **Nota:** La base de datos PostgreSQL está alojada remotamente en server.radioinsular.es, no necesitas instalar PostgreSQL localmente.

## 📦 Instalación Paso a Paso

### 1️⃣ Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/gest7seguridad/Event-System.git
cd Event-System
```

### 2️⃣ Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar configuración
nano .env  # o usar tu editor preferido
```

**Configuraciones importantes a modificar:**

```env
# ============================================
# BASE DE DATOS (Ya configurada - NO CAMBIAR)
# ============================================
DB_HOST=server.radioinsular.es
DB_PORT=5432
DB_USER=eventos_u
DB_PASSWORD=eventos_pass
DB_NAME=eventos_n

# ============================================
# JWT Secret (CAMBIAR en producción)
# ============================================
JWT_SECRET=genera_una_cadena_aleatoria_segura_minimo_32_caracteres

# ============================================
# Configuración SMTP (OBLIGATORIO configurar)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM="SolarEdge Event" <noreply@tudominio.com>
```

### 3️⃣ Instalar Dependencias

```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

### 4️⃣ Compilar el Proyecto

```bash
# Compilar el backend (TypeScript → JavaScript)
cd backend
npm run build

# Compilar el frontend para producción
cd ../frontend
npm run build
```

### 5️⃣ Inicializar Base de Datos

La base de datos remota ya está configurada. Solo necesitas verificar la conexión:

```bash
# Desde la raíz del proyecto
./migrate-to-remote.sh

# Seleccionar opción 2 para verificar conexión
```

### 6️⃣ Iniciar la Aplicación

#### Opción A: Usar el script de inicio
```bash
# Desde la raíz del proyecto
./start.sh
```

#### Opción B: Iniciar manualmente
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (desarrollo)
cd frontend
npm run dev
```

## 🔑 Acceso Inicial

### URLs del Sistema
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health
- **Panel Admin:** http://localhost:3000/admin

### Credenciales de Administrador
- **Email:** admin@solarland.com
- **Contraseña:** admin123456

⚠️ **IMPORTANTE:** Cambia la contraseña después del primer acceso

## 📧 Configuración de Email (SMTP)

### Para Gmail:
1. Activa la verificación en 2 pasos en tu cuenta Google
2. Genera una contraseña de aplicación:
   - Ve a: https://myaccount.google.com/apppasswords
   - Genera una contraseña para "Mail"
3. Usa esa contraseña en `SMTP_PASS`

### Para Outlook:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASS=tu-contraseña
```

### Para servidor SMTP propio:
```env
SMTP_HOST=mail.tudominio.com
SMTP_PORT=587
SMTP_USER=noreply@tudominio.com
SMTP_PASS=tu-contraseña-smtp
```

## 🚀 Despliegue en Producción

### Para Servidor VPS/Dedicado

1. **Instalar Node.js y PM2:**
```bash
# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
npm install -g pm2
```

2. **Clonar y configurar:**
```bash
git clone https://github.com/gest7seguridad/Event-System.git
cd Event-System
cp .env.example .env
nano .env  # Configurar para producción
```

3. **Compilar:**
```bash
cd backend && npm install && npm run build
cd ../frontend && npm install && npm run build
```

4. **Iniciar con PM2:**
```bash
# Crear archivo ecosystem
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'solaredge-backend',
    script: './backend/dist/server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Iniciar
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **Servir frontend con Nginx:**
```bash
# Instalar Nginx
sudo apt-get install nginx

# Copiar archivos del frontend
sudo cp -r frontend/dist/* /var/www/html/

# Configurar Nginx para SPA y API proxy
```

### Para Plesk
Ver [DEPLOY_PLESK.md](./DEPLOY_PLESK.md) para instrucciones específicas de Plesk.

## 🛠️ Comandos Útiles

### Desarrollo
```bash
# Iniciar backend en desarrollo
cd backend && npm run dev

# Iniciar frontend en desarrollo
cd frontend && npm run dev

# Ver logs del backend
cd backend && npm run logs
```

### Producción
```bash
# Compilar todo
npm run build:all

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs con PM2
pm2 logs

# Reiniciar servicios
pm2 restart all

# Monitorear
pm2 monit
```

## 🔧 Solución de Problemas

### Error de conexión a la base de datos
```bash
# Verificar conexión
PGPASSWORD='eventos_pass' psql -h server.radioinsular.es -U eventos_u -d eventos_n -c '\dt'
```
- Verifica las credenciales en `.env`
- Asegúrate de tener conexión a Internet

### El frontend no conecta con el backend
- Verifica que el backend esté corriendo: `curl http://localhost:5000/api/health`
- Revisa el puerto en `.env`
- Verifica CORS en el backend

### Los emails no se envían
1. Verifica configuración SMTP en `.env`
2. Para Gmail: usar contraseña de aplicación, no la contraseña normal
3. Revisar logs del backend: `cd backend && npm run logs`

### Error al compilar TypeScript
```bash
# Reinstalar dependencias
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🔒 Seguridad

### Checklist de Producción
- [ ] Cambiar JWT_SECRET por uno seguro
- [ ] Cambiar contraseña de admin
- [ ] Configurar HTTPS/SSL
- [ ] Configurar firewall
- [ ] Activar rate limiting
- [ ] Configurar backups automáticos

### Backup de Base de Datos
```bash
# Backup manual
PGPASSWORD='eventos_pass' pg_dump -h server.radioinsular.es -U eventos_u eventos_n > backup_$(date +%Y%m%d).sql

# Restaurar backup
PGPASSWORD='eventos_pass' psql -h server.radioinsular.es -U eventos_u -d eventos_n < backup.sql
```

## 📊 Monitoreo

### Con PM2
```bash
# Estado de servicios
pm2 status

# Monitoreo en tiempo real
pm2 monit

# Logs
pm2 logs --lines 100
```

### Logs manuales
```bash
# Backend
tail -f backend/logs/app.log

# Ver errores
grep ERROR backend/logs/app.log
```

## 🎯 Verificación Final

### Lista de comprobación post-instalación:
- [ ] El sitio web carga correctamente en http://localhost:3000
- [ ] Puedes acceder al panel de administración
- [ ] La API responde en http://localhost:5000/api/health
- [ ] Los emails de confirmación se envían
- [ ] El sistema de check-in con QR funciona
- [ ] WhatsApp se abre correctamente al hacer clic
- [ ] Los logos se muestran en la página principal
- [ ] Las inscripciones se guardan en la base de datos

## 📝 Notas Adicionales

- La base de datos está alojada en server.radioinsular.es (PostgreSQL remoto)
- No necesitas instalar PostgreSQL localmente
- El sistema incluye rate limiting por defecto
- Los QR codes se generan automáticamente
- WhatsApp funciona sin APIs de pago (protocolo wa.me)
- El sistema maneja lista de espera automáticamente

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs del sistema
2. Verifica la conexión a Internet (para la BD remota)
3. Asegúrate de que Node.js 18+ esté instalado
4. Verifica que los puertos 3000 y 5000 estén libres

---

¡El sistema está listo para usar! 🚀