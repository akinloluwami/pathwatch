import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config, validateConfig } from './config';
import { initDatabase } from './database';
import { authenticateApiKey } from './auth-middleware';
import { limitQuerySchema, intervalQuerySchema, requestsQuerySchema } from './route-schemas';
import {
  handleRoot,
  handleTotalRequests,
  handleErrorRate,
  handleAvgLatency,
  handleTopPaths,
  handleRequestsOverTime,
  handleRequestCountsByPeriod,
  handleRequests,
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

  .listen(config.port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
