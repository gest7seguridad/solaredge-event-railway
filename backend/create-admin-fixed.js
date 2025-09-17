// Script para crear usuario administrador - VERSIÓN CORREGIDA
// Ejecutar con: node create-admin-fixed.js

const bcrypt = require('bcryptjs');
const knex = require('knex');

// Configuración directa - AJUSTAR SI ES NECESARIO
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$',  // Contraseña correcta con $$
    ssl: { rejectUnauthorized: false }
  }
};

async function createAdmin() {
  console.log('🔐 Creando usuario administrador...');
  console.log('');

  // Primero, intentar con la contraseña actual
  const passwords = [
    'events_pass$$',      // La que debería ser
    'events_pass',        // Sin $$
    process.env.DB_PASSWORD  // Por si está en .env
  ];

  let db;
  let connected = false;

  // Intentar conectar con diferentes contraseñas
  for (const pwd of passwords) {
    if (!pwd) continue;

    try {
      console.log(`Intentando con contraseña que termina en: ...${pwd.slice(-3)}`);

      const config = {
        client: 'postgresql',
        connection: {
          host: 'gestsiete.es',
          port: 5432,
          database: 'events_n',
          user: 'events_u',
          password: pwd,
          ssl: { rejectUnauthorized: false }
        }
      };

      db = knex(config);
      await db.raw('SELECT 1');
      console.log('✅ Conexión exitosa con la base de datos');
      connected = true;
      break;
    } catch (err) {
      console.log(`❌ Falló con esta contraseña`);
    }
  }

  if (!connected) {
    console.log('');
    console.log('❌ No se pudo conectar a la base de datos');
    console.log('');
    console.log('Por favor, verifica la contraseña en tu archivo .env');
    console.log('La variable debe ser: DB_PASSWORD=tu_contraseña_correcta');
    process.exit(1);
  }

  const email = 'admin@solarland.com';
  const password = 'admin123456';
  const name = 'Administrador';

  try {
    // Verificar si la tabla existe
    const tableExists = await db.schema.hasTable('admin_users');

    if (!tableExists) {
      console.log('📝 Creando tabla admin_users...');

      await db.schema.createTable('admin_users', (table) => {
        table.increments('id').primary();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('name');
        table.enum('role', ['admin', 'viewer']).defaultTo('admin');
        table.boolean('is_active').defaultTo(true);
        table.timestamp('last_login');
        table.timestamps(true, true);
      });

      console.log('✅ Tabla admin_users creada');
    }

    // Generar hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar si el usuario ya existe
    const existingUser = await db('admin_users').where({ email }).first();

    if (existingUser) {
      console.log('⚠️  Usuario ya existe. Actualizando contraseña...');

      await db('admin_users')
        .where({ email })
        .update({
          password: hashedPassword,
          is_active: true,
          updated_at: new Date()
        });

      console.log('✅ Contraseña actualizada exitosamente');
    } else {
      console.log('📝 Creando nuevo usuario...');

      await db('admin_users').insert({
        email,
        password: hashedPassword,
        name,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });

      console.log('✅ Usuario creado exitosamente');
    }

    console.log('');
    console.log('========================================');
    console.log('✅ USUARIO ADMIN LISTO');
    console.log('========================================');
    console.log('');
    console.log('Accede con:');
    console.log('  URL: https://solarland.gestsiete.es/admin');
    console.log('  Email:', email);
    console.log('  Contraseña:', password);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === '42P01') {
      console.log('');
      console.log('La tabla admin_users no existe y no se pudo crear.');
      console.log('Intenta ejecutar las migraciones primero.');
    }
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// Ejecutar
createAdmin();