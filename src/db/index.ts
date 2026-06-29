import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Function to create a new connection pool.
export const createPool = () => {
  const connectionString = process.env.DATABASE_URL || process.env.SQL_URL;
  if (connectionString) {
    const isSupabase = connectionString.includes('supabase.co') || connectionString.includes('supabase.com') || connectionString.includes('pooler.supabase.com');
    return new Pool({
      connectionString,
      connectionTimeoutMillis: 15000,
      ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    });
  }

  const host = process.env.SQL_HOST;
  const isSupabase = host?.includes('supabase.co') || host?.includes('supabase.com') || host?.includes('pooler.supabase.com');
  return new Pool({
    host,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 5432,
    connectionTimeoutMillis: 15000,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
  });
};

// Create a pool instance.
const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
export { schema };
