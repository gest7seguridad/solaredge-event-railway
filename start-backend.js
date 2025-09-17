// Servidor backend simple con nueva base de datos
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const app = express();
const PORT = 5000;

// Configuración de base de datos
const dbConfig = {
  host: 'server.radioinsular.es',
  port: 5432,
  database: 'eventos_n',
  user: 'eventos_u',
  password: 'eventos_pass',
  ssl: false
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected to server.radioinsular.es'
  });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y contraseña son requeridos'
    });
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();

    // Buscar usuario en la base de datos
    const result = await client.query(
      'SELECT * FROM admin_users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', email);
      await client.end();
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta para:', email);
      await client.end();
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar último login
    await client.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      'tu_secret_key_muy_segura_aqui_2024',
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso para:', email);

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
    console.error('❌ Error en login:', error.message);
    await client.end();
    res.status(500).json({
      message: 'Error del servidor',
      error: error.message
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
    console.error('Error obteniendo evento:', error.message);
    await client.end();
    res.status(500).json({
      message: 'Error del servidor'
    });
  }
});

// Verificar token
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, 'tu_secret_key_muy_segura_aqui_2024');
    res.json({
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 BACKEND INICIADO CON NUEVA BD');
  console.log('========================================');
  console.log('');
  console.log('📍 Backend: http://localhost:5000');
  console.log('📍 Health: http://localhost:5000/api/health');
  console.log('');
  console.log('🗄️ BASE DE DATOS:');
  console.log('   Servidor: server.radioinsular.es');
  console.log('   Base de datos: eventos_n');
  console.log('   Usuario: eventos_u');
  console.log('');
  console.log('🔐 CREDENCIALES DE ADMIN:');
  console.log('   Email: admin@solarland.com');
  console.log('   Contraseña: admin123456');
  console.log('');
  console.log('📝 Endpoints disponibles:');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET /api/auth/verify - Verificar token');
  console.log('   GET /api/events/current - Evento actual');
  console.log('   GET /api/health - Health check');
  console.log('');
});