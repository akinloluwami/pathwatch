# Query System

This directory contains SQL query builders for different data sources.

## R2 Queries (`r2-queries.ts`)

Contains ClickHouse-compatible SQL queries for Cloudflare R2 data warehouse. These queries mirror the Tinybird pipe definitions but are executed directly against R2's SQL interface.

### Available Queries

- **total_requests** - Total request count by project
- **error_rate** - Error rate percentage (status >= 400)
- **avg_latency** - Latency statistics (avg, min, max, p95, p99)
- **top_paths** - Most frequently requested paths
- **requests_over_time** - Time-series request counts with configurable intervals
- **request_counts_by_period** - Pre-aggregated counts for common time periods (1h, 24h, today, yesterday, etc.)
- **ingestions_endpoint** - Detailed request logs with filtering support

### Table Schema

All queries assume a table `default.pw_logs` with the following schema:

```sql
id String
timestamp DateTime
org_id String
project_id String
method String
path String
status Int32
latency_ms Int32
req_size Int32
res_size Int32
ip Nullable(String)
user_agent Nullable(String)
body Nullable(String)
```

### Adding New Queries

To add a new query:

1. Add a new query builder function to `r2SqlQueries` object
2. Accept `params` object with required parameters
3. Use `escapeString()` helper for all user inputs
4. Return a complete SQL query string
5. Follow ClickHouse SQL syntax conventions

Example:

```typescript
my_new_query: (params) => {
  const { org_id, project_id, custom_param } = params;
  return `
    SELECT
      field1,
      field2,
      count() AS total
    FROM default.pw_logs
    WHERE org_id = '${escapeString(org_id)}' 
      AND project_id = '${escapeString(project_id)}'
    GROUP BY field1, field2
    ORDER BY total DESC
  `;
};
```

### Security

All string parameters are escaped using `escapeString()` to prevent SQL injection. Numeric parameters are coerced with `Number()`.
