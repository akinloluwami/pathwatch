import { TinybirdClient } from './tinybird-client';
import { config } from './config';

export interface DataClient {
  query<T = any>(queryName: string, params?: Record<string, any>): Promise<{ data: T[] }>;
}

class DataClientFactory {
  private static instance: DataClient | null = null;

  static getClient(): DataClient {
    if (!this.instance) {
      this.instance = new TinybirdClient(config.tbToken);
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

export const getDataClient = (): DataClient => {
  return DataClientFactory.getClient();
};
