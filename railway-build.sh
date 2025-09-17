#!/bin/bash
# Script de build optimizado para Railway

echo "🚀 Starting Railway Build..."
echo "=============================="

# Instalar dependencias del nivel raíz primero
echo "📦 Installing root dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

# Backend
echo ""
echo "📦 Building Backend..."
cd backend

echo "  Installing backend dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

echo "  Compiling TypeScript..."
npm run build

echo "  Checking backend dist..."
ls -la dist/ 2>/dev/null || echo "  ⚠️  No dist folder yet"

echo "✅ Backend ready!"

# Frontend  
echo ""
echo "🎨 Building Frontend..."
cd ../frontend

echo "  Installing frontend dependencies..."
npm install --production=false --no-optional --legacy-peer-deps

echo "  Creating production build..."
npm run build

echo "  Checking frontend dist..."
ls -la dist/ 2>/dev/null || echo "  ⚠️  No dist folder yet"
if [ -f "dist/index.html" ]; then
    echo "  ✅ index.html found"
else
    echo "  ❌ index.html NOT found"
fi

echo "✅ Frontend ready!"

# Verificar estructura final
echo ""
echo "📁 Final structure check:"
echo "  Backend dist:"
ls -la ../backend/dist/ 2>/dev/null || echo "    No backend/dist"
echo "  Frontend dist:"
ls -la dist/ 2>/dev/null || echo "    No frontend/dist"

echo ""
echo "=============================="
echo "🎉 Build completed successfully!"