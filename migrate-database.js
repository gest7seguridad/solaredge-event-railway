// Script de migración para la nueva base de datos
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const config = {
  host: 'server.radioinsular.es',
  port: 5432,
  database: 'eventos_n',
  user: 'eventos_u',
  password: 'eventos_pass',
  ssl: false
};

async function migrate() {
  console.log('====================================');
  console.log('🚀 MIGRACIÓN DE BASE DE DATOS');
  console.log('====================================');
  console.log('');
  console.log(`📍 Servidor: ${config.host}`);
  console.log(`📍 Base de datos: ${config.database}`);
  console.log('');

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // 1. Crear tabla admin_users
    console.log('📝 Creando tabla admin_users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla admin_users creada\n');

    // 2. Crear tabla events
    console.log('📝 Creando tabla events...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        time TIME NOT NULL,
        location VARCHAR(255),
        capacity INTEGER DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla events creada\n');

    // 3. Crear tabla registrations
    console.log('📝 Creando tabla registrations...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(255),
        position VARCHAR(100),
        distributor BOOLEAN DEFAULT false,
        country VARCHAR(100),
        gdpr_consent BOOLEAN DEFAULT false,
        is_confirmed BOOLEAN DEFAULT false,
        confirmation_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, email)
      )
    `);
    console.log('✅ Tabla registrations creada\n');

    // 4. Crear índices
    console.log('📝 Creando índices...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
      CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
      CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
      CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_email ON registrations(email);
      CREATE INDEX IF NOT EXISTS idx_registrations_token ON registrations(confirmation_token);
    `);
    console.log('✅ Índices creados\n');

    // 5. Insertar usuario admin
    console.log('📝 Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('admin123456', 10);

    await client.query(`
      INSERT INTO admin_users (email, password, name, role, is_active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email)
      DO UPDATE SET
        password = $2,
        is_active = $5,
        updated_at = CURRENT_TIMESTAMP
    `, [
      'admin@solarland.com',
      hashedPassword,
      'Administrador',
      'admin',
      true
    ]);
    console.log('✅ Usuario administrador creado');
    console.log('   Email: admin@solarland.com');
    console.log('   Contraseña: admin123456\n');

    // 6. Crear evento de ejemplo
    console.log('📝 Creando evento de ejemplo...');
    await client.query(`
      INSERT INTO events (title, description, date, time, location, capacity, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING
    `, [
      'Evento SolarEdge 2025',
      'Presentación de nuevos productos y tecnologías solares',
      '2025-02-20',
      '10:00:00',
      'Madrid, España',
      100,
      true
    ]);
    console.log('✅ Evento de ejemplo creado\n');

    // 7. Verificar migración
    console.log('📊 Verificando migración...');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`   Tablas creadas: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });

    console.log('\n====================================');
    console.log('✅ MIGRACIÓN COMPLETADA CON ÉXITO');
    console.log('====================================\n');

    console.log('📋 Resumen:');
    console.log('   - 3 tablas creadas');
    console.log('   - 6 índices creados');
    console.log('   - 1 usuario admin creado');
    console.log('   - 1 evento de ejemplo creado\n');

    console.log('🔐 Credenciales de acceso:');
    console.log('   URL: https://solarland.gestsiete.es/admin');
    console.log('   Email: admin@solarland.com');
    console.log('   Contraseña: admin123456\n');

    await client.end();
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('\nDetalles:', error);
    await client.end();
    process.exit(1);
  }
}

// Ejecutar migración
migrate();