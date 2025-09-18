// Script para agregar columnas adicionales a la tabla events
const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'server.radioinsular.es',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventos_n',
  user: process.env.DB_USER || 'eventos_u',
  password: process.env.DB_PASSWORD || 'eventos_pass',
  ssl: false
};

async function addEventColumns() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Agregar columnas adicionales a events
    console.log('\n📝 Actualizando tabla events con columnas adicionales...');

    // Campos de ubicación detallados
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_name VARCHAR(255)`);
      console.log('✅ Columna venue_name agregada');
    } catch (err) {
      console.log('⚠️ venue_name: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_address VARCHAR(255)`);
      console.log('✅ Columna venue_address agregada');
    } catch (err) {
      console.log('⚠️ venue_address: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_city VARCHAR(100)`);
      console.log('✅ Columna venue_city agregada');
    } catch (err) {
      console.log('⚠️ venue_city: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_postal_code VARCHAR(20)`);
      console.log('✅ Columna venue_postal_code agregada');
    } catch (err) {
      console.log('⚠️ venue_postal_code: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS google_maps_url TEXT`);
      console.log('✅ Columna google_maps_url agregada');
    } catch (err) {
      console.log('⚠️ google_maps_url: ' + err.message);
    }

    // Agenda y programa del evento
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda JSONB`);
      console.log('✅ Columna agenda agregada (JSONB para items de agenda)');
    } catch (err) {
      console.log('⚠️ agenda: ' + err.message);
    }

    // Información de registro
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline DATE`);
      console.log('✅ Columna registration_deadline agregada');
    } catch (err) {
      console.log('⚠️ registration_deadline: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_info TEXT`);
      console.log('✅ Columna registration_info agregada');
    } catch (err) {
      console.log('⚠️ registration_info: ' + err.message);
    }

    // Campos adicionales
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS requirements TEXT`);
      console.log('✅ Columna requirements agregada');
    } catch (err) {
      console.log('⚠️ requirements: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS materials TEXT`);
      console.log('✅ Columna materials agregada');
    } catch (err) {
      console.log('⚠️ materials: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS tags JSONB`);
      console.log('✅ Columna tags agregada (JSONB para etiquetas)');
    } catch (err) {
      console.log('⚠️ tags: ' + err.message);
    }

    // Redes sociales
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255)`);
      console.log('✅ Columna facebook_url agregada');
    } catch (err) {
      console.log('⚠️ facebook_url: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255)`);
      console.log('✅ Columna twitter_url agregada');
    } catch (err) {
      console.log('⚠️ twitter_url: ' + err.message);
    }

    // Información del organizador
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_name VARCHAR(255)`);
      console.log('✅ Columna organizer_name agregada');
    } catch (err) {
      console.log('⚠️ organizer_name: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_email VARCHAR(255)`);
      console.log('✅ Columna organizer_email agregada');
    } catch (err) {
      console.log('⚠️ organizer_email: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_phone VARCHAR(50)`);
      console.log('✅ Columna organizer_phone agregada');
    } catch (err) {
      console.log('⚠️ organizer_phone: ' + err.message);
    }

    // Campo para capacidad máxima de asistentes (alternativo a capacity)
    try {
      await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS max_attendees INTEGER`);
      console.log('✅ Columna max_attendees agregada');
    } catch (err) {
      console.log('⚠️ max_attendees: ' + err.message);
    }

    // Mostrar resumen
    console.log('\n✅ BASE DE DATOS ACTUALIZADA CON CAMPOS ADICIONALES');

    // Verificar columnas actualizadas
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'events'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Columnas actuales en events:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})${row.column_default ? ' DEFAULT ' + row.column_default : ''}`);
    });

    await client.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
    process.exit(1);
  }
}

addEventColumns();