import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.join(__dirname, '..');

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
    charset: 'utf8mb4'
  });

  try {
    const schema = await fs.readFile(path.join(root, 'database', 'schema.sql'), 'utf8');
    const seed = await fs.readFile(path.join(root, 'database', 'seed.sql'), 'utf8');
    console.log('Creating database and tables...');
    await connection.query(schema);
    console.log('Inserting Bangladesh demo data...');
    await connection.query(seed);
    console.log('Database setup completed: travel_management_bd');
    console.log('Admin: admin@travelbd.local / Admin@123');
    console.log('User:  user@travelbd.local / User@123');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Database setup failed. Make sure XAMPP MySQL is running and .env is correct.');
  console.error(error.message);
  process.exit(1);
});
