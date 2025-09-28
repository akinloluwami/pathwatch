import { Elysia, t } from "elysia";
import { Client } from "pg";

const TB_TOKEN = process.env.TINYBIRD_TOKEN!;
const DATABASE_URL = process.env.DATABASE_URL!;

if (!TB_TOKEN || !DATABASE_URL) {
  console.log({ TB_TOKEN, DATABASE_URL });
  console.error("Missing environment variables");
}

const db = new Client({
  connectionString: DATABASE_URL,
});

await db.connect();

async function verifyApiKey(token: string) {
  const res = await db.query(
    "SELECT org_id, project_id FROM api_keys WHERE token = $1",
    [token],
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
        return { error: "Unauthorized" };
      }

      const token = authHeader.split(" ")[1];
      const apiKey = await verifyApiKey(token);

      if (!apiKey) {
        set.status = 401;
        return { error: "Unauthorized" };
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
    },
  )
  .listen(7000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
