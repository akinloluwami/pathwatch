import { Elysia } from "elysia";
import { Client } from "pg";
import { z } from "zod";
import axios from "axios";

const TB_URL = process.env.TINYBIRD_URL!;
const TB_TOKEN = process.env.TINYBIRD_TOKEN!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!TB_URL || !TB_TOKEN || !DATABASE_URL) {
  throw new Error("Missing environment variables");
}

const db = new Client({
  connectionString: DATABASE_URL,
});

const EventSchema = z.object({
  api_key: z.string(),
  method: z.string(),
  path: z.string(),
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
        `SELECT id, org_id FROM projects WHERE api_key = $1`,
        [apiKey],
      );
      if (!project.rows.length) {
        set.status = 403;
        return { success: false, error: "Invalid API key" };
      }

      const { id: project_id, org_id } = project.rows[0];

      const enriched = parsed.map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        ts: new Date().toISOString(),
        org_id,
        project_id,
        body: e.body ? JSON.stringify(e.body) : null,
      }));

      await axios.post(TB_URL, enriched, {
        headers: {
          Authorization: `Bearer ${TB_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

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
