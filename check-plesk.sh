#!/bin/bash

echo "=========================================="
echo "DIAGNÓSTICO DE PLESK - EVENT SYSTEM"
echo "=========================================="
echo ""

# 1. Verificar versiones
echo "📦 VERSIONES:"
echo "Node.js: $(node --version 2>/dev/null || echo 'NO INSTALADO')"
echo "NPM: $(npm --version 2>/dev/null || echo 'NO INSTALADO')"
echo ""

# 2. Verificar directorio actual
echo "📁 DIRECTORIO ACTUAL:"
pwd
echo ""

# 3. Verificar archivos importantes
echo "📄 ARCHIVOS CRÍTICOS:"
[ -f "app.js" ] && echo "✅ app.js existe" || echo "❌ app.js NO existe"
[ -f "app-plesk.js" ] && echo "✅ app-plesk.js existe" || echo "❌ app-plesk.js NO existe"
[ -f "server-minimal.js" ] && echo "✅ server-minimal.js existe" || echo "❌ server-minimal.js NO existe"
[ -f ".env" ] && echo "✅ .env existe" || echo "⚠️ .env NO existe"
[ -f "package.json" ] && echo "✅ package.json existe" || echo "❌ package.json NO existe"
[ -d "node_modules" ] && echo "✅ node_modules existe" || echo "❌ node_modules NO existe"
[ -d "backend/public" ] && echo "✅ backend/public existe" || echo "⚠️ backend/public NO existe"
echo ""

# 4. Verificar puertos en uso
echo "🔌 PUERTOS EN USO:"
netstat -tuln | grep -E ":3000|:8080" || echo "No se encontraron puertos 3000 o 8080 en uso"
echo ""

# 5. Verificar variables de entorno
echo "🔐 VARIABLES DE ENTORNO:"
echo "NODE_ENV: ${NODE_ENV:-NO DEFINIDO}"
echo "PORT: ${PORT:-NO DEFINIDO}"
echo "DB_HOST: ${DB_HOST:-NO DEFINIDO}"
echo "DB_NAME: ${DB_NAME:-NO DEFINIDO}"
echo "DB_USER: ${DB_USER:-NO DEFINIDO}"
echo "DB_PASSWORD: ${DB_PASSWORD:+DEFINIDO}"
echo "JWT_SECRET: ${JWT_SECRET:+DEFINIDO}"
echo ""

# 6. Probar servidor mínimo
echo "🧪 PRUEBA DE SERVIDOR MÍNIMO:"
echo "Iniciando servidor de prueba..."
timeout 5 node server-minimal.js 2>&1 | head -10
echo ""

# 7. Verificar conectividad local
echo "🌐 PRUEBA DE CONECTIVIDAD LOCAL:"
curl -I http://localhost:3000/api/health 2>/dev/null && echo "✅ Servidor respondiendo localmente" || echo "❌ Servidor NO responde localmente"
echo ""

# 8. Verificar logs recientes
echo "📝 ÚLTIMOS ERRORES EN LOGS:"
[ -f "logs/error.log" ] && tail -5 logs/error.log 2>/dev/null || echo "No hay archivo de logs"
echo ""

echo "=========================================="
echo "RECOMENDACIONES:"
echo ""
echo "1. Si Node.js no está instalado, contactar soporte de Plesk"
echo "2. Si faltan archivos, hacer: git pull origin main"
echo "3. Si falta node_modules, ejecutar: npm install --production"
echo "4. Si el puerto está ocupado, cambiar PORT en variables de entorno"
echo "5. Si .env no existe, copiar: cp .env.production.example .env"
echo "=========================================="