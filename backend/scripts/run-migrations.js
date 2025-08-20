const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { initDb, getDb } = require('../utils/db');

async function run() {
  await initDb();
  const db = getDb();
  const schemaPath = path.join(__dirname, '..', 'config', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await db.query(sql);
  console.log('✅ Database schema ensured.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


