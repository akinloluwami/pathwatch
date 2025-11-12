import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config, validateConfig } from './config';
import { initDatabase } from './database';
import { authenticateApiKey } from './auth-middleware';
import {
  limitQuerySchema,
  intervalQuerySchema,
  requestsQuerySchema,
  tracesQuerySchema,
  traceIdParamSchema,
  traceMetricsQuerySchema,
  tracesTimeSeriesQuerySchema,
} from './route-schemas';
import {
  handleRoot,
  handleTotalRequests,
  handleErrorRate,
  handleAvgLatency,
  handleTopPaths,
  handleRequestsOverTime,
  handleRequestCountsByPeriod,
  handleRequests,
  handleListTraces,
  handleGetTraceDetails,
  handleGetTraceSpans,
  handleTraceLatencyMetrics,
  handleTraceErrorRate,
  handleTracesOverTime,
  handleTopServices,
  handleTopEndpoints,
} from './routes';

validateConfig();
await initDatabase();

const app = new Elysia()
  .use(
    cors({
      origin: true,
      credentials: true,
    })
  )
  .use(authenticateApiKey)

  .get('/', handleRoot, { authenticate: true })

  .get('/analytics/total-requests', handleTotalRequests, {
    authenticate: true,
    query: limitQuerySchema,
  })

  .get('/analytics/error-rate', handleErrorRate, {
    authenticate: true,
    query: limitQuerySchema,
  })

  .get('/analytics/avg-latency', handleAvgLatency, {
    authenticate: true,
    query: limitQuerySchema,
  })

  .get('/analytics/top-paths', handleTopPaths, {
    authenticate: true,
    query: limitQuerySchema,
  })

  .get('/analytics/requests-over-time', handleRequestsOverTime, {
    authenticate: true,
    query: intervalQuerySchema,
  })

  .get('/analytics/request-counts-by-period', handleRequestCountsByPeriod, {
    authenticate: true,
    query: intervalQuerySchema,
  })

  .get('/requests', handleRequests, {
    authenticate: true,
    query: requestsQuerySchema,
  })

  // Tracing endpoints
  .get('/tracing/traces', handleListTraces, {
    authenticate: true,
    query: tracesQuerySchema,
  })

  .get('/tracing/traces/:trace_id', handleGetTraceDetails, {
    authenticate: true,
    params: traceIdParamSchema,
  })

  .get('/tracing/traces/:trace_id/spans', handleGetTraceSpans, {
    authenticate: true,
    params: traceIdParamSchema,
  })

  .get('/tracing/metrics/latency', handleTraceLatencyMetrics, {
    authenticate: true,
    query: traceMetricsQuerySchema,
  })

  .get('/tracing/metrics/error-rate', handleTraceErrorRate, {
    authenticate: true,
    query: traceMetricsQuerySchema,
  })

  .get('/tracing/metrics/over-time', handleTracesOverTime, {
    authenticate: true,
    query: tracesTimeSeriesQuerySchema,
  })

  .get('/tracing/top-services', handleTopServices, {
    authenticate: true,
    query: traceMetricsQuerySchema,
  })

  .get('/tracing/top-endpoints', handleTopEndpoints, {
    authenticate: true,
    query: traceMetricsQuerySchema,
  })

  .listen(config.port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
