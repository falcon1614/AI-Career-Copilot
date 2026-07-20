import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
pool.on('error', (err) => console.error('[db] Pool error:', err.message));
export const db = { query: (text: string, params?: any[]) => pool.query(text, params) };

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY, filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW())`);
    const dir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(dir).sort();
    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      const { rows } = await client.query('SELECT id FROM migrations WHERE filename = $1', [file]);
      if (rows.length > 0) { console.log(`[db] Skip ${file}`); continue; }
      console.log(`[db] Running ${file}`);
      await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
      console.log(`[db] ✓ ${file}`);
    }
  } finally { client.release(); }
}
export default pool;
