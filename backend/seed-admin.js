// Crear usuario administrador inicial
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const knex = require('knex');

const config = {
  client: 'postgresql',
  connection: {
    host: 'gestsiete.es',
    port: 5432,
    database: 'events_n',
    user: 'events_u',
    password: 'events_pass$$',
    ssl: { rejectUnauthorized: false }
  }
};

const db = knex(config);

async function seedAdmin() {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await db('admin_users')
      .where({ email: 'admin@solarland.com' })
      .first();
    
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe');
      return;
    }
    
    // Crear hash de la contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Insertar admin
    await db('admin_users').insert({
      id: uuidv4(),
      email: 'admin@solarland.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      is_active: true
    });
    
    console.log('✅ Usuario administrador creado:');
    console.log('   Email: admin@solarland.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.destroy();
  }
}

seedAdmin();