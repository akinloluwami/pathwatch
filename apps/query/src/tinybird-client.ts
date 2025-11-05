import axios from 'axios';
import { DataClient } from './data-client-factory';

interface TinybirdResponse<T = any> {
  data: T[];
  meta: Array<{ name: string; type: string }>;
  rows: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

export class TinybirdClient implements DataClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string, baseUrl = 'https://api.europe-west2.gcp.tinybird.co') {
    this.token = token;
    this.baseUrl = baseUrl;
  }

  async query<T = any>(pipeName: string, params: Record<string, any> = {}): Promise<{ data: T[] }> {
    const url = `${this.baseUrl}/v0/pipes/${pipeName}.json`;

    try {
      const response = await axios.get<TinybirdResponse<T>>(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params,
      });

      return { data: response.data.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Tinybird API error: ${error.response?.data?.error || error.message}`);
      }
      throw error;
    }
  }
}
