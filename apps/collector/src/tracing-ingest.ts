import axios from 'axios';
import { config } from './config';

// Extract base Tinybird API URL by removing the datasource-specific query param
function getTinybirdBaseUrl(): string {
  const url = new URL(config.tinybirdUrl);
  return `${url.origin}${url.pathname}`;
}

export async function ingestSpansToTinybird(spans: any[]) {
  if (!spans.length) return;

  const baseUrl = getTinybirdBaseUrl();
  const url = `${baseUrl}?name=spans`;

  // Convert to NDJSON format (newline-delimited JSON)
  const ndjson = spans.map((span) => JSON.stringify(span)).join('\n');

  try {
    const response = await axios.post(url, ndjson, {
      headers: {
        Authorization: `Bearer ${config.tinybirdToken}`,
        'Content-Type': 'application/x-ndjson',
      },
    });

    if (response.data.quarantined_rows > 0) {
      console.warn(`⚠️  ${response.data.quarantined_rows} spans quarantined`);
    }
  } catch (error: any) {
    console.error('Spans ingestion error:', error.response?.data || error.message);
    throw error;
  }
}
export async function ingestTracesToTinybird(traces: any[]) {
  if (!traces.length) return;

  const baseUrl = getTinybirdBaseUrl();
  const url = `${baseUrl}?name=traces`;

  // Convert to NDJSON format (newline-delimited JSON)
  const ndjson = traces.map((trace) => JSON.stringify(trace)).join('\n');

  await axios.post(url, ndjson, {
    headers: {
      Authorization: `Bearer ${config.tinybirdToken}`,
      'Content-Type': 'application/x-ndjson',
    },
  });
}
