import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const TB_TOKEN = process.env.TB_TOKEN!;
const TB_API = "https://api.europe-west2.gcp.tinybird.co/v0";

async function createOrUpdateDatasource(name: string, content: string) {
  const res = await fetch(`${TB_API}/datasources`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TB_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ name, sql: content }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ Failed to deploy datasource ${name}`, data);
    return;
  }
  console.log(`✅ Deployed datasource "${name}"`, data);
}

async function createOrUpdatePipe(name: string, sql: string) {
  const res = await fetch(`${TB_API}/pipes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TB_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ name, sql }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error(`❌ Failed to deploy pipe ${name}`, data);
    return;
  }
  console.log(`✅ Deployed pipe "${name}"`, data);
}

async function main() {
  console.log("🚀 Starting Tinybird deployment...");
  const baseDir = path.join(__dirname, "..");

  // Deploy datasources
  const datasourcesDir = path.join(baseDir, "datasources");
  if (fs.existsSync(datasourcesDir)) {
    const datasourceFiles = fs
      .readdirSync(datasourcesDir)
      .filter((f) => f.endsWith(".datasource"));

    for (const file of datasourceFiles) {
      const name = path.basename(file, ".datasource");
      const content = fs.readFileSync(path.join(datasourcesDir, file), "utf8");
      await createOrUpdateDatasource(name, content);
    }
  }

  // Deploy pipes
  const pipesDir = path.join(baseDir, "pipes");
  if (fs.existsSync(pipesDir)) {
    const pipeFiles = fs
      .readdirSync(pipesDir)
      .filter((f) => f.endsWith(".sql"));

    for (const file of pipeFiles) {
      const name = path.basename(file, ".sql");
      const sql = fs.readFileSync(path.join(pipesDir, file), "utf8");
      await createOrUpdatePipe(name, sql);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
