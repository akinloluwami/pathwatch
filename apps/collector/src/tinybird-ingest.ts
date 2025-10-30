import axios from 'axios';
import { config } from './config';

export async function ingestToTinybird(event: any) {
  await axios.post(config.tinybirdUrl, event, {
    headers: {
      Authorization: `Bearer ${config.tinybirdToken}`,
      'Content-Type': 'application/json',
    },
  });
}
