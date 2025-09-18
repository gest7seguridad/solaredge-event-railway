// ==================== CONFIGURACIÓN OPTIMIZADA PARA PLESK ====================
// Este archivo está especialmente configurado para funcionar con Plesk

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== CONFIGURACIÓN DE LA BASE DE DATOS ====================
const dbConfig = {
  host: process.env.DB_HOST || 'server.radioinsular.es',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventos_n',
  user: process.env.DB_USER || 'eventos_u',
  password: process.env.DB_PASSWORD || 'eventos_pass',
  ssl: false,
  connectionTimeoutMillis: 10000,
  idle_timeout: 30000
};

// ==================== MIDDLEWARE ====================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuración CORS mejorada para Plesk
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://solarland.gestsiete.es',
      'http://localhost:3000',
      'http://localhost:5173'
    ];

    // Permitir requests sin origin (ej. Postman, apps móviles)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`[CORS] Origin bloqueado: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));

// ==================== ARCHIVOS ESTÁTICOS ====================
const publicPath = path.join(__dirname, 'backend/public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log(`[INFO] Sirviendo archivos estáticos desde: ${publicPath}`);
} else {
  console.log('[WARNING] No se encontró directorio backend/public');
}

// ==================== HEALTH CHECK ====================
app.get('/api/health', async (req, res) => {
  try {
    const client = new Client(dbConfig);
    await client.connect();
    await client.query('SELECT NOW()');
    await client.end();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: 'connected',
      port: PORT
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: 'error',
      error: error.message,
      port: PORT
    });
  }
});

// ==================== AUTENTICACIÓN ====================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[AUTH] Intento de login: ${email}`);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('[DB] Conectado a la base de datos');

    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await client.query(query, [email]);

    if (result.rows.length === 0) {
      console.log(`[AUTH] Usuario no encontrado: ${email}`);
      await client.end();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log(`[AUTH] Contraseña incorrecta para: ${email}`);
      await client.end();
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_jwt_secret_cambiar_en_produccion',
      { expiresIn: '7d' }
    );

    console.log(`[AUTH] Login exitoso: ${email}`);
    await client.end();

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'admin'
      }
    });

  } catch (error) {
    console.error('[ERROR] Error en login:', error);
    await client.end().catch(() => {});
    res.status(500).json({
      success: false,
      message: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== MIDDLEWARE DE AUTENTICACIÓN ====================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret_cambiar_en_produccion', (err, decoded) => {
    if (err) {
      console.log('[AUTH] Token inválido:', err.message);
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
};

// ==================== EVENTOS ====================
app.get('/api/events', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const query = 'SELECT * FROM events ORDER BY date DESC';
    const result = await client.query(query);
    await client.end();

    res.json(result.rows);
  } catch (error) {
    console.error('[ERROR] Error obteniendo eventos:', error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error obteniendo eventos' });
  }
});

app.get('/api/events/current', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const query = 'SELECT * FROM events WHERE is_active = true ORDER BY date ASC LIMIT 1';
    const result = await client.query(query);
    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay eventos activos' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[ERROR] Error obteniendo evento actual:', error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error obteniendo evento actual' });
  }
});

// ==================== RUTAS PROTEGIDAS ====================
app.get('/api/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const query = 'SELECT * FROM events WHERE id = $1';
    const result = await client.query(query, [id]);
    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[ERROR] Error obteniendo evento:', error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error obteniendo evento' });
  }
});

