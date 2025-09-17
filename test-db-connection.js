// Test de conexión a la base de datos de gestsiete.es
const { Client } = require('pg');

const config = {
  host: 'gestsiete.es',
  port: 5432,
  database: 'events_n',
  user: 'events_u',
  password: 'events_pass$$',  // Contraseña con doble $$
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
};

console.log('🔍 Intentando conectar a la base de datos...');
console.log('   Host:', config.host);
console.log('   Port:', config.port);
console.log('   Database:', config.database);
console.log('   User:', config.user);
console.log('   SSL:', config.ssl ? 'Enabled' : 'Disabled');

const client = new Client(config);

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Conexión establecida exitosamente!');
    
    // Probar una consulta simple
    const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('📊 Información del servidor:');
    console.log('   Hora actual:', result.rows[0].current_time);
    console.log('   Versión PostgreSQL:', result.rows[0].pg_version);
    
    // Listar las tablas si existen
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tables.rows.length > 0) {
      console.log('📋 Tablas encontradas:');
      tables.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    } else {
      console.log('⚠️  No hay tablas en la base de datos (necesitas ejecutar migraciones)');
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('   Código:', error.code);
    console.error('   Detalle:', error.detail || 'N/A');
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('💡 El servidor gestsiete.es no se puede resolver. Verifica la conexión a internet.');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 La conexión fue rechazada. El servidor puede estar bloqueando conexiones externas.');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 Credenciales incorrectas. Verifica usuario y contraseña.');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Timeout de conexión. El servidor puede estar inaccesible desde tu red.');
    }
  } finally {
    await client.end();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();