exports.up = function(knex) {
  return knex.schema.createTable('registrations', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable();
    table.string('phone').notNullable();
    table.string('company').notNullable();
    table.string('position');
    table.string('nif_cif');
    table.enum('status', ['confirmed', 'waitlist', 'cancelled', 'attended']).defaultTo('confirmed');
    table.string('confirmation_code').unique();
    table.string('qr_code_url');
    table.datetime('confirmed_at');
    table.datetime('checked_in_at');
    table.boolean('email_sent').defaultTo(false);
    table.text('notes');
    table.jsonb('additional_data');
    table.timestamps(true, true);
    
    table.unique(['event_id', 'email']);
    table.index('confirmation_code');
    table.index('status');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('registrations');
};