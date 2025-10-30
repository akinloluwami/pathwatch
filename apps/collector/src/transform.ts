import type { Event } from './schemas';

interface EnrichedEvent {
  id: string;
  timestamp: string;
  org_id: string;
  project_id: string;
  method: string;
  path: string;
  url: string | null;
  host: string | null;
  status: number;
  latency_ms: number;
  req_size: number;
  res_size: number;
  ip: string | null;
  user_agent: string | null;
  body: string | null;
}

export function enrichEvent(
  event: Event,
  projectId: string,
  orgId: string,
  logFullUrl: boolean
): EnrichedEvent {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    org_id: String(orgId),
    project_id: String(projectId),
    method: String(event.method),
    path: String(event.path),
    url: logFullUrl ? String(event.url) : null,
    host: event.host ? String(event.host) : null,
    status: Number(Math.round(event.status)),
    latency_ms: Number(Math.round(event.latency_ms)),
    req_size: Number(Math.round(event.req_size)),
    res_size: Number(Math.round(event.res_size)),
    ip: event.ip ? String(event.ip) : null,
    user_agent: event.user_agent ? String(event.user_agent) : null,
    body: event.body
      ? typeof event.body === 'string'
        ? event.body
        : JSON.stringify(event.body)
      : null,
  };
}

export function transformForR2(event: EnrichedEvent) {
  return {
    id: event.id,
    timestamp: new Date(event.timestamp).getTime(),
    org_id: event.org_id,
    project_id: event.project_id,
    method: event.method,
    path: event.path,
    url: event.url,
    host: event.host,
    status: event.status,
    latency_ms: event.latency_ms,
    req_size: event.req_size,
    res_size: event.res_size,
    ip: event.ip,
    user_agent: event.user_agent,
    body: event.body,
  };
}
