#!/bin/bash

# ============================================
# BUILD SCRIPT OPTIMIZADO PARA PLESK
# ============================================

echo "======================================"
echo "🚀 BUILD PARA PLESK DEPLOYMENT"
echo "======================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
START_TIME=$(date +%s)
BUILD_DIR="plesk-build-$(date +%Y%m%d-%H%M%S)"
ERRORS=0

# Función para manejar errores
handle_error() {
    echo -e "${RED}❌ Error en: $1${NC}"
    ERRORS=$((ERRORS + 1))
    if [ "$2" = "critical" ]; then
        echo -e "${RED}Error crítico. Abortando build...${NC}"
        exit 1
    fi
}

# Función para mostrar progreso
show_progress() {
    echo -e "${CYAN}➤ $1${NC}"
}

# ============================================
# PASO 1: VERIFICACIÓN INICIAL
# ============================================
echo -e "${BLUE}1. VERIFICACIÓN INICIAL${NC}"
echo "================================"

# Verificar Node.js
show_progress "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    handle_error "Node.js no está instalado" "critical"
fi
NODE_VERSION=$(node -v)
echo -e "  ${GREEN}✅ Node.js $NODE_VERSION${NC}"

# Verificar NPM
show_progress "Verificando NPM..."
if ! command -v npm &> /dev/null; then
    handle_error "NPM no está instalado" "critical"
fi
NPM_VERSION=$(npm -v)
echo -e "  ${GREEN}✅ NPM $NPM_VERSION${NC}"

# Verificar estructura de proyecto
show_progress "Verificando estructura del proyecto..."
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    handle_error "Estructura de proyecto incorrecta" "critical"
fi
echo -e "  ${GREEN}✅ Estructura correcta${NC}"

echo ""

# ============================================
# PASO 2: LIMPIEZA
# ============================================
echo -e "${BLUE}2. LIMPIEZA DE BUILDS ANTERIORES${NC}"
echo "================================"

show_progress "Limpiando directorios de build..."

# Limpiar builds anteriores
if [ -d "backend/dist" ]; then
    rm -rf backend/dist
    echo -e "  ${YELLOW}🗑 Backend/dist eliminado${NC}"
fi

if [ -d "frontend/dist" ]; then
    rm -rf frontend/dist
    echo -e "  ${YELLOW}🗑 Frontend/dist eliminado${NC}"
fi

# Limpiar node_modules si flag --clean
if [ "$1" = "--clean" ]; then
    show_progress "Limpieza profunda activada..."
    rm -rf node_modules backend/node_modules frontend/node_modules
    echo -e "  ${YELLOW}🗑 node_modules eliminados${NC}"
fi

echo -e "  ${GREEN}✅ Limpieza completada${NC}"
echo ""

# ============================================
# PASO 3: INSTALACIÓN DE DEPENDENCIAS
# ============================================
echo -e "${BLUE}3. INSTALACIÓN DE DEPENDENCIAS${NC}"
echo "================================"

# Instalar dependencias root
show_progress "Instalando dependencias principales..."
npm ci --production=false 2>/dev/null || npm install --production=false
if [ $? -ne 0 ]; then
    handle_error "Error instalando dependencias principales"
else
    echo -e "  ${GREEN}✅ Dependencias principales instaladas${NC}"
fi

echo ""

# ============================================
# PASO 4: BUILD DEL BACKEND
# ============================================
echo -e "${BLUE}4. COMPILANDO BACKEND${NC}"
echo "================================"

cd backend || handle_error "No se puede acceder a backend" "critical"

# Instalar dependencias del backend
show_progress "Instalando dependencias del backend..."
npm ci --production=false 2>/dev/null || npm install --production=false
if [ $? -ne 0 ]; then
    handle_error "Error instalando dependencias del backend"
else
    echo -e "  ${GREEN}✅ Dependencias instaladas${NC}"
fi

