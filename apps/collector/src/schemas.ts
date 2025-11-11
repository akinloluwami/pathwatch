import { z } from 'zod';

export const EventSchema = z.object({
  api_key: z.string(),
  method: z.string(),
  path: z.string(),
  url: z.string().optional(),
  host: z.string().optional(),
  status: z.number(),
  latency_ms: z.number(),
  req_size: z.number(),
  res_size: z.number(),
  ip: z.string().optional(),
  user_agent: z.string().optional(),
  body: z.any().optional(),
});

export type Event = z.infer<typeof EventSchema>;

// Span Schema for distributed tracing
export const SpanAttributeSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()])
);

export const SpanEventSchema = z.object({
  name: z.string(),
  timestamp: z.number(),
  attributes: SpanAttributeSchema.optional(),
});

export const SpanLinkSchema = z.object({
  trace_id: z.string(),
  span_id: z.string(),
  attributes: SpanAttributeSchema.optional(),
});

export const SpanSchema = z.object({
  api_key: z.string(),
  trace_id: z.string(),
  span_id: z.string(),
  parent_span_id: z.string().optional().nullable(),
  service_name: z.string(),
  span_name: z.string(),
  span_kind: z.enum(['INTERNAL', 'SERVER', 'CLIENT', 'PRODUCER', 'CONSUMER']),
  start_time_unix_nano: z.number(),
  end_time_unix_nano: z.number(),
  duration_ms: z.number(),
  status_code: z.enum(['UNSET', 'OK', 'ERROR']),
  status_message: z.string().optional().nullable(),
  attributes: SpanAttributeSchema.optional(),
  events: z.array(SpanEventSchema).optional(),
  links: z.array(SpanLinkSchema).optional(),
  resource_attributes: SpanAttributeSchema.optional(),
  // Semantic convention attributes
  http_method: z.string().optional().nullable(),
  http_url: z.string().optional().nullable(),
  http_status_code: z.number().optional().nullable(),
  db_system: z.string().optional().nullable(),
  db_statement: z.string().optional().nullable(),
});

export type Span = z.infer<typeof SpanSchema>;

// Trace Schema (aggregated from spans)
export const TraceSchema = z.object({
  api_key: z.string(),
  trace_id: z.string(),
  service_name: z.string(),
  trace_name: z.string(),
  root_service_name: z.string(),
  duration_ms: z.number(),
  span_count: z.number(),
  error_span_count: z.number(),
  status: z.enum(['success', 'error', 'pending']),
  http_method: z.string().optional().nullable(),
  http_url: z.string().optional().nullable(),
  http_status_code: z.number().optional().nullable(),
  endpoint: z.string().optional().nullable(),
  root_span_id: z.string(),
  spans: z.array(SpanSchema).optional(), // For batch ingestion
});

export type Trace = z.infer<typeof TraceSchema>;
