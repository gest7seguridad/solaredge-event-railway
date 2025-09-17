#!/bin/bash

# ============================================
# SCRIPT DE VERIFICACIÓN DE DEPLOYMENT - PLESK
# ============================================

echo "======================================"
echo "🔍 VERIFICACIÓN DE DEPLOYMENT"
echo "======================================"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
DOMAIN="https://solarland.gestsiete.es"
API_URL="${DOMAIN}/api"
HEALTH_URL="${API_URL}/health"
EVENTS_URL="${API_URL}/events"

# Contadores
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Función para test
run_test() {
    local test_name=$1
    local command=$2
    local expected=$3

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "  Testing: $test_name... "

    if eval $command; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# ============================================
# 1. VERIFICACIÓN DE SISTEMA
# ============================================
echo -e "${BLUE}1. VERIFICACIÓN DE SISTEMA${NC}"
echo "================================"

# Node.js version
echo -n "  Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}$NODE_VERSION${NC}"

    # Verificar versión mínima (18.0.0)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ $MAJOR_VERSION -ge 18 ]; then
        echo -e "  ${GREEN}✅ Versión compatible${NC}"
    else
        echo -e "  ${RED}❌ Requiere Node.js 18+${NC}"
    fi
else
    echo -e "${RED}NO INSTALADO${NC}"
fi

# NPM version
echo -n "  NPM: "
if command -v npm &> /dev/null; then
    echo -e "${GREEN}$(npm -v)${NC}"
else
    echo -e "${RED}NO INSTALADO${NC}"
fi

# PM2 (opcional)
echo -n "  PM2: "
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}$(pm2 -v)${NC}"

    # Listar procesos PM2
    echo "  Procesos PM2:"
    pm2 list --no-color | sed 's/^/    /'
else
    echo -e "${YELLOW}No instalado (opcional)${NC}"
fi

echo ""

# ============================================
# 2. VERIFICACIÓN DE ARCHIVOS
# ============================================
echo -e "${BLUE}2. VERIFICACIÓN DE ARCHIVOS${NC}"
echo "================================"

# Verificar estructura de directorios
check_file() {
    local file=$1
    local description=$2

    if [ -f "$file" ] || [ -d "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "  ${RED}❌${NC} $description"
        return 1
    fi
}

check_file "backend/dist/server.js" "Backend compilado"
check_file "frontend/dist/index.html" "Frontend compilado"
check_file ".env" "Archivo de configuración"
check_file "package.json" "Package.json principal"
check_file "backend/package.json" "Backend package.json"
check_file ".htaccess" "Configuración Apache"

echo ""

# ============================================
# 3. VERIFICACIÓN DE VARIABLES DE ENTORNO
# ============================================
echo -e "${BLUE}3. VARIABLES DE ENTORNO${NC}"
echo "================================"

if [ -f ".env" ]; then
    echo "  Verificando configuración..."

    # Verificar variables críticas
    check_env() {
        local var=$1
        local value=$(grep "^$var=" .env | cut -d'=' -f2)

        if [ ! -z "$value" ] && [ "$value" != "" ]; then
            echo -e "  ${GREEN}✅${NC} $var configurado"
            return 0
        else
            echo -e "  ${RED}❌${NC} $var NO configurado"
            return 1
        fi
    }

    check_env "NODE_ENV"
    check_env "PORT"
    check_env "DB_HOST"
    check_env "DB_USER"
    check_env "DB_PASSWORD"
    check_env "DB_NAME"
    check_env "JWT_SECRET"
    check_env "FRONTEND_URL"
    check_env "BACKEND_URL"
else
    echo -e "  ${RED}❌ Archivo .env no encontrado${NC}"
fi

echo ""

# ============================================
# 4. VERIFICACIÓN DE BASE DE DATOS
# ============================================
echo -e "${BLUE}4. CONEXIÓN BASE DE DATOS${NC}"
echo "================================"

# Test de conexión a PostgreSQL
if [ -f ".env" ]; then
    source .env

    echo -n "  Conectando a $DB_HOST:$DB_PORT... "

    # Test con telnet o nc
    if command -v nc &> /dev/null; then
        if nc -zv $DB_HOST $DB_PORT 2>/dev/null; then
            echo -e "${GREEN}✅ Puerto abierto${NC}"
        else
            echo -e "${RED}❌ No se puede conectar${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ nc no disponible${NC}"
    fi

    # Test con psql si está disponible
    if command -v psql &> /dev/null; then
        echo -n "  Verificando credenciales... "
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" &>/dev/null; then
            echo -e "${GREEN}✅ Conexión exitosa${NC}"
        else
            echo -e "${RED}❌ Error de autenticación${NC}"
        fi
    fi
fi

echo ""

# ============================================
# 5. VERIFICACIÓN DE ENDPOINTS
# ============================================
echo -e "${BLUE}5. VERIFICACIÓN DE ENDPOINTS${NC}"
echo "================================"

# Función para test HTTP
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3

    echo -n "  $description: "

    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$url")

        if [ "$HTTP_STATUS" = "$expected_status" ]; then
            echo -e "${GREEN}✅ HTTP $HTTP_STATUS${NC}"
            return 0
        else
            echo -e "${RED}❌ HTTP $HTTP_STATUS (esperado: $expected_status)${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️ curl no disponible${NC}"
        return 1
    fi
}

