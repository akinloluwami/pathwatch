# PathWatch Query API

API service for querying telemetry data with support for multiple data sources.

## Data Sources

This service supports two data sources:

- **Tinybird** (default) - ClickHouse analytics pipeline via Tinybird API
- **Cloudflare R2** - Direct SQL queries to Cloudflare R2 data warehouse

### Configuration

Set the `DATASOURCE` environment variable:

```bash
# Use Tinybird (requires TB_TOKEN)
DATASOURCE=tinybird

# Use Cloudflare R2 (requires R2_API_TOKEN and R2_WAREHOUSE_NAME)
DATASOURCE=cloudflare
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/pathwatch
DATASOURCE=tinybird  # or 'cloudflare'

# For Tinybird (when DATASOURCE=tinybird)
TB_TOKEN=your_tinybird_token

# For Cloudflare (when DATASOURCE=cloudflare)
R2_API_TOKEN=your_cloudflare_r2_api_token
R2_WAREHOUSE_NAME=your_warehouse_name

# Optional
PORT=8000
```

## Getting Started

Install dependencies:

```bash
bun install
```

## Development

Start the development server:

```bash
bun run dev
```

Open http://localhost:8000/ with your browser to see the result.

## Available Endpoints

All endpoints require authentication via Bearer token and org_id/project_id context:

- `GET /total-requests` - Total request count
- `GET /error-rate` - Error rate statistics
- `GET /avg-latency` - Latency metrics (avg, min, max, p95, p99)
- `GET /top-paths` - Most requested paths
- `GET /requests-over-time` - Time-series data
- `GET /request-counts-by-period` - Aggregated counts by time period
- `GET /requests` - Detailed request logs with filtering

## Architecture

### Tinybird Mode

Queries are executed via the Tinybird API using predefined pipes in `tinybird/pipes/`.

### Cloudflare Mode

Queries are built dynamically using templates in `src/queries/r2-queries.ts` and executed via the Wrangler CLI against R2 SQL warehouse.

Both modes provide the same API interface for seamless switching.
