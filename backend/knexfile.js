const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'server.radioinsular.es',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'eventos_n',
      user: process.env.DB_USER || 'eventos_u',
      password: process.env.DB_PASSWORD || 'eventos_pass'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations-fixed',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  },
  
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'server.radioinsular.es',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'eventos_n',
      user: process.env.DB_USER || 'eventos_u',
      password: process.env.DB_PASSWORD || 'eventos_pass',
      ssl: { rejectUnauthorized: false }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations-fixed',
      tableName: 'knex_migrations'
    }
  }
};