import { Client } from 'pg';
import { config } from './config';

export const db = new Client({
  connectionString: config.databaseUrl,
});

export async function initDatabase() {
  await db.connect();
}

export async function verifyApiKey(token: string) {
  const res = await db.query('SELECT org_id, id FROM projects WHERE api_key = $1', [token]);

  if (res.rows.length === 0) return null;
  return res.rows[0];
}
