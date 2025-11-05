import { getDataClient } from './data-client-factory';
import { config } from './config';

export async function handleRoot({ org_id, project_id }: any) {
  return {
    org_id,
    project_id,
    datasource: config.dataSource,
  };
}

export async function handleLogs({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('ingestions_endpoint', {
      org_id,
      project_id,
      limit: query?.limit || 5,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTotalRequests({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('total_requests', {
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
    const client = getDataClient();
    const result = await client.query('error_rate', {
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
    const client = getDataClient();
    const result = await client.query('avg_latency', {
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
    const client = getDataClient();
    const result = await client.query('top_paths', {
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
    const client = getDataClient();
    const result = await client.query('requests_over_time', {
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
    const client = getDataClient();
    const result = await client.query('request_counts_by_period', {
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
    const client = getDataClient();
    const result = await client.query('ingestions_endpoint', {
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
