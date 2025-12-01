import { z } from 'zod';
import { EventSchema, SpanSchema, TraceSchema } from './schemas';
import { getProjectByApiKey } from './database';
import { enrichEvent } from './transform';
import { enrichSpan, enrichTrace, aggregateSpansToTrace } from './tracing-transform';
import { ingestToTinybird } from './tinybird-ingest';
import { ingestSpansToTinybird, ingestTracesToTinybird } from './tracing-ingest';

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

    await Promise.all(enriched.map((event) => ingestToTinybird(event)));

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

export async function handleSpanIngest({ body, set }: any) {
  try {
    const parsed = z.array(SpanSchema).parse(body);
    const apiKey = parsed[0].api_key;

    const project = await getProjectByApiKey(apiKey);
    if (!project) {
      set.status = 403;
      return { success: false, error: 'Invalid API key' };
    }

    const { id: project_id, org_id } = project;

    const enrichedSpans = parsed.map((span) => enrichSpan(span, project_id, org_id));

    await ingestSpansToTinybird(enrichedSpans);

    return { success: true, count: enrichedSpans.length };
  } catch (err: any) {
    console.error('Span ingest error', err.response?.data || err.message);
    set.status = 400;
    return { success: false, error: err.message };
  }
}

export async function handleTraceIngest({ body, set }: any) {
  try {
    // Pre-inject api_key into spans before validation if they exist
    if (body.spans && Array.isArray(body.spans)) {
      body.spans = body.spans.map((span: any) => ({
        ...span,
        api_key: body.api_key,
      }));
    }

    const parsed = TraceSchema.parse(body);
    const apiKey = parsed.api_key;

    const project = await getProjectByApiKey(apiKey);
    if (!project) {
      set.status = 403;
      return { success: false, error: 'Invalid API key' };
    }

    const { id: project_id, org_id } = project;

    // If trace includes spans, ingest them separately and create trace aggregate
    if (parsed.spans && parsed.spans.length > 0) {
      const enrichedSpans = parsed.spans.map((span) => enrichSpan(span, project_id, org_id));
      await ingestSpansToTinybird(enrichedSpans);

      const aggregatedTrace = aggregateSpansToTrace(parsed.spans, project_id, org_id);
      if (aggregatedTrace) {
        await ingestTracesToTinybird([aggregatedTrace]);
      }

      return { success: true, span_count: enrichedSpans.length, trace_id: parsed.trace_id };
    } else {
      // Direct trace ingestion without spans
      const enrichedTrace = enrichTrace(parsed, project_id, org_id);
      await ingestTracesToTinybird([enrichedTrace]);

      return { success: true, trace_id: parsed.trace_id };
    }
  } catch (err: any) {
    console.error('Trace ingest error', err.response?.data || err.message);
    set.status = 400;
    return { success: false, error: err.message };
  }
}

export async function handleBatchSpanIngest({ body, set }: any) {
  try {
    const { api_key, spans } = body;

    if (!api_key || !spans || !Array.isArray(spans)) {
      set.status = 400;
      return { success: false, error: 'Invalid batch format. Expected { api_key, spans: [] }' };
    }

    const parsed = z.array(SpanSchema).parse(spans.map((s: any) => ({ ...s, api_key })));

    const project = await getProjectByApiKey(api_key);
    if (!project) {
      set.status = 403;
      return { success: false, error: 'Invalid API key' };
    }

    const { id: project_id, org_id } = project;

    const enrichedSpans = parsed.map((span) => enrichSpan(span, project_id, org_id));

    await ingestSpansToTinybird(enrichedSpans);

    // Group spans by trace_id and create trace aggregates
    const spansByTrace = new Map<string, any[]>();
    enrichedSpans.forEach((span) => {
      const existing = spansByTrace.get(span.trace_id) || [];
      existing.push(span);
      spansByTrace.set(span.trace_id, existing);
    });

    const traces = Array.from(spansByTrace.values())
      .map((spans) => {
        const originalSpans = parsed.filter((s) => s.trace_id === spans[0].trace_id);
        return aggregateSpansToTrace(originalSpans, project_id, org_id);
      })
      .filter(Boolean);

    if (traces.length > 0) {
      await ingestTracesToTinybird(traces);
    }

    return {
      success: true,
      span_count: enrichedSpans.length,
      trace_count: traces.length,
    };
  } catch (err: any) {
    console.error('Batch span ingest error', err.response?.data || err.message);
    set.status = 400;
    return { success: false, error: err.message };
  }
}
