exports.up = function(knex) {
  return knex.schema.createTable('admin_users', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('name').notNullable();
    table.enum('role', ['admin', 'viewer']).defaultTo('viewer');
    table.boolean('is_active').defaultTo(true);
    table.datetime('last_login');
    table.timestamps(true, true);
    
    table.index('email');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('admin_users');
};