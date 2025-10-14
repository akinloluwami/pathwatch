# PathWatch Development Guide

PathWatch is a monorepo-based API monitoring platform with a multi-service architecture and Tinybird analytics pipeline.

## Architecture Overview

**Three-tier service architecture:**

- `apps/collector` - Elysia/Bun ingestion service that validates API keys and forwards events to Tinybird
- `apps/query` - Elysia/Bun API service with authentication middleware for dashboard queries
- `apps/console` - TanStack Start/React SSR dashboard with file-based routing
- `tinybird/` - ClickHouse analytics pipeline with predefined data transformations

**Data flow:** Collector validates → PostgreSQL auth → Tinybird ingestion → Query API → Console dashboard

## Development Workflow

### Essential Commands

```bash
bun run dev                # Start all services via Turborepo
bun run collector:dev      # Individual service development
bun run console:dev        # Console on port 3000
bun run query:dev          # Query API service
```

### Tinybird Development

Navigate to `tinybird/` directory and use specialized CLI:

- `tb build` - Build project locally after any .datasource/.pipe changes
- `tb endpoint data <pipe_name>` - Test endpoints with parameters
- `tb --cloud datasource append <name> <file>` - Production data ingestion

**Critical:** Always run `tb build` after modifying .datasource or .pipe files.

## Key Patterns & Conventions

### Service Authentication

Both collector and query services use PostgreSQL for API key validation:

```typescript
// Standard pattern in apps/collector and apps/query
const project = await db.query(`SELECT id, org_id FROM projects WHERE api_key = $1`, [apiKey]);
```

### Console Routing Structure

Uses TanStack Router with nested authentication:

- `/__authted/$org/` - Organization-scoped authenticated routes
- `/$org/telmentary/$projectId/` - Project-specific monitoring views
- Route files generate `routeTree.gen.ts` automatically

### Component System

Custom UI components in `apps/console/src/components/ui/`:

- `Button` - Uses Brackets component for terminal-style aesthetic
- Tailwind + custom bracket styling pattern throughout

### Code Style

- Avoid basic comments unless they provide critical context about non-obvious business logic or architectural decisions
- Code should be self-documenting through clear naming and structure

### Tinybird Schema Rules

**Critical constraints** for .datasource files:

- No indentation for property names (SCHEMA, ENGINE, etc.)
- Use JSON paths: `field_name Type json:$.field_name`
- DateTime64(3) required (not DateTime64)
- MergeTree engine default, AggregatingMergeTree for materialized targets

**SQL templating in .pipe files:**

- Start with `%` line for parameterized queries
- Use `{{String(param_name, "default")}}` for parameters
- No modules in templates - use conditional blocks instead of functions

## Integration Points

### Environment Variables

Each service requires specific env vars:

- Collector: `TINYBIRD_URL`, `TINYBIRD_TOKEN`, `DATABASE_URL`
- Query: `TB_TOKEN`, `DATABASE_URL`
- Tinybird: Configured via `tinybird.toml`

### Cross-Service Communication

- Collector → Tinybird: Direct HTTP ingestion via axios
- Console → Query: Bearer token authentication
- Query → Tinybird: Custom TinybirdClient class with typed responses

## Common Tasks

### Adding New Analytics Endpoint

1. Create .pipe file in `tinybird/pipes/`
2. Add endpoint in `tinybird/endpoints/`
3. Run `tb build` to validate
4. Update TinybirdClient usage in query service
5. Add corresponding route/component in console

### Modifying Data Schema

1. Update `tinybird/datasources/ingestions.datasource`
2. Modify collector validation schema (Zod)
3. Run `tb build` and verify with `tb endpoint data`
4. Update query service response types

Remember: This is a real-time analytics platform - always consider data pipeline implications when making schema changes.
