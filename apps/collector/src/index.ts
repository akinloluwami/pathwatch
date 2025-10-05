import { Elysia } from "elysia";
import { Client } from "pg";
import { z } from "zod";
import axios from "axios";

const TB_URL = process.env.TINYBIRD_URL!;
const TB_TOKEN = process.env.TINYBIRD_TOKEN!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!TB_URL || !TB_TOKEN || !DATABASE_URL) {
  console.log({ TB_URL, TB_TOKEN, DATABASE_URL });
  console.error("Missing environment variables");
}

const db = new Client({
  connectionString: DATABASE_URL,
});

await db.connect();

const EventSchema = z.object({
  api_key: z.string(),
  method: z.string(),
  path: z.string(),
  url: z.string().optional(),
  host: z.string().optional(),
  status: z.number(),
  latency_ms: z.number(),
  req_size: z.number(),
  res_size: z.number(),
  ip: z.string().optional(),
  user_agent: z.string().optional(),
  body: z.any().optional(),
});

const app = new Elysia();

app
  .post("/ingest", async ({ body, set }) => {
    try {
      const parsed = z.array(EventSchema).parse(body);
      const apiKey = parsed[0].api_key;

      const project = await db.query(
        `SELECT id, org_id, log_full_url FROM projects WHERE api_key = $1`,
        [apiKey],
      );
      if (!project.rows.length) {
        set.status = 403;
        return { success: false, error: "Invalid API key" };
      }

      const { id: project_id, org_id, log_full_url } = project.rows[0];

      const enriched = parsed.map((e) => {
        const event = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          org_id: String(org_id),
          project_id: String(project_id),
          method: String(e.method),
          path: String(e.path),
          url: log_full_url ? String(e.url) : null, // 👈 only if enabled
          host: e.host ? String(e.host) : null,
          status: Number(Math.round(e.status)),
          latency_ms: Number(Math.round(e.latency_ms)),
          req_size: Number(Math.round(e.req_size)),
          res_size: Number(Math.round(e.res_size)),
          ip: e.ip ? String(e.ip) : null,
          user_agent: e.user_agent ? String(e.user_agent) : null,
          body: e.body
            ? typeof e.body === "string"
              ? e.body
              : JSON.stringify(e.body)
            : null,
        };
        return event;
      });

      for (const event of enriched) {
        await axios.post(TB_URL, event, {
          headers: {
            Authorization: `Bearer ${TB_TOKEN}`,
            "Content-Type": "application/json",
          },
        });
      }

      return { success: true, count: enriched.length };
    } catch (err: any) {
      console.error("Ingest error", err);
      set.status = 400;
      return { success: false, error: err.message };
    }
  })
  .get("/", () => "Hello Elysia");

app.listen(6000, () => {
  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
  );
});
