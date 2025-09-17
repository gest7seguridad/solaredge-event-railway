# 🌟 Sistema de Inscripción de Eventos - SolarEdge & Solarland

Sistema completo de gestión de inscripciones para eventos presenciales con capacidad de check-in mediante QR, gestión de lista de espera, y comunicación vía WhatsApp.

## 🎯 Características Principales

- ✅ **Inscripción Online** con formulario completo
- 📧 **Confirmación por Email** automática con QR code
- 📱 **Check-in con QR** para el día del evento
- 👥 **Gestión de Capacidad** con lista de espera automática
- 💼 **Panel de Administración** completo
- 📊 **Dashboard con Estadísticas** en tiempo real
- 💬 **Integración WhatsApp Business** para comunicación directa
- 🎨 **Diseño Responsive** optimizado para móviles
- 🔒 **Autenticación Segura** con JWT
- 📤 **Exportación de Datos** a CSV
- 🗄️ **Base de Datos Remota** PostgreSQL en server.radioinsular.es

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/gest7seguridad/Event-System.git
cd Event-System

# 2. Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus credenciales SMTP

# 3. Instalar y ejecutar
./start.sh
```

Ver [INSTALACION.md](./INSTALACION.md) para instrucciones detalladas.

## 📁 Estructura del Proyecto

```
solaredge-event/
├── backend/              # API REST con Node.js + TypeScript
│   ├── src/             # Código fuente
│   ├── dist/            # Código compilado
│   └── package.json     # Dependencias del backend
├── frontend/            # Aplicación React + TypeScript
│   ├── src/            # Código fuente
│   ├── dist/           # Build de producción
│   └── package.json    # Dependencias del frontend
├── database_backup.sql  # Estructura de la base de datos
├── .env.example        # Variables de entorno de ejemplo
├── start.sh           # Script de inicio rápido
├── migrate-to-remote.sh # Script de migración de BD
├── INSTALACION.md     # Guía de instalación completa
├── DEPLOY_PLESK.md    # Guía para Plesk
└── README.md          # Este archivo
```

## 🛠️ Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- PostgreSQL
- JWT para autenticación
- Nodemailer para emails
- QRCode para generación de códigos
- Bcrypt para encriptación
- Rate limiting para seguridad

### Frontend
- React 18 + TypeScript
- Tailwind CSS para estilos
- React Query para gestión de estado
- React Router para navegación
- Framer Motion para animaciones
- Recharts para gráficos
- React QR Scanner para lectura de QR

## 💡 Funcionalidades Detalladas

### Para Usuarios
- Inscripción con validación de datos
- Recepción de QR único por email
- Visualización de agenda del evento
- Información de ubicación con mapa

### Para Administradores
- Dashboard con métricas en tiempo real
- Gestión completa de inscripciones
- Creación y edición de eventos
- Sistema de check-in con escáner QR
- Envío masivo de WhatsApp
- Configuración SMTP desde la web
- Exportación de datos a CSV
- Gestión de logos personalizados

## 🔧 Configuración

### Variables de Entorno Importantes

```env
# Base de Datos
DB_HOST=server.radioinsular.es
DB_PORT=5432
DB_USER=eventos_u
DB_PASSWORD=eventos_pass
DB_NAME=eventos_n

# JWT
JWT_SECRET=tu_secret_key_segura

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Frontend
FRONTEND_URL=https://tu-dominio.com
```

## 📱 WhatsApp Integration

El sistema incluye integración con WhatsApp Business sin necesidad de APIs de pago:
- Envío individual desde la lista de inscritos
- Envío masivo a múltiples contactos
- Personalización de mensajes con variables
- Compatible con WhatsApp Web

## 🔒 Seguridad

- Autenticación basada en JWT
- Encriptación de contraseñas con bcrypt
- Rate limiting para prevenir ataques
- Validación de entrada en frontend y backend
- CORS configurado correctamente
- Headers de seguridad con Helmet

## 📈 Rendimiento

- Build optimizado para producción
- Compresión gzip habilitada
- Lazy loading de componentes
- Caché de consultas con React Query
- Imágenes optimizadas

## 🐛 Solución de Problemas

Ver sección de problemas comunes en [INSTALACION.md](./INSTALACION.md#-solución-de-problemas)

## 📝 Licencia

Este proyecto fue desarrollado para SolarEdge y Solarland.

## 🤝 Créditos

Desarrollado con ❤️ para el evento de formación SolarEdge en Fuerteventura.

---

**¿Necesitas ayuda?** Revisa la [documentación de instalación](./INSTALACION.md) o contacta al administrador del sistema.