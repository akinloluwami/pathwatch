import { t } from 'elysia';

export const limitQuerySchema = t.Object({
  limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
});

export const intervalQuerySchema = t.Object({
  interval: t.Optional(
    t.Union([
      t.Literal('1m'),
      t.Literal('5m'),
      t.Literal('15m'),
      t.Literal('1h'),
      t.Literal('1d'),
      t.Literal('1w'),
    ])
  ),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
});

export const requestsQuerySchema = t.Object({
  method: t.Optional(t.String()),
  status: t.Optional(t.Number()),
  start_date: t.Optional(t.String()),
  end_date: t.Optional(t.String()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
});

// Tracing schemas
export const tracesQuerySchema = t.Object({
  service_name: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal('success'), t.Literal('error'), t.Literal('pending')])),
  start_time: t.Optional(t.Number()),
  end_time: t.Optional(t.Number()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
  offset: t.Optional(t.Number({ minimum: 0 })),
});

export const traceIdParamSchema = t.Object({
  trace_id: t.String(),
});

export const traceMetricsQuerySchema = t.Object({
  service_name: t.Optional(t.String()),
  start_time: t.Optional(t.Number()),
  end_time: t.Optional(t.Number()),
});

export const tracesTimeSeriesQuerySchema = t.Object({
  interval: t.Optional(t.String()),
  service_name: t.Optional(t.String()),
  start_time: t.Optional(t.Number()),
  end_time: t.Optional(t.Number()),
  limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
});
