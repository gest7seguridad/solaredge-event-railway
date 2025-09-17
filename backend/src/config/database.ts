import knex from 'knex';
import { getKnexConfig } from './db-config';

// Usar la configuración con fallback para Railway
const config = getKnexConfig();

export const db = knex(config);

export const testConnection = async (): Promise<void> => {
  try {
    await db.raw('SELECT 1+1 AS result');
    console.log('✅ Database connection established successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};