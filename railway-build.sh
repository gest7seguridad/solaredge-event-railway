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

# IMPORTANTE: Mover el frontend compilado al backend para que persista
echo ""
echo "📦 Moving frontend to backend for persistence..."
cd ..
if [ -d "frontend/dist" ]; then
    echo "  Creating backend/public directory..."
    mkdir -p backend/public
    echo "  Copying frontend dist to backend/public..."
    cp -r frontend/dist/* backend/public/
    echo "  ✅ Frontend copied to backend/public"
    ls -la backend/public/ | head -10
else
    echo "  ❌ frontend/dist not found!"
fi

echo "✅ Frontend ready!"

# Verificar estructura final
echo ""
echo "📁 Final structure check:"
echo "  Backend dist:"
ls -la backend/dist/ 2>/dev/null || echo "    No backend/dist"
echo "  Backend public (frontend):"
ls -la backend/public/ 2>/dev/null || echo "    No backend/public"
echo "  Original frontend dist:"
ls -la frontend/dist/ 2>/dev/null || echo "    No frontend/dist"

echo ""
echo "=============================="
echo "🎉 Build completed successfully!"