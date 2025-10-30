import axios from 'axios';
import { config } from './config';

export async function ingestToCloudflareR2(data: any[]) {
  await axios.post(config.cloudflareR2PipelineUrl, data);
}
