#!/usr/bin/env bun
import { faker } from '@faker-js/faker';
import { Pool } from 'pg';
import { enrichSpan, enrichTrace, aggregateSpansToTrace } from './tracing-transform';
import { ingestSpansToTinybird, ingestTracesToTinybird } from './tracing-ingest';
import type { Span } from './schemas';

interface SeedOptions {
  apiKey: string;
  count: number; // Number of traces to generate
  batchSize?: number;
}

const SERVICES = [
  'api-gateway',
  'auth-service',
  'user-service',
  'product-service',
  'order-service',
  'payment-service',
  'notification-service',
  'analytics-service',
  'search-service',
  'recommendation-service',
];

// Realistic trace scenarios
const TRACE_SCENARIOS = [
  {
    name: 'User Login',
    rootOperation: { method: 'POST', path: '/api/auth/login', service: 'api-gateway' },
    children: [
      { service: 'auth-service', operation: 'validate-credentials', type: 'INTERNAL' },
      { service: 'auth-service', operation: 'query-user', type: 'CLIENT', db: 'postgresql' },
      { service: 'auth-service', operation: 'generate-token', type: 'INTERNAL' },
      { service: 'auth-service', operation: 'cache-session', type: 'CLIENT', db: 'redis' },
    ],
  },
  {
    name: 'Get User Profile',
    rootOperation: { method: 'GET', path: '/api/users/{id}', service: 'api-gateway' },
    children: [
      { service: 'auth-service', operation: 'validate-token', type: 'INTERNAL' },
      { service: 'user-service', operation: 'get-user', type: 'CLIENT', db: 'postgresql' },
      { service: 'user-service', operation: 'check-cache', type: 'CLIENT', db: 'redis' },
    ],
  },
  {
    name: 'Create Order',
    rootOperation: { method: 'POST', path: '/api/orders', service: 'api-gateway' },
    children: [
      { service: 'auth-service', operation: 'validate-token', type: 'INTERNAL' },
      { service: 'product-service', operation: 'check-availability', type: 'CLIENT' },
      {
        service: 'product-service',
        operation: 'query-inventory',
        type: 'CLIENT',
        db: 'postgresql',
      },
      { service: 'order-service', operation: 'create-order', type: 'CLIENT', db: 'postgresql' },
      { service: 'payment-service', operation: 'process-payment', type: 'CLIENT' },
      { service: 'payment-service', operation: 'charge-card', type: 'INTERNAL' },
      { service: 'notification-service', operation: 'send-email', type: 'CLIENT' },
      { service: 'analytics-service', operation: 'track-event', type: 'INTERNAL' },
    ],
  },
  {
    name: 'Search Products',
    rootOperation: { method: 'GET', path: '/api/products/search', service: 'api-gateway' },
    children: [
      {
        service: 'search-service',
        operation: 'search-products',
        type: 'CLIENT',
        db: 'elasticsearch',
      },
      { service: 'search-service', operation: 'filter-results', type: 'INTERNAL' },
      { service: 'recommendation-service', operation: 'get-recommendations', type: 'CLIENT' },
      { service: 'analytics-service', operation: 'track-search', type: 'INTERNAL' },
    ],
  },
  {
    name: 'List Products',
    rootOperation: { method: 'GET', path: '/api/products', service: 'api-gateway' },
    children: [
      { service: 'product-service', operation: 'list-products', type: 'CLIENT', db: 'postgresql' },
      { service: 'product-service', operation: 'check-cache', type: 'CLIENT', db: 'redis' },
    ],
  },
  {
    name: 'Update User',
    rootOperation: { method: 'PUT', path: '/api/users/{id}', service: 'api-gateway' },
    children: [
      { service: 'auth-service', operation: 'validate-token', type: 'INTERNAL' },
      { service: 'user-service', operation: 'update-user', type: 'CLIENT', db: 'postgresql' },
      { service: 'user-service', operation: 'invalidate-cache', type: 'CLIENT', db: 'redis' },
      { service: 'analytics-service', operation: 'track-event', type: 'INTERNAL' },
    ],
  },
  {
    name: 'Health Check',
    rootOperation: { method: 'GET', path: '/health', service: 'api-gateway' },
    children: [
      { service: 'api-gateway', operation: 'check-database', type: 'CLIENT', db: 'postgresql' },
      { service: 'api-gateway', operation: 'check-cache', type: 'CLIENT', db: 'redis' },
    ],
  },
  {
    name: 'Get Recommendations',
    rootOperation: { method: 'GET', path: '/api/recommendations', service: 'api-gateway' },
    children: [
      { service: 'auth-service', operation: 'validate-token', type: 'INTERNAL' },
      {
        service: 'recommendation-service',
        operation: 'get-user-profile',
        type: 'CLIENT',
        db: 'postgresql',
      },
      { service: 'recommendation-service', operation: 'calculate-similarity', type: 'INTERNAL' },
      {
        service: 'recommendation-service',
        operation: 'query-products',
        type: 'CLIENT',
        db: 'postgresql',
      },
    ],
  },
];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const DB_SYSTEMS = ['postgresql', 'redis', 'mongodb', 'elasticsearch'];
const DB_OPERATIONS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FIND', 'AGGREGATE'];

