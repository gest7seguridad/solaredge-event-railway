import knex from 'knex';

const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];

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