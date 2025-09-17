// Script simple para probar el login localmente
const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Usuario admin hardcodeado para pruebas
const ADMIN_USER = {
  id: 1,
  email: 'admin@solarland.com',
  password: null, // Se generará abajo
  name: 'Administrador',
  role: 'admin'
};

// Generar hash para admin123456
bcrypt.hash('admin123456', 10).then(hash => {
  ADMIN_USER.password = hash;
  console.log('✅ Hash generado para admin123456');
  console.log('Hash:', hash);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt:', req.body);

  const { email, password } = req.body;

  // Verificar email
  if (email !== ADMIN_USER.email) {
    console.log('❌ Email no coincide');
    return res.status(401).json({
      message: 'Credenciales inválidas',
      error: 'Email incorrecto'
    });
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, ADMIN_USER.password);

  if (!isValidPassword) {
    // Probar también con contraseña sin hash para debugging
    if (password === 'admin123456') {
      console.log('⚠️ Contraseña correcta pero hash no coincide, generando token de todos modos...');
    } else {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        message: 'Credenciales inválidas',
        error: 'Contraseña incorrecta'
      });
    }
  }

  // Generar JWT
  const token = jwt.sign(
    {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      role: ADMIN_USER.role
    },
    'test-secret-key',
    { expiresIn: '24h' }
  );

  console.log('✅ Login exitoso');

  res.json({
    success: true,
    token,
    user: {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      name: ADMIN_USER.name,
      role: ADMIN_USER.role
    }
  });
});

// Get current event (mock)
app.get('/api/events/current', (req, res) => {
  res.json({
    id: 1,
    title: 'Evento de Prueba',
    description: 'Evento para testing',
    date: '2025-02-20',
    time: '10:00',
    location: 'Madrid',
    capacity: 100,
    currentRegistrations: 0,
    isActive: true
  });
});

// Verificar admin (con auth)
app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, 'test-secret-key');
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
  console.log('🚀 SERVIDOR DE PRUEBA INICIADO');
  console.log('========================================');
  console.log('');
  console.log('📍 Backend: http://localhost:5000');
  console.log('📍 Health: http://localhost:5000/api/health');
  console.log('');
  console.log('🔐 CREDENCIALES DE PRUEBA:');
  console.log('   Email: admin@solarland.com');
  console.log('   Contraseña: admin123456');
  console.log('');
  console.log('📝 Endpoints disponibles:');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET /api/auth/verify - Verificar token');
  console.log('   GET /api/events/current - Evento actual');
  console.log('   GET /api/health - Health check');
  console.log('');
  console.log('Para probar el frontend, abre otra terminal y ejecuta:');
  console.log('   cd frontend && npm run dev');
  console.log('');
});