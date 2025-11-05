import { config } from './config';
import { r2SqlQueries } from './queries/r2-queries';
import { DataClient } from './data-client-factory';

export class CloudflareClient implements DataClient {
  private apiToken: string;
  private warehouseName: string;

  constructor(apiToken: string, warehouseName: string) {
    this.apiToken = apiToken;
    this.warehouseName = warehouseName;
  }

  private async executeQuery(sql: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      require('child_process').exec(
        `npx wrangler r2 sql query "${this.warehouseName}" "${sql}"`,
        {
          env: { ...process.env, WRANGLER_R2_SQL_AUTH_TOKEN: this.apiToken },
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

  async query<T = any>(
    queryName: string,
    params: Record<string, any> = {}
  ): Promise<{ data: T[] }> {
    const queryBuilder = r2SqlQueries[queryName];

    if (!queryBuilder) {
      throw new Error(`Query '${queryName}' not found`);
    }

    const sql = queryBuilder(params);
    const data = await this.executeQuery(sql);

    return { data };
  }
}