function generateSpanKind(): 'SERVER' | 'CLIENT' | 'INTERNAL' | 'PRODUCER' | 'CONSUMER' {
  const kinds: Array<'SERVER' | 'CLIENT' | 'INTERNAL' | 'PRODUCER' | 'CONSUMER'> = [
    'SERVER',
    'CLIENT',
    'INTERNAL',
    'PRODUCER',
    'CONSUMER',
  ];
  const weights = [0.4, 0.3, 0.2, 0.05, 0.05]; // Weighted random
  const rand = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (rand <= sum) return kinds[i];
  }
  return 'INTERNAL';
}

function generateStatusCode(errorRate: number = 0.05): 'OK' | 'ERROR' | 'UNSET' {
  return Math.random() < errorRate ? 'ERROR' : 'OK';
}

function generateDuration(isError: boolean, minMs: number = 5, maxMs: number = 1000): number {
  // Errors tend to be slower
  if (isError) {
    return faker.number.int({ min: maxMs / 2, max: maxMs * 2 });
  }
  return faker.number.int({ min: minMs, max: maxMs });
}

function generateHttpAttributes(method?: string) {
  const httpMethod = method || faker.helpers.arrayElement(HTTP_METHODS);
  const paths = [
    '/api/users',
    '/api/products',
    '/api/orders',
    '/api/auth/login',
    '/api/checkout',
    '/api/search',
    '/health',
    '/metrics',
  ];
  const statusCodes = [200, 201, 204, 400, 401, 403, 404, 500, 502, 503];

  return {
    http_method: httpMethod,
    http_url: faker.helpers.arrayElement(paths),
    http_status_code: faker.helpers.arrayElement(statusCodes),
  };
}

function generateDbAttributes() {
  const system = faker.helpers.arrayElement(DB_SYSTEMS);
  const operation = faker.helpers.arrayElement(DB_OPERATIONS);
  const tables = ['users', 'products', 'orders', 'payments', 'sessions'];

  return {
    db_system: system,
    db_statement: `${operation} * FROM ${faker.helpers.arrayElement(tables)} WHERE id = ?`,
  };
}

