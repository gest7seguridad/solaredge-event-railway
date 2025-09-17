// Servidor de prueba mínimo para Plesk
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());

// Health check simple
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    port: PORT,
    message: 'Servidor funcionando correctamente'
  });
});

// Login de prueba (sin BD por ahora)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  console.log(`Login attempt: ${email}`);

  // Usuario hardcoded para prueba
  if (email === 'admin@solarland.com' && password === 'admin123456') {
    res.json({
      success: true,
      token: 'test-token-123456',
      user: {
        id: 1,
        email: 'admin@solarland.com',
        name: 'Administrador',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales inválidas'
    });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Prueba en: http://localhost:${PORT}/api/health`);
});