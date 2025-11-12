import { Span, Trace } from './schemas';

export function enrichSpan(span: Span, project_id: string, org_id: string): any {
  // Convert nanoseconds to Date object
  const timestamp = new Date(span.start_time_unix_nano / 1000000);

  return {
    trace_id: span.trace_id,
    span_id: span.span_id,
    parent_span_id: span.parent_span_id || null,
    timestamp: Math.floor(timestamp.getTime() / 1000), // Unix timestamp in seconds
    org_id,
    project_id,
    service_name: span.service_name,
    span_name: span.span_name,
    span_kind: span.span_kind,
    start_time_ms: Math.floor(span.start_time_unix_nano / 1000000),
    end_time_ms: Math.floor(span.end_time_unix_nano / 1000000),
    duration_ms: span.duration_ms,
    status_code: span.status_code,
    status_message: span.status_message || null,
    attributes: span.attributes ? JSON.stringify(span.attributes) : '{}',
    events: span.events ? JSON.stringify(span.events) : '[]',
    links: span.links ? JSON.stringify(span.links) : '[]',
    resource_attributes: span.resource_attributes ? JSON.stringify(span.resource_attributes) : '{}',
    http_method: span.http_method || null,
    http_url: span.http_url || null,
    http_status_code: span.http_status_code || null,
    db_system: span.db_system || null,
    db_statement: span.db_statement || null,
    error: span.status_code === 'ERROR',
  };
}

export function enrichTrace(trace: Trace, project_id: string, org_id: string): any {
  return {
    trace_id: trace.trace_id,
    timestamp: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    org_id,
    project_id,
    service_name: trace.service_name,
    trace_name: trace.trace_name,
    root_service_name: trace.root_service_name,
    duration_ms: trace.duration_ms,
    span_count: trace.span_count,
    error_span_count: trace.error_span_count,
    status: trace.status,
    http_method: trace.http_method || null,
    http_url: trace.http_url || null,
    http_status_code: trace.http_status_code || null,
    endpoint: trace.endpoint || null,
    root_span_id: trace.root_span_id,
  };
}

// Helper to aggregate spans into a trace
export function aggregateSpansToTrace(spans: Span[], project_id: string, org_id: string): any {
  if (!spans.length) return null;

  const rootSpan = spans.find((s) => !s.parent_span_id) || spans[0];
  const errorSpans = spans.filter((s) => s.status_code === 'ERROR');

  // Calculate total duration from root span or max end time - min start time
  const startTimes = spans.map((s) => s.start_time_unix_nano);
  const endTimes = spans.map((s) => s.end_time_unix_nano);
  const minStart = Math.min(...startTimes);
  const maxEnd = Math.max(...endTimes);
  const duration_ms = Math.round((maxEnd - minStart) / 1000000);

  // Determine overall status
  let status: 'success' | 'error' | 'pending' = 'success';
  if (errorSpans.length > 0) {
    status = 'error';
  } else if (spans.some((s) => s.status_code === 'UNSET')) {
    status = 'pending';
  }

  return {
    trace_id: rootSpan.trace_id,
    timestamp: Math.floor(minStart / 1000000000), // Convert nanoseconds to seconds
    org_id,
    project_id,
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
    endpoint: extractEndpoint(rootSpan.http_url),
    root_span_id: rootSpan.span_id,
  };
}

function extractEndpoint(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url.split('?')[0];
  }
}
