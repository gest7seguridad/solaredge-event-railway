// Servidor de prueba SIMPLE sin dependencias
const http = require('http');
const crypto = require('crypto');

const PORT = 5001;

// Función para parsear JSON del body
const getBodyJSON = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
};

// Crear servidor
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`📍 ${req.method} ${req.url}`);

  // Routes
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
    return;
  }

  if (req.url === '/api/events/current' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
      id: 1,
      title: 'Evento de Prueba',
      description: 'Evento para testing local',
      date: '2025-02-20',
      time: '10:00',
      location: 'Madrid',
      capacity: 100,
      currentRegistrations: 0,
      isActive: true
    }));
    return;
  }

  if (req.url === '/api/auth/login' && req.method === 'POST') {
    const body = await getBodyJSON(req);
    console.log('🔐 Login attempt:', body);

    const { email, password } = body;

    // Verificar credenciales (hardcoded para prueba)
    if (email === 'admin@solarland.com' && password === 'admin123456') {
      console.log('✅ Login exitoso');

      // Generar token simple
      const token = crypto.randomBytes(32).toString('hex');

      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        token,
        user: {
          id: 1,
          email: 'admin@solarland.com',
          name: 'Administrador',
          role: 'admin'
        }
      }));
    } else {
      console.log('❌ Credenciales incorrectas');
      res.writeHead(401);
      res.end(JSON.stringify({
        message: 'Credenciales inválidas',
        receivedEmail: email,
        receivedPassword: password ? '***' : 'empty'
      }));
    }
    return;
  }

  if (req.url === '/api/auth/verify' && req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      res.writeHead(200);
      res.end(JSON.stringify({
        valid: true,
        user: {
          id: 1,
          email: 'admin@solarland.com',
          role: 'admin'
        }
      }));
    } else {
      res.writeHead(401);
      res.end(JSON.stringify({ message: 'No autorizado' }));
    }
    return;
  }

  // 404 para otras rutas
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log('');
  console.log('========================================');
  console.log('🚀 SERVIDOR DE PRUEBA SIMPLE INICIADO');
  console.log('========================================');
  console.log('');
  console.log('📍 Backend: http://localhost:5001');
  console.log('📍 Health: http://localhost:5001/api/health');
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
  console.log('🎨 Para el frontend:');
  console.log('   1. Abre otra terminal');
  console.log('   2. cd frontend && npm run dev');
  console.log('   3. Abre http://localhost:3000');
  console.log('');
  console.log('⭐ El login funciona con las credenciales de arriba');
  console.log('');
});