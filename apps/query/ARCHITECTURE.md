# Query Service Architecture

## Data Source Selection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Environment Variable                      │
│                    DATASOURCE=tinybird or cloudflare        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    config.ts                                 │
│  - Validates required environment variables                  │
│  - Logs selected data source                                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               DataClientFactory                              │
│  - Singleton pattern                                         │
│  - Creates appropriate client based on config                │
└─────────────┬───────────────────────────────┬───────────────┘
              │                               │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │  TinybirdClient   │         │ CloudflareClient  │
    │                   │         │                   │
    │ Implements:       │         │ Implements:       │
    │   DataClient      │         │   DataClient      │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                               │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │  Tinybird API     │         │  R2 SQL Queries   │
    │  - HTTP requests  │         │  - Wrangler CLI   │
    │  - Predefined     │         │  - Dynamic SQL    │
    │    pipes          │         │    building       │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                               │
              └───────────┬───────────────────┘
                          │
                          ▼
                ┌─────────────────┐
                │   routes.ts     │
                │                 │
                │  - Unified API  │
                │  - Same response│
                │    format       │
                └─────────────────┘
```

## Interface Contract

Both clients implement the `DataClient` interface:

```typescript
interface DataClient {
  query<T = any>(queryName: string, params?: Record<string, any>): Promise<{ data: T[] }>;
}
```

## Query Mapping

| API Route                 | Query Name               | Tinybird Pipe | R2 Query |
| ------------------------- | ------------------------ | ------------- | -------- |
| /total-requests           | total_requests           | ✓             | ✓        |
| /error-rate               | error_rate               | ✓             | ✓        |
| /avg-latency              | avg_latency              | ✓             | ✓        |
| /top-paths                | top_paths                | ✓             | ✓        |
| /requests-over-time       | requests_over_time       | ✓             | ✓        |
| /request-counts-by-period | request_counts_by_period | ✓             | ✓        |
| /requests                 | ingestions_endpoint      | ✓             | ✓        |

## Directory Structure

```
apps/query/src/
├── config.ts                    # Environment & data source config
├── data-client-factory.ts       # Client factory with singleton
├── tinybird-client.ts          # Tinybird API client
├── cloudflare-client.ts        # Cloudflare R2 client
├── routes.ts                    # Route handlers (data source agnostic)
├── queries/
│   ├── r2-queries.ts           # SQL query builders for R2
│   └── README.md               # Query documentation
└── ...
```

## Configuration Examples

### Tinybird Setup

```bash
DATASOURCE=tinybird
TB_TOKEN=tbp_your_token
DATABASE_URL=postgresql://...
```

### Cloudflare Setup

```bash
DATASOURCE=cloudflare
R2_API_TOKEN=your_token
R2_WAREHOUSE_NAME=your_warehouse
DATABASE_URL=postgresql://...
```

## Benefits

1. **Seamless Switching** - Change data source without code changes
2. **Unified Interface** - Same API regardless of backend
3. **Type Safety** - TypeScript interfaces ensure compatibility
4. **Easy Testing** - Mock DataClient for unit tests
5. **Extensible** - Add new data sources by implementing DataClient
