# API Examples

This document shows example requests and responses for both Tinybird and Cloudflare data sources.

## Setup Verification

### Check Active Data Source

```bash
GET / HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "org_id": "org_123",
  "project_id": "proj_456",
  "datasource": "tinybird" // or "cloudflare"
}
```

## Analytics Endpoints

All examples work identically with both data sources.

### Total Requests

```bash
GET /total-requests?limit=100 HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "data": [
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "total_requests": "15420"
    }
  ]
}
```

### Error Rate

```bash
GET /error-rate HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "data": [
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "error_count": "234",
      "total_count": "15420",
      "error_rate_percent": "1.52"
    }
  ]
}
```

### Average Latency

```bash
GET /avg-latency HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "data": [
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "avg_latency_ms": "125.43",
      "min_latency_ms": "12",
      "max_latency_ms": "3456",
      "p95_latency_ms": "287.5",
      "p99_latency_ms": "456.2"
    }
  ]
}
```

### Top Paths

```bash
GET /top-paths?limit=10 HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "data": [
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "path": "/api/users",
      "request_count": "5234"
    },
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "path": "/api/products",
      "request_count": "4123"
    }
  ]
}
```

### Requests Over Time

```bash
GET /requests-over-time?interval=1h&limit=24 HTTP/1.1
Authorization: Bearer your_token
```

**Supported intervals:** `1h`, `1d`, `1w`, `1m`

Response:

```json
{
  "data": [
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "period": "2025-11-04 14:00:00",
      "request_count": "234"
    },
    {
      "org_id": "org_123",
      "project_id": "proj_456",
      "period": "2025-11-04 13:00:00",
      "request_count": "189"
    }
  ]
}
```

### Request Counts by Period

```bash
GET /request-counts-by-period HTTP/1.1
Authorization: Bearer your_token
```

Response:

```json
{
  "data": [
    {
      "last_1h": "234",
      "last_24h": "5432",
      "today": "3421",
      "yesterday": "4123",
      "last_3d": "12456",
      "last_7d": "34567",
      "last_30d": "125678",
      "this_month": "89234",
      "last_month": "145234"
    }
  ]
}
```

### Detailed Requests

```bash
GET /requests?method=GET&status=200&limit=50 HTTP/1.1
Authorization: Bearer your_token
```

**Query Parameters:**

- `method` - Filter by HTTP method (GET, POST, etc.)
- `status` - Filter by HTTP status code
- `start_date` - Filter by start date (ISO 8601)
- `end_date` - Filter by end date (ISO 8601)
- `limit` - Number of results (default: 100)

Response:

```json
{
  "data": [
    {
      "id": "req_123",
      "timestamp": "2025-11-04T14:30:00Z",
      "org_id": "org_123",
      "project_id": "proj_456",
      "method": "GET",
      "path": "/api/users",
      "status": "200",
      "latency_ms": "125",
      "req_size": "456",
      "res_size": "1234",
      "ip": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "body": null
    }
  ]
}
```

## Error Responses

Both data sources return errors in the same format:

```json
{
  "error": "Tinybird API error: Invalid token"
}
```

or

```json
{
  "error": "Query 'unknown_query' not found"
}
```

## Performance Comparison

### Tinybird

- **Pros:** Pre-computed aggregations, faster for complex queries
- **Cons:** Requires Tinybird account, monthly costs

### Cloudflare R2

- **Pros:** Direct SQL control, potentially lower costs
- **Cons:** Slower for complex aggregations, requires wrangler CLI

## Testing Both Data Sources

You can easily switch between data sources for testing:

```bash
# Test with Tinybird
DATASOURCE=tinybird TB_TOKEN=your_token bun run dev

# Test with Cloudflare
DATASOURCE=cloudflare R2_API_TOKEN=your_token R2_WAREHOUSE_NAME=warehouse bun run dev
```

Both should return identical data structures for the same queries.
