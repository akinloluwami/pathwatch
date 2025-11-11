#!/usr/bin/env bun
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { enrichEvent } from './transform';
import { ingestToTinybird } from './tinybird-ingest';
import { ingestToCloudflareR2 } from './cloudflare-ingest';
import type { Event } from './schemas';

interface SeedOptions {
  apiKey: string;
  count: number;
  target: 'tinybird' | 'cloudflare' | 'both';
  batchSize?: number;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
const API_PATHS = [
  '/api/users',
  '/api/users/:id',
  '/api/products',
  '/api/products/:id',
  '/api/orders',
  '/api/orders/:id',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/profile',
  '/api/settings',
  '/api/analytics',
  '/api/dashboard',
  '/api/search',
  '/api/comments',
  '/api/posts',
  '/api/posts/:id',
  '/api/categories',
  '/api/tags',
  '/api/notifications',
];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'PostmanRuntime/7.32.1',
  'axios/1.6.0',
  'node-fetch/2.6.7',
];

function generateStatusCode(): number {
  const rand = Math.random();
  if (rand < 0.7) return 200; // 70% success
  if (rand < 0.85) return faker.helpers.arrayElement([200, 201, 204]); // 15% other success
  if (rand < 0.92) return faker.helpers.arrayElement([400, 401, 403, 404]); // 7% client errors
  return faker.helpers.arrayElement([500, 502, 503, 504]); // 8% server errors
}

function generateLatency(status: number): number {
  // Successful requests are generally faster
  if (status < 300) {
    return faker.number.int({ min: 10, max: 500 });
  }
  // Errors might be slower
  return faker.number.int({ min: 50, max: 2000 });
}

function generateRequestSize(method: string): number {
  // GET, DELETE, HEAD requests typically have small or no body
  if (['GET', 'DELETE', 'HEAD', 'OPTIONS'].includes(method)) {
    return faker.number.int({ min: 100, max: 500 });
  }
  // POST, PUT, PATCH can have larger request bodies
  return faker.number.int({ min: 200, max: 50000 });
}

function generateResponseSize(status: number, method: string): number {
  // HEAD requests have no response body
  if (method === 'HEAD') {
    return faker.number.int({ min: 0, max: 100 });
  }

  // Error responses are typically smaller (just error messages)
  if (status >= 400) {
    return faker.number.int({ min: 150, max: 2000 });
  }

  // 204 No Content has minimal response
  if (status === 204) {
    return faker.number.int({ min: 0, max: 100 });
  }

  // Successful responses can vary widely
  return faker.number.int({ min: 500, max: 100000 });
}

function generateFakeEvent(): Omit<Event, 'api_key'> & { timestamp: string } {
  const method = faker.helpers.arrayElement(HTTP_METHODS);
  const path = faker.helpers.arrayElement(API_PATHS).replace(':id', faker.string.uuid());
  const host = faker.internet.domainName();
  const status = generateStatusCode();
  const latency_ms = generateLatency(status);

  // Generate random timestamp between now and 30 days ago
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTimestamp = faker.date.recent({ days: 14, refDate: now });

  return {
    method,
    path,
    url: `https://${host}${path}`,
    host,
    status,
    latency_ms,
    req_size: generateRequestSize(method),
    res_size: generateResponseSize(status, method),
    ip: faker.internet.ip(),
    user_agent: faker.helpers.arrayElement(USER_AGENTS),
    timestamp: randomTimestamp.toISOString(),
    body:
      status >= 400
        ? JSON.stringify({
            error: faker.lorem.sentence(),
            code: `ERR_${status}`,
            timestamp: randomTimestamp.toISOString(),
          })
        : null,
  };
}

async function getProjectDetails(
  apiKey: string
): Promise<{ projectId: string; orgId: string; logFullUrl: boolean }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query(
      'SELECT id, org_id, log_full_url FROM projects WHERE api_key = $1',
      [apiKey]
    );

    if (result.rows.length === 0) {
      throw new Error(`No project found with API key: ${apiKey}`);
    }

    const project = result.rows[0];
    return {
      projectId: project.id,
      orgId: project.org_id,
      logFullUrl: project.log_full_url ?? false,
    };
  } finally {
    await pool.end();
  }
}

