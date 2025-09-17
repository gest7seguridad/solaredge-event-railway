#!/usr/bin/env node
// Script de build optimizado para Railway

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
  console.log('🚀 Starting optimized build for Railway...\n');
  
  try {
    // Backend
    console.log('📦 Building backend...');
    process.chdir(path.join(__dirname, 'backend'));
    
    console.log('  Installing backend dependencies...');
    await execAsync('npm install --production=false --prefer-offline --no-audit --no-fund');
    
    console.log('  Compiling TypeScript...');
    await execAsync('npm run build');
    
    console.log('✅ Backend built successfully!\n');
    
    // Frontend
    console.log('🎨 Building frontend...');
    process.chdir(path.join(__dirname, 'frontend'));
    
    console.log('  Installing frontend dependencies...');
    await execAsync('npm install --production=false --prefer-offline --no-audit --no-fund');
    
    console.log('  Creating production build...');
    await execAsync('npm run build');
    
    console.log('✅ Frontend built successfully!\n');
    
    console.log('🎉 Build completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();