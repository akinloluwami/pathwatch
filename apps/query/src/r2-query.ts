import { config } from './config';

export async function r2SqlQuery(warehouse: string, sql: string, apiToken: string) {
  return new Promise((resolve, reject) => {
    require('child_process').exec(
      `npx wrangler r2 sql query "${warehouse}" "${sql}"`,
      {
        env: { ...process.env, WRANGLER_R2_SQL_AUTH_TOKEN: apiToken },
      },
      (err: any, stdout: string, stderr: string) => {
        if (err) return reject(err);

        const lines = stdout.split('\n');
        const filteredLines = lines.filter((line) => {
          const trimmed = line.trim();
          return (
            trimmed.startsWith('│') &&
            !trimmed.startsWith('├') &&
            !trimmed.startsWith('┌') &&
            !trimmed.startsWith('└') &&
            trimmed.length > 1
          );
        });

        if (filteredLines.length < 2) {
          return resolve([]);
        }

        const headerLine = filteredLines[0];
        const dataLines = filteredLines.slice(1);

        const headers = headerLine
          .split('│')
          .map((h) => h.trim())
          .filter(Boolean);

        const results = dataLines.map((line) => {
          const cells = line
            .split('│')
            .map((c) => c.trim())
            .filter(Boolean);

          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = cells[index] || null;
          });
          return row;
        });

        resolve(results);
      }
    );
  });
}

export async function queryLogs() {
  return r2SqlQuery(
    config.r2WarehouseName,
    'SELECT * FROM default.pw_logs LIMIT 5;',
    config.r2ApiToken
  );
}
