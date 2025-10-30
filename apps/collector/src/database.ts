import { Client } from 'pg';
import { config } from './config';

export const db = new Client({
  connectionString: config.databaseUrl,
});

export async function initDatabase() {
  await db.connect();
}

export async function getProjectByApiKey(apiKey: string) {
  const result = await db.query(
    `SELECT id, org_id, log_full_url FROM projects WHERE api_key = $1`,
    [apiKey]
  );
  return result.rows[0];
}
