// Servidor de producción para Plesk
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de base de datos desde variables de entorno
const dbConfig = {
  host: process.env.DB_HOST || 'server.radioinsular.es',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventos_n',
  user: process.env.DB_USER || 'eventos_u',
  password: process.env.DB_PASSWORD || 'eventos_pass',
  ssl: false
};

// Middleware
app.use(cors({
  origin: ['https://solarland.gestsiete.es', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// ==================== API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbConfig.host,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Login attempt:`, req.body.email);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Buscar usuario
    const result = await client.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      console.log(`[${new Date().toISOString()}] Usuario no encontrado:`, email);
      await client.end();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log(`[${new Date().toISOString()}] Contraseña incorrecta para:`, email);
      await client.end();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await client.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generar JWT
    const jwtSecret = process.env.JWT_SECRET || 'SolarLand2025ProductionToken!@#$%^&*()_+SecureKey';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log(`[${new Date().toISOString()}] Login exitoso:`, email);

    await client.end();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en login:`, error);
    await client.end().catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current event
app.get('/api/events/current', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const result = await client.query(
      'SELECT * FROM events WHERE is_active = true ORDER BY date DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({
        message: 'No hay eventos activos'
      });
    }

    const event = result.rows[0];

    // Contar registros
    const countResult = await client.query(
      'SELECT COUNT(*) FROM registrations WHERE event_id = $1',
      [event.id]
    );

    await client.end();

    res.json({
      ...event,
      currentRegistrations: parseInt(countResult.rows[0].count) || 0
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo evento:`, error);
    await client.end().catch(() => {});
    res.status(500).json({
      message: 'Error del servidor'
    });
  }
});

// Verify token
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No autorizado'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'SolarLand2025ProductionToken!@#$%^&*()_+SecureKey';
    const decoded = jwt.verify(token, jwtSecret);
    res.json({
      success: true,
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Get all registrations (protected)
app.get('/api/registrations', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'SolarLand2025ProductionToken!@#$%^&*()_+SecureKey';
    jwt.verify(token, jwtSecret);

    const client = new Client(dbConfig);
    await client.connect();

    const result = await client.query(
      'SELECT * FROM registrations ORDER BY created_at DESC'
    );

    await client.end();

    res.json(result.rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo registros:`, error);
    res.status(401).json({ message: 'No autorizado' });
  }
});

// ==================== SPA FALLBACK ====================

// Servir el frontend para todas las rutas no API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// ==================== ERROR HANDLER ====================

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 SERVIDOR DE PRODUCCIÓN INICIADO');
  console.log('========================================');
  console.log('');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🗄️ Base de datos: ${dbConfig.host}`);
  console.log(`🗄️ Database: ${dbConfig.database}`);
  console.log('');
  console.log('📝 Endpoints disponibles:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET  /api/auth/verify - Verificar token');
  console.log('   GET  /api/events/current - Evento actual');
  console.log('   GET  /api/registrations - Lista de registros (protegido)');
  console.log('');
  console.log(`📅 Iniciado: ${new Date().toISOString()}`);
  console.log('========================================');
});