# Seed Script

Generate realistic fake telemetry data for testing and development.

## Features

- 🎲 **Realistic Data** - Uses Faker.js to generate authentic-looking API logs
- 🎯 **Dual Ingestion** - Supports seeding to Tinybird, Cloudflare R2, or both
- 📊 **Smart Distribution** - Realistic status code distribution (70% success, 15% client errors, 15% server errors)
- ⚡ **Batch Processing** - Configurable batch sizes for optimal performance
- 📈 **Progress Tracking** - Real-time progress bar and statistics
- 🔐 **Project-Aware** - Automatically fetches org_id and project_id from your API key

## Usage

### Basic Usage

```bash
bun run seed --api-key=pw_your_api_key --count=1000
```

### Seed to Specific Target

```bash
# Tinybird only
bun run seed --api-key=pw_your_api_key --count=1000 --target=tinybird

# Cloudflare R2 only
bun run seed --api-key=pw_your_api_key --count=1000 --target=cloudflare

# Both (default)
bun run seed --api-key=pw_your_api_key --count=1000 --target=both
```

### Custom Batch Size

```bash
bun run seed --api-key=pw_your_api_key --count=10000 --batch-size=50
```

### Large Dataset

```bash
bun run seed --api-key=pw_your_api_key --count=100000 --batch-size=200
```

## Options

| Option         | Required | Default | Description                                        |
| -------------- | -------- | ------- | -------------------------------------------------- |
| `--api-key`    | ✅ Yes   | -       | API key of the project to seed data into           |
| `--count`      | ✅ Yes   | -       | Number of logs to generate                         |
| `--target`     | No       | `both`  | Target system: `tinybird`, `cloudflare`, or `both` |
| `--batch-size` | No       | `100`   | Number of logs to process per batch                |
| `--help`, `-h` | No       | -       | Show help message                                  |

## Environment Variables

### Required

- `DATABASE_URL` - PostgreSQL connection string (to fetch project details)

### For Tinybird

- `TINYBIRD_URL` - Tinybird ingestion endpoint
- `TINYBIRD_TOKEN` - Tinybird authentication token

### For Cloudflare R2

- `CLOUDFLARE_R2_PIPELINE_URL` - Cloudflare R2 pipeline URL

## Generated Data

The seed script generates realistic data with the following characteristics:

### HTTP Methods

- GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD

### API Paths

- `/api/users`, `/api/users/:id`
- `/api/products`, `/api/products/:id`
- `/api/orders`, `/api/orders/:id`
- `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`
- `/api/profile`, `/api/settings`, `/api/analytics`
- `/api/dashboard`, `/api/search`
- `/api/comments`, `/api/posts`, `/api/posts/:id`
- `/api/categories`, `/api/tags`, `/api/notifications`

### Status Codes

- **70%** - 200 (Success)
- **15%** - 201, 204 (Other Success)
- **7%** - 400, 401, 403, 404 (Client Errors)
- **8%** - 500, 502, 503, 504 (Server Errors)

### Latency Distribution

- **Success (2xx)**: 10-500ms
- **Errors (4xx/5xx)**: 50-2000ms

### Request/Response Sizes

- **Request**: 100-10,000 bytes
- **Response**: 200-50,000 bytes

### User Agents

- Chrome (Windows, macOS, Linux)
- Safari (macOS, iOS, iPadOS)
- Mobile browsers (iPhone, iPad)
- API clients (Postman, axios, node-fetch)

### IP Addresses

- Random IPv4 addresses

### Error Bodies

For error responses (status >= 400), includes JSON body with:

```json
{
  "error": "Descriptive error message",
  "code": "ERR_400",
  "timestamp": "2025-11-04T14:30:00.000Z"
}
```

## Examples

### Development Testing

```bash
# Quick test with 100 logs
bun run seed --api-key=pw_dev123 --count=100
```

### Load Testing

```bash
# Simulate a day of traffic (10k requests)
bun run seed --api-key=pw_prod456 --count=10000 --target=both
```

### Performance Testing

```bash
# Large dataset with optimized batching
bun run seed --api-key=pw_perf789 --count=100000 --batch-size=500
```

### Tinybird-Only Testing

```bash
# Test Tinybird pipeline specifically
bun run seed --api-key=pw_tb123 --count=5000 --target=tinybird
```

### Cloudflare-Only Testing

```bash
# Test Cloudflare R2 pipeline specifically
bun run seed --api-key=pw_cf456 --count=5000 --target=cloudflare
```

## Output

The script provides detailed progress and statistics:

```
🔍 Fetching project details...
✅ Found project: proj_abc123 (org: org_xyz789)

🌱 Starting to seed 1000 logs to both...

[██████████████████████████████████████████████████] 100% (1000/1000)

✅ Seeding complete!
📊 Stats:
   - Total logs: 1000
   - Successful: 1000
   - Failed: 0
   - Duration: 12.34s
   - Rate: 81.03 logs/sec
   - Target: both
```

## Error Handling

The script will fail gracefully if:

- API key is not found in the database
- Database connection fails
- Required environment variables are missing
- Ingestion to Tinybird or Cloudflare fails

Errors are logged with descriptive messages for easy debugging.

## Performance Tips

1. **Batch Size**: Larger batches (200-500) are faster but use more memory
2. **Target Selection**: Seeding to one target is ~2x faster than both
3. **Network**: Run close to your Tinybird/Cloudflare regions for best performance
4. **Database**: Ensure your PostgreSQL database is responsive for project lookup

## Use Cases

- **Local Development**: Populate your local environment with test data
- **Dashboard Testing**: Generate data to test analytics visualizations
- **Performance Testing**: Load test your query endpoints with realistic data
- **Demo Preparation**: Create impressive datasets for product demos
- **Migration Testing**: Verify data pipeline integrity before production deployment
