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
  
  // Ruta principal donde debería estar el frontend en Railway
  const frontendPath = '/app/frontend/dist';
  
  console.log('📁 Verificando frontend en:', frontendPath);
  console.log('📂 Existe el directorio?:', fs.existsSync(frontendPath));
  
  if (fs.existsSync(frontendPath)) {
    const indexPath = path.join(frontendPath, 'index.html');
    console.log('📄 Existe index.html?:', fs.existsSync(indexPath));
    
    if (fs.existsSync(indexPath)) {
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
      
      console.log('✅ Frontend configurado correctamente');
    } else {
      console.log('❌ index.html no encontrado');
      // Listar contenido del directorio para debugging
      const files = fs.readdirSync(frontendPath);
      console.log('📁 Archivos en frontend/dist:', files);
      
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return;
        res.status(404).json({
          error: 'index.html no encontrado',
          path: indexPath,
          files: files
        });
      });
    }
  } else {
    console.log('❌ Directorio frontend no encontrado');
    
    // Fallback: intentar con ruta relativa
    const relativePath = path.join(__dirname, '../../frontend/dist');
    if (fs.existsSync(relativePath)) {
      console.log('📁 Usando ruta relativa:', relativePath);
      app.use(express.static(relativePath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(relativePath, 'index.html'));
      });
    } else {
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return;
        res.status(404).json({
          error: 'Frontend no encontrado',
          intentedPath: frontendPath,
          relativePath: relativePath,
          cwd: process.cwd(),
          dirname: __dirname
        });
      });
    }
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