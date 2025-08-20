const { Pool } = require('pg');

let pool;

function getDbConfigFromEnv() {
  const useUrl = !!process.env.DATABASE_URL;
  if (useUrl) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }
  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'thesocial',
  };
}

async function initDb() {
  if (pool) return pool;
  const config = getDbConfigFromEnv();
  pool = new Pool(config);
  await pool.query('SELECT 1');
  return pool;
}

function getDb() {
  if (!pool) throw new Error('Database not initialized. Call initDb() first.');
  return pool;
}

module.exports = { initDb, getDb };