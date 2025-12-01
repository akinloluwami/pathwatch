export type DataSource = 'tinybird';

export const config = {
  dataSource: 'tinybird' as DataSource,
  tbToken: process.env.TB_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  port: Number(process.env.PORT) || 8000,
};

export function validateConfig() {
  const missing = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.tbToken) missing.push('TB_TOKEN');

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log(`Using data source: ${config.dataSource}`);
}
