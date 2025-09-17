// Script para probar conexión con base de datos remota
const { Client } = require('pg');

console.log('====================================');
console.log('🔍 PROBANDO CONEXIÓN A BASE DE DATOS REMOTA');
console.log('====================================');
console.log('');

// Configuraciones a probar
const configs = [
  {
    name: 'Config 1: Con $$ en contraseña',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Config 2: Sin $$ en contraseña',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass',
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Config 3: Sin SSL',
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$',
    ssl: false
  }
];

async function testConnection(config) {
  console.log(`📝 Probando: ${config.name}`);
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Password: ***${config.password.slice(-4)}`);
  console.log(`   SSL: ${config.ssl ? 'Enabled' : 'Disabled'}`);

  const client = new Client(config);

  try {
    // Intentar conectar
    await client.connect();
    console.log('   ✅ CONEXIÓN EXITOSA!');

    // Probar query simple
    const result = await client.query('SELECT NOW()');
    console.log(`   ⏰ Hora del servidor: ${result.rows[0].now}`);

    // Verificar si existe la tabla admin_users
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'admin_users'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('   ✅ Tabla admin_users EXISTE');

      // Contar usuarios
      const countResult = await client.query('SELECT COUNT(*) FROM admin_users');
      console.log(`   👥 Usuarios en admin_users: ${countResult.rows[0].count}`);

      // Verificar si existe el admin
      const adminCheck = await client.query(
        "SELECT email, name, role, is_active FROM admin_users WHERE email = 'admin@solarland.com'"
      );

      if (adminCheck.rows.length > 0) {
        const admin = adminCheck.rows[0];
        console.log('   ✅ Usuario admin@solarland.com EXISTE');
        console.log(`      - Nombre: ${admin.name}`);
        console.log(`      - Role: ${admin.role}`);
        console.log(`      - Activo: ${admin.is_active ? 'Sí' : 'No'}`);
      } else {
        console.log('   ❌ Usuario admin@solarland.com NO existe');
      }
    } else {
      console.log('   ⚠️  Tabla admin_users NO EXISTE');
    }

    // Listar todas las tablas
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('   📊 Tablas en la base de datos:');
    tablesResult.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });

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
    console.log('');

    return true;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    await client.end().catch(() => {});
    return false;
  }
}

async function testAllConfigs() {
  for (const config of configs) {
    const success = await testConnection(config);
    console.log('');
    if (success) {
      break; // Si una configuración funciona, parar
    }
  }

  console.log('====================================');
  console.log('Prueba completada');
  console.log('====================================');
  process.exit(0);
}

// Ejecutar pruebas
testAllConfigs().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});