async function seedData(options: SeedOptions) {
  const { apiKey, count, target, batchSize = 100 } = options;

  console.log('🔍 Fetching project details...');
  const { projectId, orgId, logFullUrl } = await getProjectDetails(apiKey);
  console.log(`✅ Found project: ${projectId} (org: ${orgId})`);

  console.log(`\n🌱 Starting to seed ${count} logs to ${target}...\n`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;

  // Process in batches
  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const batch: any[] = [];

    // Generate events for this batch
    for (let j = 0; j < currentBatchSize; j++) {
      const fakeEvent = generateFakeEvent();
      const eventWithKey: Event & { timestamp: string } = { ...fakeEvent, api_key: apiKey };
      const enrichedEvent = {
        ...enrichEvent(eventWithKey, projectId, orgId, logFullUrl),
        timestamp: fakeEvent.timestamp, // Preserve the generated timestamp
      };
      batch.push(enrichedEvent);
    }

    try {
      // Ingest to appropriate target(s)
      if (target === 'tinybird' || target === 'both') {
        for (const event of batch) {
          await ingestToTinybird(event);
        }
      }

      if (target === 'cloudflare' || target === 'both') {
        const r2Events = batch.map((event) => ({
          ...event,
          timestamp: new Date(event.timestamp).getTime(),
        }));
        await ingestToCloudflareR2(r2Events);
      }

      successCount += currentBatchSize;

      // Progress indicator
      const progress = Math.round((successCount / count) * 100);
      const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
      process.stdout.write(`\r[${bar}] ${progress}% (${successCount}/${count})`);
    } catch (error) {
      errorCount += currentBatchSize;
      console.error(`\n❌ Error ingesting batch ${i / batchSize + 1}:`, error);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const logsPerSecond = (successCount / parseFloat(duration)).toFixed(2);

  console.log('\n\n✅ Seeding complete!');
  console.log(`📊 Stats:`);
  console.log(`   - Total logs: ${count}`);
  console.log(`   - Successful: ${successCount}`);
  console.log(`   - Failed: ${errorCount}`);
  console.log(`   - Duration: ${duration}s`);
  console.log(`   - Rate: ${logsPerSecond} logs/sec`);
  console.log(`   - Target: ${target}`);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌱 PathWatch Collector Seed Script

Usage:
  bun run seed --api-key=<key> --count=<number> [options]

Required:
  --api-key=<key>         API key of the project to seed data into
  --count=<number>        Number of logs to generate

Optional:
  --target=<target>       Target system (tinybird|cloudflare|both) [default: both]
  --batch-size=<number>   Batch size for ingestion [default: 100]
  --help, -h              Show this help message

Examples:
  bun run seed --api-key=pw_abc123 --count=1000
  bun run seed --api-key=pw_abc123 --count=5000 --target=tinybird
  bun run seed --api-key=pw_abc123 --count=10000 --target=both --batch-size=50

Environment Variables Required:
  DATABASE_URL            PostgreSQL connection string
  TINYBIRD_URL           Tinybird ingestion URL (if target includes tinybird)
  TINYBIRD_TOKEN         Tinybird auth token (if target includes tinybird)
  CLOUDFLARE_R2_PIPELINE_URL  Cloudflare R2 pipeline URL (if target includes cloudflare)
    `);
    process.exit(0);
  }

  // Parse arguments
  const apiKeyArg = args.find((arg) => arg.startsWith('--api-key='));
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const targetArg = args.find((arg) => arg.startsWith('--target='));
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));

  if (!apiKeyArg || !countArg) {
    console.error('❌ Error: --api-key and --count are required');
    console.log('Run with --help for usage information');
    process.exit(1);
  }

  const apiKey = apiKeyArg.split('=')[1];
  const count = parseInt(countArg.split('=')[1], 10);
  const target = (targetArg?.split('=')[1] || 'both') as 'tinybird' | 'cloudflare' | 'both';
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1], 10) : 100;

  if (isNaN(count) || count <= 0) {
    console.error('❌ Error: --count must be a positive number');
    process.exit(1);
  }

  if (!['tinybird', 'cloudflare', 'both'].includes(target)) {
    console.error('❌ Error: --target must be one of: tinybird, cloudflare, both');
    process.exit(1);
  }

  if (isNaN(batchSize) || batchSize <= 0) {
    console.error('❌ Error: --batch-size must be a positive number');
    process.exit(1);
  }

  try {
    await seedData({ apiKey, count, target, batchSize });
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
