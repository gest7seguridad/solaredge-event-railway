// Archivo de entrada para Phusion Passenger
// Este archivo es necesario para que Plesk pueda ejecutar la aplicación Node.js

const path = require('path');

// Cargar las variables de entorno
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Verificar si estamos en producción
const isProduction = process.env.NODE_ENV === 'production';

// Importar y ejecutar el servidor compilado
if (isProduction) {
  // En producción, usar el código compilado
  require('./backend/dist/server.js');
} else {
  // En desarrollo, usar el código fuente
  require('./backend/src/server.ts');
}