# Data Source Configuration

## Overview

The query service now supports two data sources that can be switched via the `DATASOURCE` environment variable:

- `tinybird` (default) - Uses Tinybird API with predefined pipes
- `cloudflare` - Uses Cloudflare R2 SQL warehouse with dynamic query building

## Files Created/Modified

### New Files

1. **`src/cloudflare-client.ts`**
   - CloudflareClient class for executing R2 SQL queries
   - Mirrors TinybirdClient interface for seamless switching
   - Parses wrangler CLI table output into JSON

2. **`src/queries/r2-queries.ts`**
   - SQL query builders for all endpoints
   - ClickHouse-compatible SQL targeting `default.pw_logs` table
   - Includes SQL injection protection via string escaping
   - Supports all query types: total_requests, error_rate, avg_latency, top_paths, requests_over_time, request_counts_by_period, ingestions_endpoint

3. **`src/queries/README.md`**
   - Documentation for query system
   - Schema reference
   - Guide for adding new queries

### Modified Files

1. **`src/config.ts`**
   - Added `DATASOURCE` configuration option
   - Added `DataSource` type ('tinybird' | 'cloudflare')
   - Updated validation to check required vars based on data source
   - Logs selected data source on startup

2. **`src/routes.ts`**
   - Added CloudflareClient import
   - Created `getDataClient()` helper function
   - Updated all route handlers to use dynamic client selection
   - Added datasource to root endpoint response

3. **`.env.example`**
   - Documented DATASOURCE option
   - Grouped environment variables by data source
   - Added comments explaining when each var is required

4. **`README.md`**
   - Complete rewrite with data source documentation
   - Environment variable reference
   - Architecture explanation for both modes

## Usage

### Tinybird Mode (Default)

```bash
DATASOURCE=tinybird
TB_TOKEN=tbp_your_token
DATABASE_URL=postgresql://...
```

### Cloudflare Mode

```bash
DATASOURCE=cloudflare
R2_API_TOKEN=your_cloudflare_token
R2_WAREHOUSE_NAME=your_warehouse
DATABASE_URL=postgresql://...
```

## Query Mapping

All Tinybird pipes have equivalent R2 queries:

| Tinybird Pipe            | R2 Query                 | Description            |
| ------------------------ | ------------------------ | ---------------------- |
| total_requests           | total_requests           | Total request count    |
| error_rate               | error_rate               | Error rate calculation |
| avg_latency              | avg_latency              | Latency statistics     |
| top_paths                | top_paths                | Most requested paths   |
| requests_over_time       | requests_over_time       | Time-series data       |
| request_counts_by_period | request_counts_by_period | Period aggregations    |
| ingestions_endpoint      | ingestions_endpoint      | Detailed logs          |

## API Behavior

The API interface remains identical regardless of data source. Clients don't need to know which backend is being used. The response format is normalized across both data sources:

```typescript
{
  data: Array<any>;
}
```

## Testing

To test the configuration:

1. Set environment variables for your chosen data source
2. Start the service: `bun run dev`
3. Check startup logs for "Using data source: tinybird" or "cloudflare"
4. Hit root endpoint to verify: `GET /` should return datasource field
5. Test any analytics endpoint: `GET /total-requests`

## Error Handling

Both clients provide consistent error handling:

- Missing environment variables are caught at startup
- Invalid queries return error messages in consistent format
- SQL injection protection in R2 queries via escapeString()

## Performance Considerations

- **Tinybird**: Pre-computed pipes, faster for complex aggregations
- **Cloudflare R2**: Direct SQL execution, may be slower for complex queries but offers more flexibility

## Future Enhancements

Potential improvements:

- Add query caching layer
- Implement connection pooling for R2
- Add query performance metrics
- Support for additional data sources
- Query result streaming for large datasets
