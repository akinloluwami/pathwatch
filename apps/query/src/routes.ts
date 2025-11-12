import { getDataClient } from './data-client-factory';
import { config } from './config';

export async function handleRoot({ org_id, project_id }: any) {
  return {
    org_id,
    project_id,
    datasource: config.dataSource,
  };
}

export async function handleTotalRequests({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('total_requests', {
      org_id,
      project_id,
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

export async function handleErrorRate({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('error_rate', {
      org_id,
      project_id,
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

export async function handleAvgLatency({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('avg_latency', {
      org_id,
      project_id,
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
      offset: query.offset || 0,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Tracing endpoints
export async function handleListTraces({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = {
      project_id,
      limit: query.limit || 100,
      offset: query.offset || 0,
    };

    if (query.org_id) params.org_id = org_id;
    if (query.service_name) params.service_name = query.service_name;
    if (query.status) params.status = query.status;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('list_traces', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleGetTraceDetails({ org_id, project_id, params }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('get_trace_details', {
      project_id,
      trace_id: params.trace_id,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleGetTraceSpans({ org_id, project_id, params }: any) {
  try {
    const client = getDataClient();
    const result = await client.query('get_trace_spans', {
      project_id,
      trace_id: params.trace_id,
    });
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTraceLatencyMetrics({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = { project_id };

    if (query.org_id) params.org_id = org_id;
    if (query.service_name) params.service_name = query.service_name;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('trace_latency_metrics', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTraceErrorRate({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = { project_id };

    if (query.org_id) params.org_id = org_id;
    if (query.service_name) params.service_name = query.service_name;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('trace_error_rate', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTracesOverTime({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = {
      project_id,
      interval: query.interval || '1 hour',
      limit: query.limit || 168,
    };

    if (query.org_id) params.org_id = org_id;
    if (query.service_name) params.service_name = query.service_name;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('traces_over_time', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTopServices({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = {
      project_id,
      limit: query.limit || 20,
    };

    if (query.org_id) params.org_id = org_id;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('top_services', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function handleTopEndpoints({ org_id, project_id, query }: any) {
  try {
    const client = getDataClient();
    const params: any = {
      project_id,
      limit: query.limit || 20,
    };

    if (query.org_id) params.org_id = org_id;
    if (query.service_name) params.service_name = query.service_name;
    if (query.start_time) params.start_time = query.start_time;
    if (query.end_time) params.end_time = query.end_time;

    const result = await client.query('top_endpoints', params);
    return { data: result.data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