function generateTrace(traceId: string, rootService: string): Omit<Span, 'api_key'>[] {
  const spans: Omit<Span, 'api_key'>[] = [];
  const now = Date.now();

  // Pick a random scenario
  const scenario = faker.helpers.arrayElement(TRACE_SCENARIOS);

  // Generate random timestamp between now and 7 days ago (in milliseconds)
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const traceStartTime = faker.number.int({ min: sevenDaysAgo, max: now });

  // Determine if this trace will be an error (5-8% error rate)
  const isTraceError = Math.random() < 0.07;
  const traceStatusCode = isTraceError
    ? faker.helpers.arrayElement([400, 401, 403, 404, 500, 502, 503])
    : faker.helpers.arrayElement([200, 201, 204]);

  const rootSpanId = faker.string.uuid();
  const rootStatusCode = isTraceError ? 'ERROR' : 'OK';

  // Generate child spans first to calculate total duration
  let currentTime = traceStartTime + faker.number.int({ min: 1, max: 5 });
  const childSpans: any[] = [];

  scenario.children.forEach((child, index) => {
    const spanId = faker.string.uuid();

    // Determine if this individual span has an error
    const isSpanError = isTraceError && Math.random() < 0.4;
    const spanStatusCode = isSpanError ? 'ERROR' : 'OK';

    // Generate realistic span duration based on operation type
    let spanDuration: number;
    if (child.db) {
      // DB operations: 10-150ms
      spanDuration = faker.number.int({ min: 10, max: 150 });
    } else if (child.type === 'CLIENT') {
      // HTTP calls: 50-300ms
      spanDuration = faker.number.int({ min: 50, max: 300 });
    } else {
      // Internal operations: 5-100ms
      spanDuration = faker.number.int({ min: 5, max: 100 });
    }

    // Errors tend to take longer
    if (isSpanError) {
      spanDuration = Math.floor(spanDuration * 1.5);
    }

    const spanEndTime = currentTime + spanDuration;

    // Generate DB attributes if this is a DB span
    const dbAttrs = child.db
      ? {
          db_system: child.db,
          db_statement: `SELECT * FROM ${faker.helpers.arrayElement(['users', 'products', 'orders', 'payments'])} WHERE id = $1`,
        }
      : null;

    childSpans.push({
      trace_id: traceId,
      span_id: spanId,
      parent_span_id: rootSpanId,
      service_name: child.service,
      span_name: child.operation,
      span_kind: child.type as 'SERVER' | 'CLIENT' | 'INTERNAL',
      start_time_unix_nano: currentTime * 1000000,
      end_time_unix_nano: spanEndTime * 1000000,
      duration_ms: spanDuration,
      status_code: spanStatusCode,
      status_message: isSpanError ? faker.lorem.sentence() : null,
      attributes: {
        'service.version': faker.system.semver(),
        'span.type': child.type.toLowerCase(),
      },
      resource_attributes: {
        'host.name': faker.internet.domainName(),
        'process.pid': faker.number.int({ min: 1000, max: 99999 }),
      },
      events: isSpanError
        ? [
            {
              timestamp: currentTime + Math.floor(spanDuration / 2),
              name: 'exception',
              attributes: { 'exception.message': faker.lorem.sentence() },
            },
          ]
        : [],
      links: [],
      http_method:
        child.type === 'CLIENT' && !child.db ? faker.helpers.arrayElement(['GET', 'POST']) : null,
      http_url: child.type === 'CLIENT' && !child.db ? `/internal/${child.operation}` : null,
      http_status_code: child.type === 'CLIENT' && !child.db ? (isSpanError ? 500 : 200) : null,
      db_system: dbAttrs?.db_system || null,
      db_statement: dbAttrs?.db_statement || null,
    });

    // Move time forward for next span (small gap between spans)
    currentTime = spanEndTime + faker.number.int({ min: 1, max: 5 });
  });

  // Calculate root duration as total time from start to end of last child span
  const traceEndTime = currentTime;
  const rootDuration = traceEndTime - traceStartTime;

  // Create root span with calculated duration
  spans.push({
    trace_id: traceId,
    span_id: rootSpanId,
    parent_span_id: null,
    service_name: scenario.rootOperation.service,
    span_name: `${scenario.rootOperation.method} ${scenario.rootOperation.path}`,
    span_kind: 'SERVER',
    start_time_unix_nano: traceStartTime * 1000000,
    end_time_unix_nano: traceEndTime * 1000000,
    duration_ms: rootDuration,
    status_code: rootStatusCode,
    status_message: isTraceError ? faker.lorem.sentence() : null,
    attributes: {
      'service.version': faker.system.semver(),
      'deployment.environment': faker.helpers.arrayElement([
        'production',
        'staging',
        'development',
      ]),
    },
    resource_attributes: {
      'host.name': faker.internet.domainName(),
      'process.pid': faker.number.int({ min: 1000, max: 99999 }),
    },
    events: isTraceError
      ? [
          {
            timestamp: traceStartTime + Math.floor(rootDuration / 2),
            name: 'exception',
            attributes: { 'exception.message': faker.lorem.sentence() },
          },
        ]
      : [],
    links: [],
    http_method: scenario.rootOperation.method,
    http_url: scenario.rootOperation.path,
    http_status_code: traceStatusCode,
    db_system: null,
    db_statement: null,
  });

  // Add all child spans
  spans.push(...childSpans);

  return spans;
}

