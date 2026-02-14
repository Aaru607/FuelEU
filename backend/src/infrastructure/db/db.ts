import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Database connection pool wrapper.
 * Minimal setup using the 'pg' package (no ORM).
 * Supports both local and cloud databases (Neon, etc.)
 * Uses connectionString for cloud providers and individual config for local.
 */

let pool: Pool | null = null;

export function initializePool(): Pool {
  if (pool) {
    return pool;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Cloud database (Neon, AWS RDS, etc.)
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }, // Required for Neon and most cloud providers
      max: 10,
      idleTimeoutMillis: 30000,
    });
    // eslint-disable-next-line no-console
    console.log('[Database] Initializing pool with DATABASE_URL (cloud provider)');
  } else {
    // Local development database
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'feuleu',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 10,
      idleTimeoutMillis: 30000,
    });
    // eslint-disable-next-line no-console
    console.log('[Database] Initializing pool with individual connection variables (local)');
  }

  // Log successful connection
  pool.on('connect', () => {
    // eslint-disable-next-line no-console
    console.log('[Database] ✓ Successfully connected to database');
  });

  // Log connection errors
  pool.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[Database] Unexpected error on idle client:', err);
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializePool() first.');
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getPool();
  return p.query<T>(sql, params);
}

export async function getClient(): Promise<PoolClient> {
  const p = getPool();
  return p.connect();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