# Compilar TypeScript
show_progress "Compilando TypeScript..."
npm run build
if [ $? -ne 0 ]; then
    handle_error "Error compilando backend" "critical"
fi

# Verificar compilación
if [ -d "dist" ] && [ -f "dist/server.js" ]; then
    FILE_COUNT=$(find dist -name "*.js" | wc -l)
    echo -e "  ${GREEN}✅ Backend compilado: $FILE_COUNT archivos JS${NC}"
else
    handle_error "Backend no compilado correctamente" "critical"
fi

cd ..
echo ""

# ============================================
# PASO 5: BUILD DEL FRONTEND
# ============================================
echo -e "${BLUE}5. COMPILANDO FRONTEND${NC}"
echo "================================"

cd frontend || handle_error "No se puede acceder a frontend" "critical"

# Instalar dependencias del frontend
show_progress "Instalando dependencias del frontend..."
npm ci --production=false 2>/dev/null || npm install --production=false
if [ $? -ne 0 ]; then
    handle_error "Error instalando dependencias del frontend"
else
    echo -e "  ${GREEN}✅ Dependencias instaladas${NC}"
fi

# Build de producción
show_progress "Generando build de producción..."
npm run build
if [ $? -ne 0 ]; then
    handle_error "Error compilando frontend" "critical"
fi

# Verificar build
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    SIZE=$(du -sh dist | cut -f1)
    echo -e "  ${GREEN}✅ Frontend compilado: $SIZE${NC}"
else
    handle_error "Frontend no compilado correctamente" "critical"
fi

cd ..
echo ""

# ============================================
# PASO 6: OPTIMIZACIÓN PARA PRODUCCIÓN
# ============================================
echo -e "${BLUE}6. OPTIMIZACIÓN PARA PRODUCCIÓN${NC}"
echo "================================"

show_progress "Optimizando para producción..."

# Instalar solo dependencias de producción en backend
cd backend
show_progress "Preparando dependencias de producción..."
npm prune --production
echo -e "  ${GREEN}✅ Dependencias de desarrollo removidas${NC}"

cd ..

# Crear archivo de versión
show_progress "Generando información del build..."
cat > build-info.json << EOF
{
  "version": "1.0.0",
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "nodeVersion": "$NODE_VERSION",
  "npmVersion": "$NPM_VERSION",
  "environment": "production"
}
EOF
echo -e "  ${GREEN}✅ build-info.json creado${NC}"

echo ""

# ============================================
# PASO 7: PREPARACIÓN DE ARCHIVOS PLESK
# ============================================
echo -e "${BLUE}7. PREPARACIÓN PARA PLESK${NC}"
echo "================================"

show_progress "Preparando archivos para Plesk..."

# Copiar archivo de environment si no existe
if [ ! -f ".env" ] && [ -f ".env.plesk" ]; then
    cp .env.plesk .env
    echo -e "  ${GREEN}✅ .env.plesk copiado a .env${NC}"
fi

# Crear estructura de directorios para logs
mkdir -p logs uploads
echo -e "  ${GREEN}✅ Directorios creados${NC}"

# Verificar archivos críticos
FILES_TO_CHECK=(
    "backend/dist/server.js"
    "frontend/dist/index.html"
    "package.json"
    ".htaccess"
)

echo ""
show_progress "Verificando archivos críticos..."
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅ $file${NC}"
    else
        echo -e "  ${RED}❌ $file NO ENCONTRADO${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# ============================================