async function getProjectDetails(apiKey: string): Promise<{ projectId: string; orgId: string }> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query('SELECT id, org_id FROM projects WHERE api_key = $1', [apiKey]);

    if (result.rows.length === 0) {
      throw new Error(`No project found with API key: ${apiKey}`);
    }

    const project = result.rows[0];
    return {
      projectId: project.id,
      orgId: project.org_id,
    };
  } finally {
    await pool.end();
  }
}

async function seedTracingData(options: SeedOptions) {
  const { apiKey, count, batchSize = 50 } = options;

  console.log('🔍 Fetching project details...');
  const { projectId, orgId } = await getProjectDetails(apiKey);
  console.log(`✅ Found project: ${projectId} (org: ${orgId})`);

  console.log(`\n🌱 Starting to seed ${count} traces to Tinybird...\n`);

  const startTime = Date.now();
  let successCount = 0;
  let errorCount = 0;
  let totalSpans = 0;

  // Process in batches
  for (let i = 0; i < count; i += batchSize) {
    const currentBatchSize = Math.min(batchSize, count - i);
    const allSpans: any[] = [];
    const allTraces: any[] = [];

    // Generate traces for this batch
    for (let j = 0; j < currentBatchSize; j++) {
      const traceId = `trace-${faker.string.uuid()}`;
      const rootService = faker.helpers.arrayElement(SERVICES);
      const spans = generateTrace(traceId, rootService);

      // Transform spans for Tinybird format (stringify JSON fields for Tinybird String type)
      const tinybirdSpans = spans.map((span) => {
        const timestamp = new Date(span.start_time_unix_nano / 1000000);
        return {
          trace_id: span.trace_id,
          span_id: span.span_id,
          parent_span_id: span.parent_span_id || null,
          timestamp: Math.floor(timestamp.getTime() / 1000), // Unix timestamp in seconds
          org_id: orgId,
          project_id: projectId,
          service_name: span.service_name,
          span_name: span.span_name,
          span_kind: span.span_kind,
          start_time_ms: Math.floor(span.start_time_unix_nano / 1000000),
          end_time_ms: Math.floor(span.end_time_unix_nano / 1000000),
          duration_ms: span.duration_ms,
          status_code: span.status_code,
          status_message: span.status_message || null,
          attributes: JSON.stringify(span.attributes || {}), // Stringify for Tinybird String type
          events: JSON.stringify(span.events || []), // Stringify for Tinybird String type
          links: JSON.stringify(span.links || []), // Stringify for Tinybird String type
          resource_attributes: JSON.stringify(span.resource_attributes || {}), // Stringify for Tinybird String type
          http_method: span.http_method || null,
          http_url: span.http_url || null,
          http_status_code: span.http_status_code || null,
          db_system: span.db_system || null,
          db_statement: span.db_statement || null,
          error: span.status_code === 'ERROR',
        };
      });

      allSpans.push(...tinybirdSpans);

      // Create aggregated trace manually (no enrichTrace to avoid issues)
      const rootSpan = spans.find((s) => !s.parent_span_id) || spans[0];
      const errorSpans = spans.filter((s) => s.status_code === 'ERROR');
      const startTimes = spans.map((s) => s.start_time_unix_nano);
      const endTimes = spans.map((s) => s.end_time_unix_nano);
      const minStart = Math.min(...startTimes);
      const maxEnd = Math.max(...endTimes);
      const duration_ms = Math.round((maxEnd - minStart) / 1000000);

      let status: 'success' | 'error' | 'pending' = 'success';
      if (errorSpans.length > 0) {
        status = 'error';
      } else if (spans.some((s) => s.status_code === 'UNSET')) {
        status = 'pending';
      }

      const aggregatedTrace = {
        trace_id: rootSpan.trace_id,
        timestamp: Math.floor(minStart / 1000000000), // Convert nanoseconds to seconds
        org_id: orgId,
        project_id: projectId,
        service_name: rootSpan.service_name,
        trace_name: rootSpan.span_name,
        root_service_name: rootSpan.service_name,
        duration_ms,
        span_count: spans.length,
        error_span_count: errorSpans.length,
        status,
        http_method: rootSpan.http_method || null,
        http_url: rootSpan.http_url || null,
        http_status_code: rootSpan.http_status_code || null,
        endpoint: rootSpan.http_url || null,
        root_span_id: rootSpan.span_id,
      };
      if (aggregatedTrace) {
        allTraces.push(aggregatedTrace);
      }

      totalSpans += spans.length;
    }

    try {
      // Ingest spans and traces
      await ingestSpansToTinybird(allSpans);
      await ingestTracesToTinybird(allTraces);

      successCount += currentBatchSize;

      // Progress indicator
      const progress = Math.round((successCount / count) * 100);
      const bar = '█'.repeat(Math.floor(progress / 2)) + '░'.repeat(50 - Math.floor(progress / 2));
      process.stdout.write(
        `\r[${bar}] ${progress}% (${successCount}/${count} traces, ${totalSpans} spans)`
      );
    } catch (error) {
      errorCount += currentBatchSize;
      console.error(`\n❌ Error ingesting batch ${i / batchSize + 1}:`, error);
    }

    // Small delay to avoid overwhelming Tinybird
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const tracesPerSecond = (successCount / parseFloat(duration)).toFixed(2);

  console.log('\n\n✅ Seeding complete!');
  console.log(`📊 Stats:`);
  console.log(`   - Total traces: ${count}`);
  console.log(`   - Total spans: ${totalSpans}`);
  console.log(`   - Successful traces: ${successCount}`);
  console.log(`   - Failed traces: ${errorCount}`);
  console.log(`   - Duration: ${duration}s`);
  console.log(`   - Rate: ${tracesPerSecond} traces/sec`);
  console.log(`   - Average spans per trace: ${(totalSpans / successCount).toFixed(2)}`);
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🌱 PathWatch Tracing Seed Script

Usage:
  bun run seed-tracing --api-key=<key> --count=<number> [options]

Required:
  --api-key=<key>         API key of the project to seed data into
  --count=<number>        Number of traces to generate

Optional:
  --batch-size=<number>   Batch size for ingestion [default: 50]
  --help, -h              Show this help message

Examples:
  bun run seed-tracing --api-key=pw_abc123 --count=1000
  bun run seed-tracing --api-key=pw_abc123 --count=5000 --batch-size=25

Environment Variables Required:
  DATABASE_URL            PostgreSQL connection string
  TINYBIRD_URL           Tinybird ingestion URL
  TINYBIRD_TOKEN         Tinybird auth token

Features:
  - Generates realistic distributed traces with 3-15 spans each
  - Multiple microservices (api-gateway, auth, user, product, order, etc.)
  - HTTP and database operations
  - Realistic error rates (~5-8%)
  - Parent-child span relationships
  - Attributes, events, and resource metadata
    `);
    process.exit(0);
  }

  // Parse arguments
  const apiKeyArg = args.find((arg) => arg.startsWith('--api-key='));
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const batchSizeArg = args.find((arg) => arg.startsWith('--batch-size='));

  if (!apiKeyArg || !countArg) {
    console.error('❌ Error: --api-key and --count are required');
    console.log('Run with --help for usage information');
    process.exit(1);
  }

  const apiKey = apiKeyArg.split('=')[1];
  const count = parseInt(countArg.split('=')[1], 10);
  const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1], 10) : 50;

  if (isNaN(count) || count <= 0) {
    console.error('❌ Error: --count must be a positive number');
    process.exit(1);
  }

  if (isNaN(batchSize) || batchSize <= 0) {
    console.error('❌ Error: --batch-size must be a positive number');
    process.exit(1);
  }

  try {
    await seedTracingData({ apiKey, count, batchSize });
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
