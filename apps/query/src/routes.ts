import { TinybirdClient } from './tinybird-client';
import { queryLogs } from './r2-query';
import { config } from './config';

const tinybird = new TinybirdClient(config.tbToken);

export async function handleRoot({ org_id, project_id }: any) {
  return { org_id, project_id };
}

export async function handleLogs() {
  try {
    const result = await queryLogs();
    return result;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTotalRequests({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('total_requests', {
      org_id,
      project_id,
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleErrorRate({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('error_rate', {
      org_id,
      project_id,
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleAvgLatency({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('avg_latency', {
      org_id,
      project_id,
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTopPaths({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('top_paths', {
      org_id,
      project_id,
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleRequestsOverTime({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('requests_over_time', {
      org_id,
      project_id,
      interval: query.interval || '1h',
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleRequestCountsByPeriod({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('request_counts_by_period', {
      org_id,
      project_id,
      interval: query.interval || '1h',
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleRequests({ org_id, project_id, query }: any) {
  try {
    const result = await tinybird.query('ingestions_endpoint', {
      org_id,
      project_id,
      method: query.method,
      status: query.status,
      start_date: query.start_date,
      end_date: query.end_date,
      limit: query.limit || 100,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