# Health check
test_endpoint "$HEALTH_URL" "200" "Health Check (/api/health)"

# API Events
test_endpoint "$EVENTS_URL" "200" "Events API (/api/events)"

# Frontend
test_endpoint "$DOMAIN" "200" "Frontend (index.html)"

# Static assets
test_endpoint "$DOMAIN/manifest.json" "200" "Static Assets"

echo ""

# ============================================
# 6. VERIFICACIÓN DE FUNCIONALIDADES
# ============================================
echo -e "${BLUE}6. PRUEBAS FUNCIONALES${NC}"
echo "================================"

# Test de API response
echo -n "  API Response válida: "
if command -v curl &> /dev/null; then
    HEALTH_RESPONSE=$(curl -s "$HEALTH_URL")
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
        echo -e "${GREEN}✅ JSON válido${NC}"
    else
        echo -e "${RED}❌ Respuesta inválida${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ No se puede verificar${NC}"
fi

# Test de CORS headers
echo -n "  CORS Headers: "
if command -v curl &> /dev/null; then
    CORS_HEADER=$(curl -s -I "$API_URL/health" | grep -i "access-control-allow-origin")
    if [ ! -z "$CORS_HEADER" ]; then
        echo -e "${GREEN}✅ Configurado${NC}"
    else
        echo -e "${YELLOW}⚠️ No configurado${NC}"
    fi
fi

# Test SSL
echo -n "  Certificado SSL: "
if command -v openssl &> /dev/null; then
    echo | openssl s_client -connect solarland.gestsiete.es:443 2>/dev/null | grep -q "Verify return code: 0"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Válido${NC}"
    else
        echo -e "${YELLOW}⚠️ Verificar certificado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ openssl no disponible${NC}"
fi

echo ""

# ============================================
# 7. VERIFICACIÓN DE LOGS
# ============================================
echo -e "${BLUE}7. VERIFICACIÓN DE LOGS${NC}"
echo "================================"

# Buscar archivos de log
LOG_DIRS=(
    "/var/www/vhosts/solarland.gestsiete.es/logs"
    "./logs"
    "/var/log"
)

for dir in "${LOG_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  Logs en $dir:"
        ls -la "$dir" 2>/dev/null | grep -E "\.(log|err)" | tail -5 | sed 's/^/    /'
        break
    fi
done

echo ""

# ============================================
# 8. VERIFICACIÓN DE PROCESOS
# ============================================
echo -e "${BLUE}8. PROCESOS NODE.JS${NC}"
echo "================================"

# Buscar procesos Node.js
NODE_PROCESSES=$(ps aux | grep -E "node|npm" | grep -v grep | wc -l)
echo "  Procesos Node.js activos: $NODE_PROCESSES"

if [ $NODE_PROCESSES -gt 0 ]; then
    echo "  Detalle de procesos:"
    ps aux | grep -E "node|npm" | grep -v grep | head -5 | awk '{print "    " $11}'
fi

echo ""

# ============================================
# 9. USO DE RECURSOS
# ============================================
echo -e "${BLUE}9. USO DE RECURSOS${NC}"
echo "================================"

# Memoria
if command -v free &> /dev/null; then
    echo "  Memoria:"
    free -h | sed 's/^/    /'
fi

# Disco
echo ""
echo "  Espacio en disco:"
df -h . | sed 's/^/    /'

echo ""

# ============================================
# 10. RECOMENDACIONES
# ============================================
echo -e "${BLUE}10. RECOMENDACIONES${NC}"
echo "================================"

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Acciones recomendadas:${NC}"

    # Recomendaciones basadas en fallos
    [ ! -f "backend/dist/server.js" ] && echo "  - Ejecutar: npm run build:backend"
    [ ! -f "frontend/dist/index.html" ] && echo "  - Ejecutar: npm run build:frontend"
    [ ! -f ".env" ] && echo "  - Crear archivo .env con configuración"

    echo ""
fi

# ============================================
# RESUMEN FINAL
# ============================================
echo "======================================"
echo -e "${BLUE}📊 RESUMEN DE VERIFICACIÓN${NC}"
echo "======================================"
echo ""

# Calcular porcentaje
if [ $TESTS_TOTAL -gt 0 ]; then
    PERCENTAGE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
else
    PERCENTAGE=0
fi

echo "  Tests ejecutados: $TESTS_TOTAL"
echo -e "  Tests pasados: ${GREEN}$TESTS_PASSED${NC}"
echo -e "  Tests fallidos: ${RED}$TESTS_FAILED${NC}"
echo "  Porcentaje de éxito: $PERCENTAGE%"
echo ""

# Estado final
if [ $PERCENTAGE -eq 100 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT COMPLETAMENTE FUNCIONAL${NC}"
    EXIT_CODE=0
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT FUNCIONAL (con advertencias menores)${NC}"
    EXIT_CODE=0
elif [ $PERCENTAGE -ge 60 ]; then
    echo -e "${YELLOW}⚠️ DEPLOYMENT PARCIALMENTE FUNCIONAL${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}❌ DEPLOYMENT CON PROBLEMAS CRÍTICOS${NC}"
    EXIT_CODE=2
fi

echo ""
echo "======================================"
echo "Verificación completada: $(date)"
echo "======================================"

exit $EXIT_CODE