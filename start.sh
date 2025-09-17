#!/bin/bash

echo "🚀 Iniciando Sistema de Inscripción SolarEdge..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor, instala Docker primero."
    echo "   Visita: https://docs.docker.com/get-docker/"
    exit 1
fi

# Verificar si docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor, instala Docker Compose primero."
    echo "   Visita: https://docs.docker.com/compose/install/"
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo de configuración..."
    cp .env.production .env
    echo "⚠️  Por favor, edita el archivo .env con tus configuraciones antes de continuar."
    echo "   Ejecuta: nano .env"
    exit 1
fi

# Iniciar los servicios
echo "🔄 Iniciando servicios con Docker Compose..."
docker-compose up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado
echo ""
echo "✅ Verificando estado de los servicios..."
docker-compose ps

echo ""
echo "🎉 ¡Sistema iniciado correctamente!"
echo ""
echo "📌 Accesos:"
echo "   - Frontend: http://localhost"
echo "   - Backend API: http://localhost:5000/api/health"
echo "   - Admin: http://localhost/admin"
echo ""
echo "🔑 Credenciales de administrador:"
echo "   - Email: admin@solarland.com"
echo "   - Contraseña: admin123"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Detener: docker-compose down"
echo "   - Reiniciar: docker-compose restart"
echo ""