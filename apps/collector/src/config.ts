export const config = {
  tinybirdUrl: process.env.TINYBIRD_URL!,
  tinybirdToken: process.env.TINYBIRD_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  port: Number(process.env.PORT) || 6000,
};

export function validateConfig() {
  const missing = [];

  if (!config.tinybirdUrl) missing.push('TINYBIRD_URL');
  if (!config.tinybirdToken) missing.push('TINYBIRD_TOKEN');
  if (!config.databaseUrl) missing.push('DATABASE_URL');

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
