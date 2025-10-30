import { z } from 'zod';
import { EventSchema } from './schemas';
import { getProjectByApiKey } from './database';
import { enrichEvent, transformForR2 } from './transform';
import { ingestToCloudflareR2 } from './cloudflare-ingest';
import { ingestToTinybird } from './tinybird-ingest';

export async function handleIngest({ body, set }: any) {
  try {
    const parsed = z.array(EventSchema).parse(body);
    const apiKey = parsed[0].api_key;

    const project = await getProjectByApiKey(apiKey);
    if (!project) {
      set.status = 403;
      return { success: false, error: 'Invalid API key' };
    }

    const { id: project_id, org_id, log_full_url } = project;

    const enriched = parsed.map((e) => enrichEvent(e, project_id, org_id, log_full_url));

    const r2Data = enriched.map(transformForR2);

    await Promise.all([
      ingestToCloudflareR2(r2Data),
      ...enriched.map((event) => ingestToTinybird(event)),
    ]);

    return { success: true, count: enriched.length };
  } catch (err: any) {
    console.error('Ingest error', err.response?.data || err.message);
    set.status = 400;
    return { success: false, error: err.message };
  }
}

export function handleRoot() {
  return 'Hello Elysia';
}
