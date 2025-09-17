#!/bin/bash

echo "🔨 Script de Build para Producción"
echo "=================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detectado${NC}"
echo ""

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error en: $1${NC}"
    exit 1
}

# Backend Build
echo -e "${YELLOW}📦 Compilando Backend...${NC}"
cd backend || handle_error "No se encuentra directorio backend"

echo "  - Instalando dependencias..."
npm ci --production=false || handle_error "npm install backend"

echo "  - Compilando TypeScript..."
npm run build || handle_error "compilación backend"

echo -e "${GREEN}  ✅ Backend compilado${NC}"
cd ..

# Frontend Build
echo ""
echo -e "${YELLOW}🎨 Compilando Frontend...${NC}"
cd frontend || handle_error "No se encuentra directorio frontend"

echo "  - Instalando dependencias..."
npm ci --production=false || handle_error "npm install frontend"

echo "  - Generando build de producción..."
npm run build || handle_error "compilación frontend"

echo -e "${GREEN}  ✅ Frontend compilado${NC}"
cd ..

# Verificar builds
echo ""
echo -e "${YELLOW}🔍 Verificando compilación...${NC}"

if [ -d "backend/dist" ]; then
    echo -e "${GREEN}  ✅ Backend: $(find backend/dist -name "*.js" | wc -l) archivos JS generados${NC}"
else
    echo -e "${RED}  ❌ Error: No se generó backend/dist${NC}"
    exit 1
fi

if [ -d "frontend/dist" ]; then
    echo -e "${GREEN}  ✅ Frontend: $(du -sh frontend/dist | cut -f1) de archivos estáticos${NC}"
else
    echo -e "${RED}  ❌ Error: No se generó frontend/dist${NC}"
    exit 1
fi

# Optimización para producción
echo ""
echo -e "${YELLOW}⚡ Optimizando para producción...${NC}"

# Limpiar archivos innecesarios del backend
cd backend
echo "  - Limpiando dependencias de desarrollo del backend..."
npm prune --production
cd ..

# Crear archivo de información del build
echo ""
echo -e "${YELLOW}📝 Generando información del build...${NC}"
cat > build-info.txt << EOF
Build Date: $(date)
Node Version: $(node -v)
NPM Version: $(npm -v)
Backend Size: $(du -sh backend/dist | cut -f1)
Frontend Size: $(du -sh frontend/dist | cut -f1)
Total Size: $(du -sh . | cut -f1)
EOF

echo -e "${GREEN}  ✅ build-info.txt creado${NC}"

# Resumen
echo ""
echo "======================================"
echo -e "${GREEN}🎉 ¡BUILD COMPLETADO CON ÉXITO!${NC}"
echo "======================================"
echo ""
echo "📁 Archivos generados:"
echo "  - backend/dist/  → Código del servidor compilado"
echo "  - frontend/dist/ → Archivos estáticos del frontend"
echo ""
echo "📋 Próximos pasos:"
echo "  1. Subir estos directorios al servidor"
echo "  2. Configurar Node.js en Plesk"
echo "  3. Apuntar a backend/dist/server.js"
echo "  4. Servir frontend/dist/ como estáticos"
echo ""
echo "💡 Para Plesk:"
echo "  - Directorio de aplicación: /backend"
echo "  - Archivo de inicio: dist/server.js"
echo "  - Directorio público: /frontend/dist"
echo ""