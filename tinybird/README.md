# PathWatch Tinybird Configuration

This directory contains the Tinybird configuration for PathWatch analytics.

## Structure

```
tinybird/
├── datasources/          # Data source definitions
│   └── ingestions.datasource
├── pipes/               # SQL pipes for analytics
│   ├── total_requests.sql
│   ├── error_rate.sql
│   ├── avg_latency.sql
│   ├── top_paths.sql
│   ├── requests_over_time.sql
│   ├── list_requests.sql
│   └── request_counts_by_period.sql
├── scripts/             # Deployment scripts
│   └── deployPipes.ts
├── tinybird.toml        # Tinybird configuration
└── package.json         # Dependencies and scripts
```

## Setup

1. Install dependencies:

   ```bash
   cd tinybird
   npm install
   ```

2. Set environment variables:

   ```bash
   export TB_TOKEN=your_tinybird_token
   ```

3. Deploy datasources and pipes:
   ```bash
   npm run deploy
   ```

## Available Pipes

### `total_requests`

- **Purpose**: Get total request counts per organization and project
- **Parameters**: None
- **Returns**: `org_id`, `project_id`, `total_requests`

### `error_rate`

- **Purpose**: Get error rates (status >= 400) per organization and project
- **Parameters**: None
- **Returns**: `org_id`, `project_id`, `error_count`, `total_count`, `error_rate_percent`

### `avg_latency`

- **Purpose**: Get latency statistics per organization and project
- **Parameters**: None
- **Returns**: `org_id`, `project_id`, `avg_latency_ms`, `min_latency_ms`, `max_latency_ms`

### `top_paths`

- **Purpose**: Get most requested paths per organization and project
- **Parameters**: None
- **Returns**: `org_id`, `project_id`, `path`, `request_count` (top 100)

### `requests_over_time`

- **Purpose**: Get hourly request counts over time per organization and project
- **Parameters**: None
- **Returns**: `org_id`, `project_id`, `hour`, `request_count`

### `list_requests`

- **Purpose**: List individual requests for a specific organization and project
- **Parameters**: `org_id`, `project_id`, `limit` (default 100), `offset` (default 0)
- **Returns**: All request fields (`id`, `timestamp`, `method`, `path`, `status`, `latency_ms`, etc.)

### `request_counts_by_period`

- **Purpose**: Get request counts for various time periods for a specific organization and project
- **Parameters**: `org_id`, `project_id`
- **Returns**: `last_1h`, `last_24h`, `today`, `yesterday`, `last_3d`, `last_7d`, `last_30d`, `this_month`, `last_month`

## Usage

After deployment, you can call these pipes via the Tinybird API:

```bash
curl "https://api.tinybird.co/v0/pipes/total_requests.json" \
  -H "Authorization: Bearer $TB_TOKEN"
```

For pipes with parameters:

```bash
curl "https://api.tinybird.co/v0/pipes/list_requests.json?org_id=org123&project_id=proj456&limit=50" \
  -H "Authorization: Bearer $TB_TOKEN"
```

## Development

- Use `npm run deploy:watch` for development with auto-reload
- Modify SQL files in `pipes/` directory
- Add new datasources in `datasources/` directory
