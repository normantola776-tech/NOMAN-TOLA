import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import * as dotenv from 'dotenv';

dotenv.config();

declare global {
  var _postgresPool: Pool | undefined;
  var _postgresPoolHost: string | undefined;
}

// Function to create or retrieve the connection pool using the object method
export const createPool = () => {
  // If the pool was cached with a different host or when SQL_HOST was undefined, reset it
  if (global._postgresPool && global._postgresPoolHost !== process.env.SQL_HOST) {
    try {
      global._postgresPool.end().catch(() => {});
    } catch (_) {}
    global._postgresPool = undefined;
  }

  if (!global._postgresPool) {
    global._postgresPoolHost = process.env.SQL_HOST;
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    // Prevent unhandled pool-level errors from crashing the application
    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
