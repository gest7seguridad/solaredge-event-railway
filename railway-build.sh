#!/bin/bash
# Script de build optimizado para Railway

echo "🚀 Starting Railway Build..."
echo "=============================="

# Backend
echo "📦 Building Backend..."
cd backend

echo "  Installing dependencies..."
npm install --production=false --no-optional --legacy-peer-deps 2>&1 | tail -5

echo "  Compiling TypeScript..."
npm run build

echo "✅ Backend ready!"

# Frontend  
echo ""
echo "🎨 Building Frontend..."
cd ../frontend

echo "  Installing dependencies..."
npm install --production=false --no-optional --legacy-peer-deps 2>&1 | tail -5

echo "  Creating production build..."
npm run build

echo "✅ Frontend ready!"

echo ""
echo "=============================="
echo "🎉 Build completed successfully!"