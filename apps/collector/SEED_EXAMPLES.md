# Seed Script Examples

## Quick Start

```bash
# Show help
bun run seed --help

# Basic usage - 1000 logs to both targets
bun run seed --api-key=pw_abc123 --count=1000
```

## Common Scenarios

### 1. Local Development

```bash
# Small dataset for quick testing
bun run seed --api-key=pw_dev_local --count=100

# Expected output:
# 🔍 Fetching project details...
# ✅ Found project: proj_abc123 (org: org_xyz789)
#
# 🌱 Starting to seed 100 logs to both...
# [██████████████████████████████████████████████████] 100% (100/100)
#
# ✅ Seeding complete!
# 📊 Stats:
#    - Total logs: 100
#    - Successful: 100
#    - Failed: 0
#    - Duration: 2.45s
#    - Rate: 40.82 logs/sec
#    - Target: both
```

### 2. Dashboard Testing

```bash
# Generate data for different time periods
bun run seed --api-key=pw_dashboard --count=5000

# This creates realistic traffic patterns:
# - 70% success (200)
# - 15% other success (201, 204)
# - 7% client errors (400, 401, 403, 404)
# - 8% server errors (500, 502, 503, 504)
```

### 3. Tinybird Pipeline Testing

```bash
# Test Tinybird ingestion specifically
bun run seed --api-key=pw_tinybird_test --count=3000 --target=tinybird

# Faster because it only writes to one target
# Expected rate: ~100-150 logs/sec
```

### 4. Cloudflare R2 Testing

```bash
# Test Cloudflare R2 ingestion specifically
bun run seed --api-key=pw_cloudflare_test --count=3000 --target=cloudflare

# Uses batch ingestion for efficiency
# Expected rate: ~150-200 logs/sec
```

### 5. Load Testing

```bash
# Large dataset with optimized batching
bun run seed --api-key=pw_load_test --count=50000 --batch-size=500 --target=tinybird

# Performance tips:
# - Larger batch sizes = faster ingestion
# - Single target = ~2x faster than both
# - Expected rate: 200-300 logs/sec for large batches
```

### 6. Demo Preparation

```bash
# Create impressive dataset for product demos
bun run seed --api-key=pw_demo --count=100000 --batch-size=500

# Takes ~5-10 minutes depending on network
# Creates diverse, realistic traffic patterns
# Includes all API paths, methods, and status codes
```

## What Data Gets Generated?

### Example Generated Log Entry

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-11-04T14:30:15.123Z",
  "org_id": "org_xyz789",
  "project_id": "proj_abc123",
  "method": "GET",
  "path": "/api/users/550e8400-e29b-41d4-a716-446655440001",
  "url": "https://api.example.com/api/users/550e8400-e29b-41d4-a716-446655440001",
  "host": "api.example.com",
  "status": 200,
  "latency_ms": 125,
  "req_size": 456,
  "res_size": 1234,
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "body": null
}
```

### Distribution Examples

**Status Codes** (1000 logs):

- 200: ~700 logs
- 201: ~100 logs
- 204: ~50 logs
- 400-404: ~70 logs
- 500-504: ~80 logs

**Latency** (1000 logs):

- Fast (10-100ms): ~400 logs
- Medium (100-500ms): ~500 logs
- Slow (500-2000ms): ~100 logs

**Methods** (1000 logs):

- GET: ~300 logs
- POST: ~250 logs
- PUT: ~150 logs
- PATCH: ~100 logs
- DELETE: ~100 logs
- OPTIONS: ~50 logs
- HEAD: ~50 logs

## Troubleshooting

### API Key Not Found

```bash
❌ Error: No project found with API key: pw_invalid
```

**Solution:** Verify your API key exists in the database

### Missing Environment Variables

```bash
❌ Error: DATABASE_URL environment variable is required
```

**Solution:** Ensure all required env vars are set in `.env`

### Ingestion Errors

```bash
❌ Error ingesting batch 1: Tinybird API error: Invalid token
```

**Solution:** Check your Tinybird/Cloudflare credentials

### Network Timeout

```bash
❌ Error ingesting batch 5: ETIMEDOUT
```

**Solution:** Reduce batch size or check network connectivity

## Performance Benchmarks

Tested on MacBook Pro M1, 16GB RAM, fiber internet:

| Logs    | Target     | Batch Size | Duration | Rate    |
| ------- | ---------- | ---------- | -------- | ------- |
| 1,000   | both       | 100        | 12.5s    | 80/sec  |
| 1,000   | tinybird   | 100        | 8.2s     | 122/sec |
| 1,000   | cloudflare | 100        | 6.8s     | 147/sec |
| 10,000  | both       | 200        | 95.3s    | 105/sec |
| 10,000  | tinybird   | 500        | 42.1s    | 238/sec |
| 10,000  | cloudflare | 500        | 35.6s    | 281/sec |
| 100,000 | tinybird   | 500        | 380s     | 263/sec |

_Your results may vary based on network conditions and target system performance._

## Integration with Other Tools

### With Console Dashboard

After seeding data, view it in the console:

```bash
# Seed data
bun run seed --api-key=pw_abc123 --count=5000

# Start query service
cd ../query && bun run dev

# Start console
cd ../console && bun run dev

# Open http://localhost:3000 to see your data
```

### With Tinybird CLI

Check data in Tinybird directly:

```bash
# Seed data
bun run seed --api-key=pw_abc123 --count=1000 --target=tinybird

# Query in Tinybird
cd ../../tinybird
tb endpoint data total_requests org_id=org_xyz789 project_id=proj_abc123
```

### With Wrangler (Cloudflare)

Query R2 data directly:

```bash
# Seed data
bun run seed --api-key=pw_abc123 --count=1000 --target=cloudflare

# Query with wrangler
npx wrangler r2 sql query "your_warehouse" "SELECT COUNT(*) FROM default.pw_logs WHERE project_id = 'proj_abc123'"
```
