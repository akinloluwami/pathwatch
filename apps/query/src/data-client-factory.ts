import { TinybirdClient } from './tinybird-client';
import { CloudflareClient } from './cloudflare-client';
import { config, DataSource } from './config';

export interface DataClient {
  query<T = any>(queryName: string, params?: Record<string, any>): Promise<{ data: T[] }>;
}

class DataClientFactory {
  private static instance: DataClient | null = null;

  static getClient(): DataClient {
    if (!this.instance) {
      this.instance = this.createClient(config.dataSource);
    }
    return this.instance;
  }

  private static createClient(source: DataSource): DataClient {
    switch (source) {
      case 'tinybird':
        return new TinybirdClient(config.tbToken);
      case 'cloudflare':
        return new CloudflareClient(config.r2ApiToken, config.r2WarehouseName);
      default:
        throw new Error(`Unknown data source: ${source}`);
    }
  }

  static reset(): void {
    this.instance = null;
  }
}

export const getDataClient = (): DataClient => {
  return DataClientFactory.getClient();
};
