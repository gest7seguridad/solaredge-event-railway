exports.up = function(knex) {
  return knex.schema.createTable('events', table => {
    table.string('id', 36).primary();
    table.string('title').notNullable();
    table.text('description');
    table.datetime('event_date').notNullable();
    table.datetime('registration_deadline').notNullable();
    table.string('venue_name').notNullable();
    table.string('venue_address').notNullable();
    table.string('venue_city').notNullable();
    table.string('venue_google_maps_url');
    table.integer('max_attendees').notNullable().defaultTo(100);
    table.boolean('enable_waitlist').defaultTo(true);
    table.jsonb('agenda');
    table.string('organizer_name').notNullable();
    table.string('organizer_logo_url');
    table.string('collaborator_name');
    table.string('collaborator_logo_url');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('events');
};