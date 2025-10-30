export const config = {
  tinybirdUrl: process.env.TINYBIRD_URL!,
  tinybirdToken: process.env.TINYBIRD_TOKEN!,
  databaseUrl: process.env.DATABASE_URL!,
  cfCatUri: process.env.CF_CAT_URI!,
  cfTokenValue: process.env.CF_TOKEN_VALUE!,
  cloudflareR2PipelineUrl: process.env.CLOUDFLARE_R2_PIPELINE_URL!,
  port: Number(process.env.PORT) || 6000,
};

export function validateConfig() {
  const missing = [];

  if (!config.tinybirdUrl) missing.push('TINYBIRD_URL');
  if (!config.tinybirdToken) missing.push('TINYBIRD_TOKEN');
  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.cfCatUri) missing.push('CF_CAT_URI');
  if (!config.cfTokenValue) missing.push('CF_TOKEN_VALUE');
  if (!config.cloudflareR2PipelineUrl) missing.push('CLOUDFLARE_R2_PIPELINE_URL');

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