# PASO 8: CREACIÓN DE BUNDLE (Opcional)
# ============================================
if [ "$1" = "--bundle" ] || [ "$2" = "--bundle" ]; then
    echo -e "${BLUE}8. CREANDO BUNDLE PARA UPLOAD${NC}"
    echo "================================"

    show_progress "Creando archivo comprimido..."

    # Crear directorio temporal
    mkdir -p $BUILD_DIR

    # Copiar archivos necesarios
    cp -r backend/dist $BUILD_DIR/backend-dist
    cp -r frontend/dist $BUILD_DIR/frontend-dist
    cp package.json $BUILD_DIR/
    cp backend/package.json $BUILD_DIR/backend-package.json
    cp .htaccess $BUILD_DIR/ 2>/dev/null
    cp nginx-plesk-node.conf $BUILD_DIR/ 2>/dev/null
    cp .env.plesk $BUILD_DIR/.env 2>/dev/null
    cp verify-deployment.sh $BUILD_DIR/ 2>/dev/null

    # Crear archivo tar.gz
    tar -czf $BUILD_DIR.tar.gz $BUILD_DIR

    # Limpiar directorio temporal
    rm -rf $BUILD_DIR

    BUNDLE_SIZE=$(du -sh $BUILD_DIR.tar.gz | cut -f1)
    echo -e "  ${GREEN}✅ Bundle creado: $BUILD_DIR.tar.gz ($BUNDLE_SIZE)${NC}"
    echo ""
fi

# ============================================
# PASO 9: INSTRUCCIONES POST-BUILD
# ============================================
echo -e "${BLUE}9. RESUMEN DEL BUILD${NC}"
echo "================================"

# Calcular tiempo transcurrido
END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))
MINUTES=$((ELAPSED / 60))
SECONDS=$((ELAPSED % 60))

# Tamaños
BACKEND_SIZE=$(du -sh backend/dist 2>/dev/null | cut -f1)
FRONTEND_SIZE=$(du -sh frontend/dist 2>/dev/null | cut -f1)
TOTAL_SIZE=$(du -sh . | cut -f1)

echo -e "  📊 Estadísticas del Build:"
echo -e "     Backend:  ${CYAN}$BACKEND_SIZE${NC}"
echo -e "     Frontend: ${CYAN}$FRONTEND_SIZE${NC}"
echo -e "     Total:    ${CYAN}$TOTAL_SIZE${NC}"
echo -e "     Tiempo:   ${CYAN}${MINUTES}m ${SECONDS}s${NC}"

if [ $ERRORS -gt 0 ]; then
    echo -e "     Errores:  ${RED}$ERRORS${NC}"
else
    echo -e "     Errores:  ${GREEN}0${NC}"
fi

echo ""

# ============================================
# INSTRUCCIONES FINALES
# ============================================
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ BUILD COMPLETADO CON ÉXITO${NC}"
else
    echo -e "${YELLOW}⚠️ BUILD COMPLETADO CON ADVERTENCIAS${NC}"
fi
echo "======================================"
echo ""

echo -e "${BLUE}📋 PRÓXIMOS PASOS PARA PLESK:${NC}"
echo ""
echo "1. Subir archivos al servidor:"
echo "   - backend/dist → /httpdocs/backend/dist"
echo "   - frontend/dist → /httpdocs/frontend/dist"
echo "   - package.json → /httpdocs/"
echo "   - .env.plesk → /httpdocs/.env"
echo "   - .htaccess → /httpdocs/"
echo ""
echo "2. En el servidor Plesk:"
echo "   ssh usuario@solarland.gestsiete.es"
echo "   cd /var/www/vhosts/solarland.gestsiete.es/httpdocs"
echo "   npm install --production"
echo "   cd backend && npm install --production"
echo ""
echo "3. Configurar Node.js en Plesk:"
echo "   - Application Root: /httpdocs"
echo "   - Startup File: backend/dist/server.js"
echo "   - Node.js version: 18+"
echo ""
echo "4. Configurar nginx (copiar contenido de nginx-plesk-node.conf)"
echo ""
echo "5. Ejecutar verificación:"
echo "   chmod +x verify-deployment.sh"
echo "   ./verify-deployment.sh"
echo ""

if [ -f "$BUILD_DIR.tar.gz" ]; then
    echo -e "${GREEN}📦 Bundle listo para upload: $BUILD_DIR.tar.gz${NC}"
fi

echo ""
echo "======================================"
echo "Build completado: $(date)"
echo "======================================"

exit $ERRORS