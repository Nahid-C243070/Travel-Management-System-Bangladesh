import 'dotenv/config';
import app from './app.js';
import { testConnection } from './config/database.js';

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await testConnection();
    console.log('Database connection established.');
    app.listen(port, () => {
      console.log('------------------------------------------');
      console.log('Travel Management System Bangladesh');
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API: http://localhost:${port}/api`);
      console.log(`Health: http://localhost:${port}/api/health`);
      console.log(`Demo UI: http://localhost:${port}`);
      console.log('------------------------------------------');
    });
  } catch (error) {
    console.error('Unable to connect to MySQL. Start MySQL from XAMPP and import database/schema.sql.');
    console.error(error.message);
    process.exit(1);
  }
}

start();
