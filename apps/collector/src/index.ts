import { Elysia } from 'elysia';
import { config, validateConfig } from './config';
import { initDatabase } from './database';
import {
  handleIngest,
  handleRoot,
  handleSpanIngest,
  handleTraceIngest,
  handleBatchSpanIngest,
} from './routes';

validateConfig();
await initDatabase();

const app = new Elysia();

app
  .post('/ingest', handleIngest)
  .post('/ingest/spans', handleSpanIngest)
  .post('/ingest/traces', handleTraceIngest)
  .post('/ingest/batch/spans', handleBatchSpanIngest)
  .get('/', handleRoot);

app.listen(config.port, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
});
