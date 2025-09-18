// Script para actualizar la base de datos con columnas faltantes
const { Client } = require('pg');

const dbConfig = {
  host: process.env.DB_HOST || 'server.radioinsular.es',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'eventos_n',
  user: process.env.DB_USER || 'eventos_u',
  password: process.env.DB_PASSWORD || 'eventos_pass',
  ssl: false
};

async function updateDatabase() {
  const client = new Client(dbConfig);

  try {
    await client.connect();
    console.log('🔌 Conectado a la base de datos');

    // Agregar columnas faltantes a registrations
    console.log('\n📝 Actualizando tabla registrations...');

    try {
      await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS qr_code VARCHAR(255)`);
      console.log('✅ Columna qr_code agregada');
    } catch (err) {
      console.log('⚠️ qr_code: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false`);
      console.log('✅ Columna checked_in agregada');
    } catch (err) {
      console.log('⚠️ checked_in: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP`);
      console.log('✅ Columna checked_in_at agregada');
    } catch (err) {
      console.log('⚠️ checked_in_at: ' + err.message);
    }

    try {
      await client.query(`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`);
      console.log('✅ Columna status agregada');
    } catch (err) {
      console.log('⚠️ status: ' + err.message);
    }

    // Verificar columnas de events
    console.log('\n📝 Verificando tabla events...');

    const eventCols = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'events'
    `);

    const eventColumns = eventCols.rows.map(r => r.column_name);
    console.log('Columnas actuales en events:', eventColumns.join(', '));

    // Mostrar resumen
    console.log('\n✅ BASE DE DATOS ACTUALIZADA');

    // Verificar columnas actualizadas
    const result = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'registrations'
      ORDER BY ordinal_position
    `);

    console.log('\n📋 Columnas en registrations:');
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

updateDatabase();