const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('admin_users').del();
  
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123456', 10);
  
  await knex('admin_users').insert([
    {
      email: process.env.ADMIN_EMAIL || 'admin@solarland.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin',
      is_active: true
    }
  ]);
};