app.post('/api/events', authenticateToken, async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const {
      title, description, date, time, location, capacity, image_url, is_active,
      venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
      agenda, registration_deadline, registration_info, requirements, materials,
      tags, facebook_url, twitter_url, organizer_name, organizer_email,
      organizer_phone, max_attendees
    } = req.body;

    const query = `
      INSERT INTO events (
        title, description, date, time, location, capacity, image_url, is_active,
        venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
        agenda, registration_deadline, registration_info, requirements, materials,
        tags, facebook_url, twitter_url, organizer_name, organizer_email,
        organizer_phone, max_attendees
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING *
    `;

    const values = [
      title, description, date, time, location, capacity || 0, image_url || '',
      is_active !== false, venue_name, venue_address, venue_city, venue_postal_code,
      google_maps_url, JSON.stringify(agenda || []), registration_deadline,
      registration_info, requirements, materials, JSON.stringify(tags || []),
      facebook_url, twitter_url, organizer_name, organizer_email, organizer_phone,
      max_attendees || capacity || 0
    ];

    const result = await client.query(query, values);
    await client.end();

    console.log(`[EVENT] Evento creado: ${title}`);
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('[ERROR] Error creando evento:', error);
    await client.end().catch(() => {});
    res.status(500).json({
      message: 'Error creando evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const {
      title, description, date, time, location, capacity, image_url, is_active,
      venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
      agenda, registration_deadline, registration_info, requirements, materials,
      tags, facebook_url, twitter_url, organizer_name, organizer_email,
      organizer_phone, max_attendees
    } = req.body;

    const query = `
      UPDATE events SET
        title = $1, description = $2, date = $3, time = $4, location = $5,
        capacity = $6, image_url = $7, is_active = $8, venue_name = $9,
        venue_address = $10, venue_city = $11, venue_postal_code = $12,
        google_maps_url = $13, agenda = $14, registration_deadline = $15,
        registration_info = $16, requirements = $17, materials = $18, tags = $19,
        facebook_url = $20, twitter_url = $21, organizer_name = $22,
        organizer_email = $23, organizer_phone = $24, max_attendees = $25,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $26
      RETURNING *
    `;

    const values = [
      title, description, date, time, location, capacity || 0, image_url || '',
      is_active !== false, venue_name, venue_address, venue_city, venue_postal_code,
      google_maps_url, JSON.stringify(agenda || []), registration_deadline,
      registration_info, requirements, materials, JSON.stringify(tags || []),
      facebook_url, twitter_url, organizer_name, organizer_email, organizer_phone,
      max_attendees || capacity || 0, id
    ];

    const result = await client.query(query, values);
    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    console.log(`[EVENT] Evento actualizado: ${title}`);
    res.json(result.rows[0]);

  } catch (error) {
    console.error('[ERROR] Error actualizando evento:', error);
    await client.end().catch(() => {});
    res.status(500).json({
      message: 'Error actualizando evento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const query = 'DELETE FROM events WHERE id = $1 RETURNING title';
    const result = await client.query(query, [id]);
    await client.end();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    console.log(`[EVENT] Evento eliminado: ${result.rows[0].title}`);
    res.json({ message: 'Evento eliminado correctamente' });

  } catch (error) {
    console.error('[ERROR] Error eliminando evento:', error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error eliminando evento' });
  }
});

// ==================== REGISTROS ====================
app.post('/api/registrations/register', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    const { name, email, phone, company, event_id } = req.body;

    // Verificar si ya existe un registro
    const checkQuery = 'SELECT * FROM registrations WHERE email = $1 AND event_id = $2';
    const checkResult = await client.query(checkQuery, [email, event_id || 1]);

    if (checkResult.rows.length > 0) {
      await client.end();
      return res.status(400).json({
        message: 'Ya existe un registro con este email para este evento'
      });
    }

    // Crear nuevo registro
    const verificationCode = Math.random().toString(36).substring(2, 15).toUpperCase();
    const insertQuery = `
      INSERT INTO registrations
      (name, email, phone, company, event_id, verification_code, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *
    `;

    const values = [name, email, phone, company, event_id || 1, verificationCode];
    const result = await client.query(insertQuery, values);
    await client.end();

    console.log(`[REGISTRATION] Nuevo registro: ${email}`);
    res.status(201).json({
      message: 'Registro exitoso',
      verificationCode,
      registration: result.rows[0]
    });

  } catch (error) {
    console.error('[ERROR] Error en registro:', error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error procesando el registro' });
  }
});

// ==================== SPA FALLBACK ====================
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'backend/public/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({
        message: 'Frontend no encontrado',
        path: indexPath,
        hint: 'Ejecuta npm run build en el directorio frontend/'
      });
    }
  } else {
    res.status(404).json({ message: 'Endpoint no encontrado' });
  }
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== INICIAR SERVIDOR ====================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🚀 SERVIDOR OPTIMIZADO PARA PLESK');
  console.log('========================================');
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🗄️ Base de datos: ${dbConfig.host}/${dbConfig.database}`);
  console.log(`📅 Iniciado: ${new Date().toISOString()}`);
  console.log('');
  console.log('📝 Endpoints disponibles:');
  console.log('   GET  /api/health - Health check');
  console.log('   POST /api/auth/login - Login');
  console.log('   GET  /api/events - Lista de eventos');
  console.log('   GET  /api/events/current - Evento actual');
  console.log('========================================');
});

// Manejo de señales para cerrar gracefully
process.on('SIGTERM', () => {
  console.log('[INFO] SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('[INFO] Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[INFO] SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('[INFO] Servidor cerrado');
    process.exit(0);
  });
});