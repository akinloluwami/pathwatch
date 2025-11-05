export type DataSource = 'tinybird' | 'cloudflare';

export const config = {
  dataSource: (process.env.DATASOURCE || 'tinybird') as DataSource,
  tbToken: process.env.TB_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  r2ApiToken: process.env.R2_API_TOKEN!,
  r2WarehouseName: process.env.R2_WAREHOUSE_NAME!,
  port: Number(process.env.PORT) || 8000,
};

export function validateConfig() {
  const missing = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');

  if (config.dataSource === 'tinybird') {
    if (!config.tbToken) missing.push('TB_TOKEN (required for DATASOURCE=tinybird)');
  } else if (config.dataSource === 'cloudflare') {
    if (!config.r2ApiToken) missing.push('R2_API_TOKEN (required for DATASOURCE=cloudflare)');
    if (!config.r2WarehouseName)
      missing.push('R2_WAREHOUSE_NAME (required for DATASOURCE=cloudflare)');
  } else {
    throw new Error(`Invalid DATASOURCE: ${config.dataSource}. Must be 'tinybird' or 'cloudflare'`);
  }

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log(`Using data source: ${config.dataSource}`);
}
