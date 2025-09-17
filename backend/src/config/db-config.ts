// Configuración de base de datos con fallback para Railway
// Railway no usa archivos .env, usa variables de entorno directamente

export const getDatabaseConfig = () => {
  // En Railway, las variables vienen del entorno directamente
  const config = {
    host: process.env.DB_HOST || 'gestsiete.es',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'events_n',
    user: process.env.DB_USER || 'events_u',
    password: process.env.DB_PASSWORD || 'events_pass$',
  };

  console.log('📊 Database configuration:');
  console.log('   Host:', config.host);
  console.log('   Port:', config.port);
  console.log('   Database:', config.database);
  console.log('   User:', config.user);
  console.log('   Password:', config.password ? '***' : 'NOT SET');

  return config;
};

export const getKnexConfig = () => {
  const dbConfig = getDatabaseConfig();
  
  return {
    client: 'postgresql',
    connection: {
      ...dbConfig,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './src/database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './src/database/seeds'
    }
  };
};