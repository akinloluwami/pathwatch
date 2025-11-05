# PathWatch Collector

Ingestion service that validates API keys and forwards telemetry events to Tinybird and/or Cloudflare R2.

## Architecture

The collector is an Elysia/Bun service that:

1. Validates API keys against PostgreSQL
2. Enriches events with project and organization context
3. Ingests data to Tinybird and/or Cloudflare R2 pipelines

## Getting Started

Install dependencies:

```bash
bun install
```

Set up environment variables (see `.env.example`):

```bash
cp .env.example .env
# Edit .env with your configuration
```

## Development

Start the development server:

```bash
bun run dev
```

The collector will run at http://localhost:6000

## Seeding Test Data

Generate realistic fake telemetry data for testing:

```bash
# Generate 1000 logs to both Tinybird and Cloudflare
bun run seed --api-key=pw_your_api_key --count=1000

# Seed to specific target
bun run seed --api-key=pw_your_api_key --count=5000 --target=tinybird

# Custom batch size for performance
bun run seed --api-key=pw_your_api_key --count=10000 --batch-size=200
```

See [SEED_GUIDE.md](./SEED_GUIDE.md) for detailed documentation.

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string
- `TINYBIRD_URL` - Tinybird ingestion endpoint
- `TINYBIRD_TOKEN` - Tinybird authentication token
- `CLOUDFLARE_R2_PIPELINE_URL` - Cloudflare R2 pipeline URL
- `CF_CAT_URI` - Cloudflare CAT URI
- `CF_TOKEN_VALUE` - Cloudflare token value

### Optional

- `PORT` - Server port (default: 6000)

## API Endpoints

### POST /ingest

Ingest telemetry events

**Headers:**

- `x-api-key` - Project API key

**Body:**

```json
{
  "method": "GET",
  "path": "/api/users",
  "url": "https://api.example.com/api/users",
  "host": "api.example.com",
  "status": 200,
  "latency_ms": 125,
  "req_size": 456,
  "res_size": 1234,
  "ip": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "body": null
}
```

## Building for Production

```bash
bun run build
```

## Running in Production

```bash
bun run start
```
