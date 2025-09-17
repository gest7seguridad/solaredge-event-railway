exports.up = function(knex) {
  return knex.schema.createTable('registrations', table => {
    table.string('id', 36).primary();
    table.string('event_id', 36).notNullable();
    table.string('ticket_number', 50).unique().notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('company').notNullable();
    table.string('job_title').notNullable();
    table.string('email').notNullable();
    table.string('phone').notNullable();
    table.string('city').notNullable();
    table.string('island');
    table.string('dietary_restrictions');
    table.boolean('accepted_terms').notNullable().defaultTo(false);
    table.boolean('accepted_privacy').notNullable().defaultTo(false);
    table.boolean('accepted_communications').defaultTo(false);
    table.enum('status', ['confirmed', 'waitlist', 'cancelled']).defaultTo('confirmed');
    table.boolean('has_attended').defaultTo(false);
    table.datetime('check_in_time');
    table.string('qr_code').notNullable();
    table.timestamps(true, true);
    
    table.foreign('event_id').references('id').inTable('events').onDelete('CASCADE');
    table.index('email');
    table.index('ticket_number');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('registrations');
};