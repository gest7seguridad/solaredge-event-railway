import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { testConnection } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import registrationRoutes from './routes/registrationRoutes';
import adminRoutes from './routes/adminRoutes';
import configRoutes from './routes/configRoutes';

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Log de las variables de entorno para debugging
console.log('🔍 Environment variables check:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   DB_HOST:', process.env.DB_HOST || 'NOT SET ❌');
console.log('   DB_USER:', process.env.DB_USER || 'NOT SET ❌');
console.log('   DB_NAME:', process.env.DB_NAME || 'NOT SET ❌');
console.log('   PORT:', process.env.PORT || 5000);

const app = express();
const PORT = process.env.PORT || 5000;

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.'
});

app.use(helmet());

// Configuración CORS para desarrollo y producción
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://solarland.gestsiete.es',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (Postman, aplicaciones móviles, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  
  // En Railway, la app se ejecuta desde /app
  // El backend compilado está en /app/backend/dist
  // El frontend compilado debe estar en /app/frontend/dist
  let frontendPath = path.join(__dirname, '../../frontend/dist');
  
  // Si estamos en Railway (detectado por la estructura de directorios)
  if (__dirname.includes('/app/backend/dist')) {
    frontendPath = '/app/frontend/dist';
  }
  
  console.log('📁 Buscando frontend en:', frontendPath);
  console.log('📂 __dirname:', __dirname);
  console.log('📂 process.cwd():', process.cwd());
  
  // Verificar si existe el directorio del frontend
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Directorio frontend encontrado');
    const files = fs.readdirSync(frontendPath);
    console.log('📄 Archivos en frontend/dist:', files.slice(0, 5).join(', '), files.length > 5 ? `... y ${files.length - 5} más` : '');
    
    // Servir archivos estáticos
    app.use(express.static(frontendPath));
    
    // Todas las rutas no-API devuelven el index.html (para React Router)
    app.get('*', (req, res) => {
      const indexPath = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ 
          success: false, 
          message: `Frontend index.html no encontrado en: ${indexPath}`,
          frontendPath,
          files: fs.readdirSync(frontendPath)
        });
      }
    });
  } else {
    console.log('❌ Directorio frontend NO encontrado en:', frontendPath);
    
    // Intentar encontrar el frontend en diferentes ubicaciones
    const possiblePaths = [
      '/app/frontend/dist',
      path.join(process.cwd(), 'frontend/dist'),
      path.join(__dirname, '../../frontend/dist'),
      path.join(__dirname, '../frontend/dist')
    ];
    
    console.log('🔍 Buscando frontend en posibles ubicaciones:');
    for (const p of possiblePaths) {
      console.log(`  - ${p}: ${fs.existsSync(p) ? '✅ EXISTE' : '❌ NO EXISTE'}`);
    }
    
    // Mostrar estructura de directorios para debugging
    try {
      console.log('📂 Contenido de /app:', fs.readdirSync('/app'));
      if (fs.existsSync('/app/frontend')) {
        console.log('📂 Contenido de /app/frontend:', fs.readdirSync('/app/frontend'));
      }
    } catch (e) {
      console.log('⚠️  No se pudo leer /app:', e.message);
    }
    
    app.get('*', (req, res) => {
      res.status(404).json({ 
        success: false, 
        message: `Frontend no encontrado. El directorio ${frontendPath} no existe.`,
        currentDir: __dirname,
        cwd: process.cwd(),
        possiblePaths: possiblePaths.map(p => ({ path: p, exists: fs.existsSync(p) })),
        appContent: fs.existsSync('/app') ? fs.readdirSync('/app') : 'No /app dir'
      });
    });
  }
} else {
  console.log('ℹ️  Modo desarrollo - Frontend servido por Vite');
}

app.use(errorHandler);

const startServer = async () => {
  try {
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();