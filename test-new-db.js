// Script para probar la nueva base de datos en server.radioinsular.es
const { Client } = require('pg');

console.log('====================================');
console.log('🔍 PROBANDO NUEVA BASE DE DATOS');
console.log('====================================');
console.log('');

const config = {
  host: 'server.radioinsular.es',
  port: 5432,
  database: 'eventos_n',
  user: 'eventos_u',
  password: 'eventos_pass',
  ssl: false
};

async function testConnection() {
  console.log('📝 Configuración:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ***${config.password.slice(-4)}`);
  console.log('');

  const client = new Client(config);

  try {
    console.log('🔗 Intentando conectar...');
    await client.connect();
    console.log('✅ CONEXIÓN EXITOSA!');
    console.log('');

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log(`📊 PostgreSQL: ${versionResult.rows[0].version}`);
    console.log('');

    // Verificar hora del servidor
    const timeResult = await client.query('SELECT NOW()');
    console.log(`⏰ Hora del servidor: ${timeResult.rows[0].now}`);
    console.log('');

    // Verificar tablas existentes
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(`📊 Tablas encontradas: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      console.log('   Tablas:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('   ⚠️ No hay tablas. La base de datos está vacía.');
    }

    await client.end();

    console.log('');
    console.log('====================================');
    console.log('✅ CONEXIÓN VERIFICADA');
    console.log('====================================');
    console.log('');
    console.log('La nueva base de datos está accesible.');
    console.log('Ahora puedes ejecutar las migraciones.');

    return true;
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
    console.log('');
    console.log('Posibles causas:');
    console.log('1. El servidor no está accesible');
    console.log('2. Las credenciales son incorrectas');
    console.log('3. El firewall está bloqueando la conexión');
    console.log('4. PostgreSQL no permite conexiones remotas');

    await client.end().catch(() => {});
    return false;
  }
}

testConnection();