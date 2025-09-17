// Script específico para probar con events_pass (sin $$)
const { Client } = require('pg');

console.log('====================================');
console.log('🔍 PROBANDO CONTRASEÑA: events_pass');
console.log('====================================');
console.log('');

// Configuraciones a probar
const configs = [
  {
    name: 'Config 1: events_pass (sin $$)',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Config 2: events_pass sin SSL',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass',
    ssl: false
  },
  {
    name: 'Config 3: Con comillas',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: '"events_pass"',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Config 4: events_pass$$ (original)',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$',
    ssl: { rejectUnauthorized: false }
  }
];

async function testConnection(config) {
  console.log(`\n📝 Probando: ${config.name}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ${config.password}`);
  console.log(`   SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);

  const client = new Client(config);

  try {
    console.log('   Intentando conectar...');
    await client.connect();

    console.log('   ✅ CONEXIÓN EXITOSA!');

    // Probar query simple
    const result = await client.query('SELECT NOW()');
    console.log(`   ⏰ Hora del servidor: ${result.rows[0].now}`);

    // Verificar versión
    const versionResult = await client.query('SELECT version()');
    const version = versionResult.rows[0].version.split(' ')[1];
    console.log(`   📊 PostgreSQL versión: ${version}`);

    // Verificar tabla admin_users
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'admin_users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Tabla admin_users EXISTE');
    } else {
      console.log('   ⚠️  Tabla admin_users NO existe');
    }

    await client.end();

    console.log('');
    console.log('====================================');
    console.log('✅ CONFIGURACIÓN CORRECTA ENCONTRADA');
    console.log('====================================');
    console.log('');
    console.log('Usa estos datos en tu .env:');
    console.log(`DB_HOST=${config.host}`);
    console.log(`DB_PORT=${config.port}`);
    console.log(`DB_NAME=${config.database}`);
    console.log(`DB_USER=${config.user}`);
    console.log(`DB_PASSWORD=${config.password}`);
    if (config.ssl) {
      console.log('DB_SSL=true');
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function testAllConfigs() {
  let success = false;

  for (const config of configs) {
    success = await testConnection(config);
    if (success) {
      break;
    }
  }

  if (!success) {
    console.log('');
    console.log('====================================');
    console.log('❌ NINGUNA CONFIGURACIÓN FUNCIONÓ');
    console.log('====================================');
    console.log('');
    console.log('Parece que la contraseña ha sido cambiada.');
    console.log('');
    console.log('Opciones:');
    console.log('1. Contactar al administrador del servidor');
    console.log('2. Resetear la contraseña desde Plesk (si es posible)');
    console.log('3. Revisar el archivo .env en el servidor');
  }

  process.exit(0);
}

// Ejecutar pruebas
testAllConfigs().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});