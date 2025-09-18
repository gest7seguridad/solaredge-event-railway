#!/bin/bash

# Script de inicio para producción
# Asegura que el servidor se ejecute en modo producción

echo "========================================"
echo "🚀 INICIANDO EVENT SYSTEM EN PRODUCCIÓN"
echo "========================================"

# Configurar entorno de producción
export NODE_ENV=production

# Crear directorio de logs si no existe
mkdir -p logs

# Verificar que existe el archivo .env
if [ ! -f .env ]; then
    echo "⚠️ Archivo .env no encontrado!"
    echo "Por favor, copia .env.production.example a .env y configura los valores"
    exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production
fi

# Verificar que el frontend está compilado
if [ ! -d "backend/public" ]; then
    echo "⚠️ Frontend no compilado!"
    echo "Ejecuta: cd frontend && npm run build"
    exit 1
fi

# Iniciar el servidor
echo "✅ Iniciando servidor en puerto ${PORT:-3000}..."
echo "📅 $(date)"
echo "========================================"

# Ejecutar el servidor con manejo de errores
node app.js 2>&1 | tee -a logs/production.log