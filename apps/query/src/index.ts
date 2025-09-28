import { Elysia, t } from "elysia";
import { Client } from "pg";
import { TinybirdClient } from "./tinybird-client";

const TB_TOKEN = process.env.TB_TOKEN!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!TB_TOKEN || !DATABASE_URL) {
  console.log({ TB_TOKEN, DATABASE_URL });
  console.error("Missing environment variables");
}

const db = new Client({
  connectionString: DATABASE_URL,
});

await db.connect();

const tinybird = new TinybirdClient(TB_TOKEN);

async function verifyApiKey(token: string) {
  const res = await db.query(
    "SELECT org_id, project_id FROM api_keys WHERE token = $1",
    [token]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0];
}

export const authenticateApiKey = new Elysia().macro({
  authenticate: {
    async resolve({ set, request }) {
      const authHeader = request.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        throw new Error("Unauthorized");
      }

      const token = authHeader.split(" ")[1];
      const apiKey = await verifyApiKey(token);

      if (!apiKey) {
        set.status = 401;
        throw new Error("Unauthorized");
      }

      return {
        org_id: apiKey.org_id,
        project_id: apiKey.project_id,
      };
    },
  },
});

const app = new Elysia()
  .use(authenticateApiKey)
  .get(
    "/",
    ({ org_id, project_id }) => {
      return { org_id, project_id };
    },
    {
      authenticate: true,
    }
  )
  .get(
    "/analytics/total-requests",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("total_requests", {
          org_id,
          project_id,
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/analytics/error-rate",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("error_rate", {
          org_id,
          project_id,
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/analytics/avg-latency",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("avg_latency", {
          org_id,
          project_id,
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/analytics/top-paths",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("top_paths", {
          org_id,
          project_id,
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/analytics/requests-over-time",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("requests_over_time", {
          org_id,
          project_id,
          interval: query.interval || "1h",
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        interval: t.Optional(
          t.Union([
            t.Literal("1m"),
            t.Literal("5m"),
            t.Literal("15m"),
            t.Literal("1h"),
            t.Literal("1d"),
            t.Literal("1w"),
          ])
        ),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/analytics/request-counts-by-period",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("request_counts_by_period", {
          org_id,
          project_id,
          interval: query.interval || "1h",
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        interval: t.Optional(
          t.Union([
            t.Literal("1m"),
            t.Literal("5m"),
            t.Literal("15m"),
            t.Literal("1h"),
            t.Literal("1d"),
            t.Literal("1w"),
          ])
        ),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .get(
    "/requests",
    async ({ org_id, project_id, query }) => {
      try {
        const result = await tinybird.query("ingestions_endpoint", {
          org_id,
          project_id,
          method: query.method,
          status: query.status,
          start_date: query.start_date,
          end_date: query.end_date,
          limit: query.limit || 100,
        });
        return { data: result.data, meta: result.meta };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      authenticate: true,
      query: t.Object({
        method: t.Optional(t.String()),
        status: t.Optional(t.Number()),
        start_date: t.Optional(t.String()),
        end_date: t.Optional(t.String()),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 1000 })),
      }),
    }
  )
  .listen(8000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
