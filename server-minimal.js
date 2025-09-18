// Servidor mínimo para diagnosticar Plesk
const http = require('http');
const PORT = process.env.PORT || 3000;

console.log('========================================');
console.log('INICIANDO SERVIDOR MÍNIMO DE DIAGNÓSTICO');
console.log(`Puerto: ${PORT}`);
console.log(`Node Version: ${process.version}`);
console.log(`Plataforma: ${process.platform}`);
console.log(`PID: ${process.pid}`);
console.log('========================================');

const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      message: 'Servidor mínimo funcionando',
      timestamp: new Date().toISOString(),
      port: PORT
    }));
  } else if (req.url === '/api/auth/login' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      message: 'Login endpoint funcionando (test)',
      token: 'test-token-123'
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not found',
      url: req.url,
      method: req.method
    }));
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
  console.log('Endpoints disponibles:');
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
});

// Manejo de errores
server.on('error', (err) => {
  console.error('ERROR DEL SERVIDOR:', err);
});

process.on('uncaughtException', (err) => {
  console.error('EXCEPCIÓN NO CAPTURADA:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('RECHAZO NO MANEJADO:', err);
});