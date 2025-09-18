// Script para crear usuario administrador
// Ejecutar con: node create-admin.js

const bcrypt = require('bcryptjs');
const knex = require('knex');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuración de base de datos
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'server.radioinsular.es',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'eventos_n',
    user: process.env.DB_USER || 'eventos_u',
    password: process.env.DB_PASSWORD || 'eventos_pass',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  }
};

async function createAdmin() {
  const db = knex(dbConfig);

  const email = 'admin@solarland.com';
  const password = 'admin123456';
  const name = 'Administrador';

  console.log('🔐 Creando usuario administrador...');
  console.log('   Email:', email);
  console.log('   Contraseña:', password);
  console.log('');
  console.log('📊 Conectando a base de datos...');
  console.log('   Host:', dbConfig.connection.host);
  console.log('   Database:', dbConfig.connection.database);
  console.log('');

  try {
    // Verificar si la tabla existe
    const tableExists = await db.schema.hasTable('admin_users');

    if (!tableExists) {
      console.log('❌ La tabla admin_users no existe. Creándola...');

      // Crear tabla si no existe
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

      // Actualizar contraseña
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

      // Insertar nuevo usuario
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

    // Verificar que el usuario puede hacer login
    const user = await db('admin_users').where({ email }).first();
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      console.log('✅ Verificación exitosa - El usuario puede hacer login');
    } else {
      console.log('❌ Error en verificación de contraseña');
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
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer acceso');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Detalles:', error);

    if (error.code === 'ECONNREFUSED') {
      console.error('No se puede conectar a la base de datos. Verifica:');
      console.error('  - Host:', dbConfig.connection.host);
      console.error('  - Puerto:', dbConfig.connection.port);
      console.error('  - Credenciales');
    }
  } finally {
    await db.destroy();
    process.exit(0);
  }
}

// Ejecutar
createAdmin();