import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("DATABASE_URL not set — database API key auth will be unavailable.");
}

export const pool = databaseUrl
  ? new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    })
  : null;

export async function initDb(): Promise<void> {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      key_hash text NOT NULL UNIQUE,
      key_prefix text NOT NULL,
      plan text NOT NULL DEFAULT 'free',
      requests_today integer NOT NULL DEFAULT 0,
      last_request_date date,
      created_at timestamptz NOT NULL DEFAULT now(),
      is_active boolean NOT NULL DEFAULT true
    )
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash)
  `);

  console.log("Database ready.");
}
