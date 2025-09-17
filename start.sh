#!/bin/bash

echo "🚀 Iniciando Sistema de Inscripción SolarEdge..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado. Por favor, instala Node.js 18+ primero.${NC}"
    echo "   Visita: https://nodejs.org/"
    exit 1
fi

# Verificar versión de Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Se requiere Node.js 18 o superior. Versión actual: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}📝 Creando archivo de configuración...${NC}"
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Por favor, edita el archivo .env con tus configuraciones SMTP antes de continuar.${NC}"
        echo "   Ejecuta: nano .env"
        exit 1
    else
        echo -e "${RED}❌ No se encuentra .env.example${NC}"
        exit 1
    fi
fi

# Verificar si las dependencias están instaladas
if [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
    
    if [ ! -d "backend/node_modules" ]; then
        echo "   - Instalando dependencias del backend..."
        cd backend && npm install && cd ..
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        echo "   - Instalando dependencias del frontend..."
        cd frontend && npm install && cd ..
    fi
fi

# Verificar si el backend está compilado
if [ ! -d "backend/dist" ]; then
    echo -e "${YELLOW}🔨 Compilando backend...${NC}"
    cd backend && npm run build && cd ..
fi

# Verificar si el frontend está compilado
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}🎨 Compilando frontend...${NC}"
    cd frontend && npm run build && cd ..
fi

# Función para detener servicios
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Iniciar los servicios
echo -e "${GREEN}🔄 Iniciando servicios...${NC}"

# Iniciar backend
echo "   - Iniciando backend en puerto 5000..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "   - Esperando a que el backend esté listo..."
for i in {1..30}; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✅ Backend iniciado${NC}"
        break
    fi
    sleep 1
done

# Iniciar frontend
echo "   - Iniciando frontend en puerto 3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

# Esperar un momento para que el frontend inicie
sleep 3

echo ""
echo -e "${GREEN}🎉 ¡Sistema iniciado correctamente!${NC}"
echo ""
echo "📌 Accesos:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:5000/api/health"
echo "   - Admin: http://localhost:3000/admin"
echo ""
echo "🔑 Credenciales de administrador:"
echo "   - Email: admin@solarland.com"
echo "   - Contraseña: admin123"
echo ""
echo "🗄️ Base de datos remota:"
echo "   - Host: gestsiete.es"
echo "   - DB: events_n"
echo ""
echo -e "${YELLOW}📋 Presiona Ctrl+C para detener los servicios${NC}"
echo ""

# Mantener el script ejecutándose
wait