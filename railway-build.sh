#!/bin/bash
# Script de build optimizado para Railway

echo "🚀 Starting Railway Build..."
echo "=============================="

# Establecer NODE_ENV para producción
export NODE_ENV=production
echo "📝 NODE_ENV set to: $NODE_ENV"

# Instalar dependencias del nivel raíz
echo ""
echo "📦 Installing root dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

# Backend
echo ""
echo "📦 Building Backend..."
cd backend

echo "  Installing backend dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

echo "  Creating public directory for frontend..."
mkdir -p public

echo "  Compiling TypeScript..."
npm run build

echo "  ✅ Backend compiled"
ls -la dist/server.js 2>/dev/null && echo "  ✅ server.js exists"

# Frontend - se compilará directamente en backend/public gracias a vite.config.ts
echo ""
echo "🎨 Building Frontend..."
cd ../frontend

echo "  Installing frontend dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

echo "  Creating production build (will output to backend/public)..."
NODE_ENV=production npm run build

# Verificar que el frontend se compiló correctamente
echo ""
echo "📁 Verifying frontend build..."
if [ -f "../backend/public/index.html" ]; then
    echo "  ✅ Frontend built successfully in backend/public"
    echo "  Files in backend/public:"
    ls -la ../backend/public/ | head -10
else
    echo "  ❌ Frontend build failed - index.html not found"
    echo "  Attempting fallback copy..."
    
    # Fallback: si existe dist, copiarlo manualmente
    if [ -d "dist" ]; then
        echo "  Found dist folder, copying to backend/public..."
        cp -r dist/* ../backend/public/
        echo "  ✅ Fallback copy completed"
    fi
fi

# Verificación final
echo ""
echo "📁 Final structure verification:"
cd ..

echo "  Backend dist exists: $([ -d "backend/dist" ] && echo '✅' || echo '❌')"
echo "  Backend public exists: $([ -d "backend/public" ] && echo '✅' || echo '❌')"
echo "  Backend public/index.html exists: $([ -f "backend/public/index.html" ] && echo '✅' || echo '❌')"

if [ -d "backend/public" ]; then
    echo "  Files in backend/public: $(ls backend/public | wc -l) files"
fi

echo ""
echo "=============================="
if [ -f "backend/public/index.html" ]; then
    echo "🎉 Build completed successfully!"
else
    echo "⚠️  Build completed but frontend might not be properly built"
fi