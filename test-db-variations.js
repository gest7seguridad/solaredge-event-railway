// Script extendido para probar múltiples variaciones de conexión
const { Client } = require('pg');

console.log('====================================');
console.log('🔍 PRUEBA EXHAUSTIVA DE CONEXIÓN PostgreSQL');
console.log('====================================');
console.log('');

// Variaciones de contraseñas a probar
const passwords = [
  'events_pass$$',
  'events_pass\\$\\$',  // Escapando los $
  'events_pass$',       // Un solo $
  'events_pass',        // Sin $
  'events_pass$$$',     // Triple $
  'events_pass\\$\\$',  // Escape diferente
  '"events_pass$$"',    // Entre comillas
  "'events_pass$$'",    // Entre comillas simples
  'events_pass%24%24',  // URL encoded $$
  'events_pass@',       // Variación común
  'Events_pass$$',      // Capital E
  'EVENTS_PASS$$',      // Todo mayúsculas
];

// Variaciones de usuarios
const users = [
  'events_u',
  'events_user',
  'events',
  'event_u',
  'postgres',  // Usuario default
];

// Variaciones de base de datos
const databases = [
  'events_n',
  'events',
  'event_n',
  'events_db',
];

async function testConnection(config, silent = false) {
  const client = new Client(config);

  try {
    await client.connect();

    if (!silent) {
      console.log(`✅ CONEXIÓN EXITOSA!`);
      console.log(`   Host: ${config.host}`);
      console.log(`   Database: ${config.database}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Password: ${config.password}`);
    }

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log(`   PostgreSQL: ${versionResult.rows[0].version.split(' ')[1]}`);

    // Verificar tablas
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
      LIMIT 10;
    `);

    console.log(`   Tablas encontradas: ${tablesResult.rows.length}`);
    tablesResult.rows.forEach(row => {
      console.log(`     - ${row.table_name}`);
    });

    await client.end();
    return true;
  } catch (error) {
    if (!silent && error.message.includes('password')) {
      // Solo mostrar errores que no sean de contraseña en modo verbose
    } else if (!silent) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    await client.end().catch(() => {});
    return false;
  }
}

async function bruteForceTest() {
  console.log('🔐 Probando combinaciones más probables...\n');

  // Primero probar las combinaciones más probables
  const priorityTests = [
    { host: 'gestsiete.es', port: 5432, database: 'events_n', user: 'events_u', password: 'events_pass$$', ssl: false },
    { host: 'gestsiete.es', port: 5432, database: 'events_n', user: 'events_u', password: 'events_pass$$', ssl: { rejectUnauthorized: false } },
    { host: 'localhost', port: 5432, database: 'events_n', user: 'events_u', password: 'events_pass$$', ssl: false },
    { host: '127.0.0.1', port: 5432, database: 'events_n', user: 'events_u', password: 'events_pass$$', ssl: false },
  ];

  for (const config of priorityTests) {
    console.log(`Probando: ${config.host} con SSL=${!!config.ssl}`);
    const success = await testConnection(config);
    if (success) {
      console.log('\n✅ CONFIGURACIÓN ENCONTRADA!\n');
      return config;
    }
  }

  console.log('\n🔍 Probando todas las variaciones de contraseña...\n');

  // Si no funciona, probar todas las combinaciones
  let tested = 0;
  const total = passwords.length;

  for (const password of passwords) {
    tested++;
    process.stdout.write(`\rProbando contraseña ${tested}/${total}: ${password.substring(0, 10)}...`);

    const config = {
      host: 'gestsiete.es',
      port: 5432,
      database: 'events_n',
      user: 'events_u',
      password: password,
      ssl: { rejectUnauthorized: false }
    };

    const success = await testConnection(config, true);
    if (success) {
      console.log('\n\n✅ CONTRASEÑA ENCONTRADA!');
      await testConnection(config, false);  // Mostrar detalles
      return config;
    }
  }

  console.log('\n\n❌ Ninguna contraseña funcionó');
  return null;
}

async function testWithConnectionString() {
  console.log('\n🔗 Probando con connection strings...\n');

  const connectionStrings = [
    'postgresql://events_u:events_pass$$@gestsiete.es:5432/events_n',
    'postgresql://events_u:events_pass%24%24@gestsiete.es:5432/events_n',  // URL encoded
    'postgresql://events_u:events_pass@gestsiete.es:5432/events_n',
    'postgres://events_u:events_pass$$@gestsiete.es:5432/events_n?sslmode=require',
    'postgres://events_u:events_pass$$@gestsiete.es:5432/events_n?sslmode=disable',
  ];

  for (const connStr of connectionStrings) {
    console.log(`Probando: ${connStr.substring(0, 40)}...`);

    const client = new Client({ connectionString: connStr });

    try {
      await client.connect();
      console.log('✅ CONEXIÓN EXITOSA con connection string!');
      console.log(`   String: ${connStr}`);

      await client.end();
      return connStr;
    } catch (error) {
      // Silenciar errores
    }
  }

  return null;
}

async function main() {
  // Probar métodos diferentes
  let config = await bruteForceTest();

  if (!config) {
    config = await testWithConnectionString();
  }

  if (config) {
    console.log('\n====================================');
    console.log('✅ SOLUCIÓN ENCONTRADA');
    console.log('====================================\n');

    if (typeof config === 'string') {
      console.log('Usa este connection string:');
      console.log(config);
    } else {
      console.log('Agrega esto a tu .env:');
      console.log(`DB_HOST=${config.host}`);
      console.log(`DB_PORT=${config.port}`);
      console.log(`DB_NAME=${config.database}`);
      console.log(`DB_USER=${config.user}`);
      console.log(`DB_PASSWORD=${config.password}`);
      if (config.ssl) {
        console.log('DB_SSL=true');
      }
    }
  } else {
    console.log('\n====================================');
    console.log('❌ NO SE PUDO CONECTAR');
    console.log('====================================\n');
    console.log('Posibles causas:');
    console.log('1. La contraseña fue cambiada');
    console.log('2. El servidor PostgreSQL no acepta conexiones remotas');
    console.log('3. Firewall está bloqueando el puerto 5432');
    console.log('4. Las credenciales son diferentes');
    console.log('\nNecesitas:');
    console.log('- Verificar con el administrador del servidor');
    console.log('- Revisar los logs del servidor PostgreSQL');
    console.log('- Confirmar que el puerto 5432 está abierto');
  }
}

main().catch(console.error);