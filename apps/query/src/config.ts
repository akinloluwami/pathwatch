export const config = {
  tbToken: process.env.TB_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  r2ApiToken: process.env.R2_API_TOKEN!,
  r2WarehouseName: process.env.R2_WAREHOUSE_NAME!,
  port: Number(process.env.PORT) || 8000,
};

export function validateConfig() {
  const missing = [];

  if (!config.tbToken) missing.push('TB_TOKEN');
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.r2ApiToken) missing.push('R2_API_TOKEN');
  if (!config.r2WarehouseName) missing.push('R2_WAREHOUSE_NAME');

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
