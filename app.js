// Archivo de entrada para Phusion Passenger en Plesk
// Este archivo es el punto de entrada principal para la aplicación Node.js

const path = require('path');
const fs = require('fs');

// Cargar variables de entorno desde .env si existe
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

// Configurar variables por defecto si no están definidas
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.PORT = process.env.PORT || '3000';

console.log('🚀 Iniciando aplicación SolarEdge Event...');
console.log('📝 Entorno:', process.env.NODE_ENV);
console.log('🔌 Puerto:', process.env.PORT);
console.log('🗄️  Base de datos:', process.env.DB_HOST);

// Verificar que el backend está compilado
const serverPath = path.join(__dirname, 'backend/dist/server.js');
if (!fs.existsSync(serverPath)) {
  console.error('❌ ERROR: Backend no está compilado. Ejecuta npm run build:backend primero.');
  console.error('   Archivo esperado:', serverPath);
  process.exit(1);
}

// Cargar y ejecutar el servidor backend
try {
  console.log('✅ Cargando servidor desde:', serverPath);
  require(serverPath);
} catch (error) {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
}