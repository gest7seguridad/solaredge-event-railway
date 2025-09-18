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
  origin: ['https://solarland.gestsiete.es', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Servir archivos estáticos del frontend
// Servir archivos estáticos del frontend desde backend/public (producción)
const publicPath = path.join(__dirname, 'backend/public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log(`[INFO] Sirviendo archivos estáticos desde: ${publicPath}`);
} else {
  console.log('[WARNING] No se encontró directorio backend/public. Ejecuta npm run build en frontend/');
  // Fallback para desarrollo
  const devPath = path.join(__dirname, 'frontend/dist');
  if (fs.existsSync(devPath)) {
    app.use(express.static(devPath));
    console.log(`[INFO] Usando directorio de desarrollo: ${devPath}`);
  }
}

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

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'SolarLand2025ProductionToken!@#$%^&*()_+SecureKey';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Get all events
app.get('/api/events', async (req, res) => {
  const client = new Client(dbConfig);

  try {
    await client.connect();

    const result = await client.query(
      'SELECT * FROM events ORDER BY date DESC'
    );

    await client.end();

    res.json(result.rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo eventos:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Get event by ID
app.get('/api/events/:id', async (req, res) => {
  const client = new Client(dbConfig);
  const { id } = req.params;

  try {
    await client.connect();

    const result = await client.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    await client.end();

    res.json(result.rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo evento:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Create event (protected)
app.post('/api/events', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const {
    title, description, date, time, location, capacity, image_url, is_active,
    venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
    agenda, registration_deadline, registration_info, requirements, materials,
    tags, facebook_url, twitter_url, organizer_name, organizer_email,
    organizer_phone, max_attendees
  } = req.body;

  try {
    await client.connect();

    // Usar valores por defecto si no se proporcionan
    const eventDate = date || new Date().toISOString().split('T')[0]; // Fecha de hoy
    const eventTime = time || '10:00:00'; // 10:00 AM por defecto

    const result = await client.query(
      `INSERT INTO events (
        title, description, date, time, location, capacity, image_url, is_active,
        venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
        agenda, registration_deadline, registration_info, requirements, materials,
        tags, facebook_url, twitter_url, organizer_name, organizer_email,
        organizer_phone, max_attendees
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        title, description, eventDate, eventTime, location || '', capacity || 0,
        image_url || '', is_active !== false,
        venue_name || null, venue_address || null, venue_city || null,
        venue_postal_code || null, google_maps_url || null,
        agenda ? JSON.stringify(agenda) : null, registration_deadline || null,
        registration_info || null, requirements || null, materials || null,
        tags ? JSON.stringify(tags) : null, facebook_url || null, twitter_url || null,
        organizer_name || null, organizer_email || null, organizer_phone || null,
        max_attendees || null
      ]
    );

    await client.end();

    console.log(`[${new Date().toISOString()}] Evento creado:`, result.rows[0].title);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creando evento:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Update event (protected)
app.put('/api/events/:id', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { id } = req.params;
  const {
    title, description, date, time, location, capacity, image_url, is_active,
    venue_name, venue_address, venue_city, venue_postal_code, google_maps_url,
    agenda, registration_deadline, registration_info, requirements, materials,
    tags, facebook_url, twitter_url, organizer_name, organizer_email,
    organizer_phone, max_attendees
  } = req.body;

  try {
    await client.connect();

    const result = await client.query(
      `UPDATE events
       SET title = $1, description = $2, date = $3, time = $4, location = $5,
           capacity = $6, image_url = $7, is_active = $8,
           venue_name = $9, venue_address = $10, venue_city = $11,
           venue_postal_code = $12, google_maps_url = $13, agenda = $14,
           registration_deadline = $15, registration_info = $16, requirements = $17,
           materials = $18, tags = $19, facebook_url = $20, twitter_url = $21,
           organizer_name = $22, organizer_email = $23, organizer_phone = $24,
           max_attendees = $25, updated_at = NOW()
       WHERE id = $26 RETURNING *`,
      [
        title, description, date, time, location, capacity, image_url, is_active,
        venue_name || null, venue_address || null, venue_city || null,
        venue_postal_code || null, google_maps_url || null,
        agenda ? JSON.stringify(agenda) : null, registration_deadline || null,
        registration_info || null, requirements || null, materials || null,
        tags ? JSON.stringify(tags) : null, facebook_url || null, twitter_url || null,
        organizer_name || null, organizer_email || null, organizer_phone || null,
        max_attendees || null, id
      ]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    await client.end();

    console.log(`[${new Date().toISOString()}] Evento actualizado:`, result.rows[0].title);

    res.json(result.rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error actualizando evento:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Delete event (protected)
app.delete('/api/events/:id', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { id } = req.params;

  try {
    await client.connect();

    const result = await client.query(
      'DELETE FROM events WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Evento no encontrado' });
    }

    await client.end();

    console.log(`[${new Date().toISOString()}] Evento eliminado:`, result.rows[0].title);

    res.json({ message: 'Evento eliminado correctamente' });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error eliminando evento:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
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

// Admin: Get registrations with filters (protected)
app.get('/api/admin/registrations', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { search, status, eventId } = req.query;

  try {
    await client.connect();

    let query = 'SELECT * FROM registrations WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (eventId) {
      paramCount++;
      query += ` AND event_id = $${paramCount}`;
      params.push(eventId);
    }

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);

    await client.end();

    res.json(result.rows);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo registros:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Admin: Get dashboard stats (protected)
app.get('/api/admin/dashboard/stats', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { eventId } = req.query;

  try {
    await client.connect();

    // Get total registrations
    let totalQuery = 'SELECT COUNT(*) as total FROM registrations';
    const totalParams = [];

    if (eventId) {
      totalQuery += ' WHERE event_id = $1';
      totalParams.push(eventId);
    }

    const totalResult = await client.query(totalQuery, totalParams);

    // Get confirmed registrations
    let confirmedQuery = 'SELECT COUNT(*) as confirmed FROM registrations WHERE is_confirmed = true';
    const confirmedParams = [];

    if (eventId) {
      confirmedQuery += ' AND event_id = $1';
      confirmedParams.push(eventId);
    }

    const confirmedResult = await client.query(confirmedQuery, confirmedParams);

    // Get checked in registrations
    let checkedInQuery = 'SELECT COUNT(*) as checked_in FROM registrations WHERE checked_in = true';
    const checkedInParams = [];

    if (eventId) {
      checkedInQuery += ' AND event_id = $1';
      checkedInParams.push(eventId);
    }

    const checkedInResult = await client.query(checkedInQuery, checkedInParams);

    // Get recent registrations
    let recentQuery = 'SELECT * FROM registrations';
    const recentParams = [];

    if (eventId) {
      recentQuery += ' WHERE event_id = $1';
      recentParams.push(eventId);
    }

    recentQuery += ' ORDER BY created_at DESC LIMIT 5';

    const recentResult = await client.query(recentQuery, recentParams);

    await client.end();

    res.json({
      totalRegistrations: parseInt(totalResult.rows[0].total) || 0,
      confirmedRegistrations: parseInt(confirmedResult.rows[0].confirmed) || 0,
      checkedInCount: parseInt(checkedInResult.rows[0].checked_in) || 0,
      pendingRegistrations: (parseInt(totalResult.rows[0].total) || 0) - (parseInt(confirmedResult.rows[0].confirmed) || 0),
      recentRegistrations: recentResult.rows
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error obteniendo estadísticas:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Admin: Export registrations (protected)
app.get('/api/admin/registrations/export', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { eventId, format } = req.query;

  try {
    await client.connect();

    let query = 'SELECT * FROM registrations';
    const params = [];

    if (eventId) {
      query += ' WHERE event_id = $1';
      params.push(eventId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await client.query(query, params);

    await client.end();

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Empresa', 'Cargo', 'País', 'Confirmado', 'Check-in', 'Fecha'];
      const csvContent = [
        headers.join(','),
        ...result.rows.map(row => [
          row.id,
          row.first_name,
          row.last_name,
          row.email,
          row.phone || '',
          row.company || '',
          row.position || '',
          row.country || '',
          row.is_confirmed ? 'Sí' : 'No',
          row.checked_in ? 'Sí' : 'No',
          new Date(row.created_at).toISOString()
        ].join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
      res.send(csvContent);
    } else {
      res.json(result.rows);
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error exportando registros:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Admin: Update registration status (protected)
app.patch('/api/admin/registrations/:id/status', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { id } = req.params;
  const { status } = req.body;

  try {
    await client.connect();

    const result = await client.query(
      'UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await client.end();

    res.json(result.rows[0]);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error actualizando estado:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Admin: Delete registration (protected)
app.delete('/api/admin/registrations/:id', verifyToken, async (req, res) => {
  const client = new Client(dbConfig);
  const { id } = req.params;

  try {
    await client.connect();

    const result = await client.query(
      'DELETE FROM registrations WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Registro no encontrado' });
    }

    await client.end();

    res.json({ message: 'Registro eliminado correctamente' });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error eliminando registro:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Registration endpoints (public)
app.post('/api/registrations/register', async (req, res) => {
  const client = new Client(dbConfig);
  const { event_id, first_name, last_name, email, phone, company, position, distributor, country, gdpr_consent } = req.body;

  try {
    await client.connect();

    // Generate unique QR code
    const qr_code = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const confirmation_token = Math.random().toString(36).substr(2, 20);

    const result = await client.query(
      `INSERT INTO registrations
       (event_id, first_name, last_name, email, phone, company, position, distributor, country, gdpr_consent, qr_code, confirmation_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [event_id, first_name, last_name, email, phone, company, position, distributor || false, country, gdpr_consent || false, qr_code, confirmation_token]
    );

    await client.end();

    console.log(`[${new Date().toISOString()}] Nueva inscripción:`, email);

    res.status(201).json({
      success: true,
      registration: result.rows[0]
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en inscripción:`, error);
    await client.end().catch(() => {});

    if (error.code === '23505') { // Unique violation
      res.status(400).json({ message: 'Este email ya está registrado para este evento' });
    } else {
      res.status(500).json({ message: 'Error del servidor' });
    }
  }
});

// Verify registration
app.get('/api/registrations/verify/:code', async (req, res) => {
  const client = new Client(dbConfig);
  const { code } = req.params;

  try {
    await client.connect();

    const result = await client.query(
      'UPDATE registrations SET is_confirmed = true WHERE confirmation_token = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Código de verificación inválido' });
    }

    await client.end();

    res.json({
      success: true,
      registration: result.rows[0]
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error verificando registro:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Check-in with QR
app.post('/api/registrations/check-in/:code', async (req, res) => {
  const client = new Client(dbConfig);
  const { code } = req.params;

  try {
    await client.connect();

    const result = await client.query(
      'UPDATE registrations SET checked_in = true, checked_in_at = NOW() WHERE qr_code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      await client.end();
      return res.status(404).json({ message: 'Código QR inválido' });
    }

    await client.end();

    res.json({
      success: true,
      registration: result.rows[0]
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error en check-in:`, error);
    await client.end().catch(() => {});
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ==================== SPA FALLBACK ====================

// Servir el frontend para todas las rutas no API
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, 'backend/public/index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      // Fallback para desarrollo
      const devIndexPath = path.join(__dirname, 'frontend/dist/index.html');
      if (fs.existsSync(devIndexPath)) {
        res.sendFile(devIndexPath);
      } else {
        res.status(404).json({
          message: 'Frontend no encontrado. Ejecuta npm run build en frontend/',
          checkedPaths: [indexPath, devIndexPath]
        });
      }
    }
  } else {
    next();
  }
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

// Escuchar en todas las interfaces (necesario para Plesk)
app.listen(PORT, '0.0.0.0', () => {
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