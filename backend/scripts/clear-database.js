// Script para vaciar todas las tablas de la base de datos
// ADVERTENCIA: Esto eliminará TODOS los datos

const knex = require('knex');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Configuración de base de datos de producción
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'server.radioinsular.es',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'eventos_n',
    user: process.env.DB_USER || 'eventos_u',
    password: process.env.DB_PASSWORD || 'eventos_pass',
    ssl: { rejectUnauthorized: false }
  }
};

async function clearDatabase() {
  const db = knex(dbConfig);

  console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de la base de datos');
  console.log('📊 Conectando a base de datos...');
  console.log('   Host:', dbConfig.connection.host);
  console.log('   Database:', dbConfig.connection.database);
  console.log('');

  try {
    // Obtener todas las tablas
    const tables = await db.raw(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT IN ('knex_migrations', 'knex_migrations_lock')
    `);

    const tableNames = tables.rows.map(row => row.tablename);

    if (tableNames.length === 0) {
      console.log('📭 No hay tablas para vaciar');
      await db.destroy();
      return;
    }

    console.log('📋 Tablas encontradas:');
    tableNames.forEach(table => console.log('   -', table));
    console.log('');

    // Vaciar cada tabla con DELETE en lugar de TRUNCATE para evitar problemas de permisos
    for (const tableName of tableNames) {
      console.log(`🗑️  Vaciando tabla: ${tableName}...`);
      try {
        // Primero intentamos con TRUNCATE CASCADE
        await db.raw(`TRUNCATE TABLE ${tableName} CASCADE`);
        console.log(`   ✅ ${tableName} vaciada con TRUNCATE`);
      } catch (truncateError) {
        // Si falla, usamos DELETE
        console.log(`   ⚠️  TRUNCATE falló, usando DELETE...`);
        const deleteCount = await db(tableName).del();
        console.log(`   ✅ ${tableName} vaciada - ${deleteCount} registros eliminados`);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('✅ BASE DE DATOS VACIADA COMPLETAMENTE');
    console.log('========================================');
    console.log('');
    console.log('Todas las tablas han sido vaciadas.');
    console.log('Las tablas de migraciones se mantuvieron intactas.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    
    if (error.code === '28P01') {
      console.error('Error de autenticación. Verifica la contraseña.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('No se puede conectar a la base de datos. Verifica:');
      console.error('  - Host:', dbConfig.connection.host);
      console.error('  - Puerto:', dbConfig.connection.port);
    } else {
      console.error('Detalles del error:', error);
    }
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// Confirmación antes de ejecutar
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('');
console.log('⚠️  ⚠️  ⚠️  ADVERTENCIA ⚠️  ⚠️  ⚠️');
console.log('');
console.log('Este script ELIMINARÁ TODOS LOS DATOS de la base de datos:');
console.log('  Host:', dbConfig.connection.host);
console.log('  Database:', dbConfig.connection.database);
console.log('');
console.log('Esta acción NO se puede deshacer.');
console.log('');

rl.question('¿Estás seguro que quieres continuar? (escribe "SI" para confirmar): ', (answer) => {
  if (answer === 'SI') {
    rl.close();
    clearDatabase();
  } else {
    console.log('Operación cancelada.');
    rl.close();
    process.exit(0);
  }
});