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
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
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
  
  // Buscar frontend en múltiples ubicaciones posibles
  const possiblePaths = [
    path.join(__dirname, '../public'),        // Backend public (donde lo copiamos)
    '/app/backend/public',                     // Ruta absoluta en Railway
    path.join(__dirname, '../../frontend/dist'), // Ruta original
    '/app/frontend/dist'                       // Ruta original en Railway
  ];
  
  let frontendPath = null;
  let frontendFound = false;
  
  console.log('🔍 Buscando frontend en posibles ubicaciones...');
  
  for (const testPath of possiblePaths) {
    console.log(`  Verificando: ${testPath}`);
    if (fs.existsSync(testPath)) {
      const indexPath = path.join(testPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        frontendPath = testPath;
        frontendFound = true;
        console.log(`  ✅ Frontend encontrado en: ${testPath}`);
        break;
      } else {
        console.log(`  📁 Directorio existe pero sin index.html`);
      }
    } else {
      console.log(`  ❌ No existe`);
    }
  }
  
  if (frontendFound && frontendPath) {
    const indexPath = path.join(frontendPath, 'index.html');
    
    // Configurar Express para servir archivos estáticos
    console.log('✅ Configurando servidor de archivos estáticos...');
    
    // IMPORTANTE: Servir archivos estáticos ANTES de las rutas catch-all
    app.use(express.static(frontendPath));
    
    // Manejar rutas de React Router - DEBE ir DESPUÉS de express.static
    app.get('*', (req, res, next) => {
      // No procesar rutas API
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      // Enviar index.html para todas las demás rutas
      res.sendFile(indexPath);
    });
    
    console.log('✅ Frontend configurado correctamente desde:', frontendPath);
  } else {
    console.log('❌ Frontend no encontrado en ninguna ubicación');
    
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return;
      res.status(404).json({
        error: 'Frontend no encontrado',
        checkedPaths: possiblePaths,
        cwd: process.cwd(),
        dirname: __dirname
      });
    });
  }
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