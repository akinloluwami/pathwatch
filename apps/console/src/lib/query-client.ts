import axios from 'axios';

const queryClient = axios.create({
  baseURL: import.meta.env.VITE_QUERY_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface QueryParams {
  limit?: number;
  start_date?: string;
  end_date?: string;
}

interface IntervalQueryParams extends QueryParams {
  interval?: string;
}

interface RequestsQueryParams extends QueryParams {
  method?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
  offset?: number;
}

interface TracingQueryParams extends QueryParams {
  status?: string;
  service_name?: string;
  min_duration?: number;
  max_duration?: number;
  has_error?: boolean;
  offset?: number;
}

interface TracingMetricsParams extends QueryParams {
  interval?: string;
  service_name?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to handle API calls with consistent error handling
async function apiCall<T = any>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  options?: { params?: any; data?: any }
): Promise<ApiResponse<T>> {
  try {
    const response = await queryClient[method](
      url,
      options?.params ? { params: options.params } : options?.data
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
    return { error: 'An unexpected error occurred' };
  }
}

export const query = {
  setApiKey: (apiKey: string) => {
    queryClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  },

  analytics: {
    totalRequests: async (params: QueryParams) =>
      apiCall('get', '/analytics/total-requests', { params }),

    errorRate: async (params: QueryParams) => apiCall('get', '/analytics/error-rate', { params }),

    avgLatency: async (params: QueryParams) => apiCall('get', '/analytics/avg-latency', { params }),

    topPaths: async (params: QueryParams) => apiCall('get', '/analytics/top-paths', { params }),

    requestsOverTime: async (params: IntervalQueryParams) =>
      apiCall('get', '/analytics/requests-over-time', { params }),

    requestCountsByPeriod: async (params: IntervalQueryParams) =>
      apiCall('get', '/analytics/request-counts-by-period', { params }),
  },

  requests: {
    list: async (params: RequestsQueryParams) => apiCall('get', '/requests', { params }),
  },

  tracing: {
    listTraces: async (params: TracingQueryParams) => apiCall('get', '/tracing/traces', { params }),

    getTraceDetails: async (traceId: string) => apiCall('get', `/tracing/traces/${traceId}`),

    getTraceSpans: async (traceId: string) => apiCall('get', `/tracing/traces/${traceId}/spans`),

    metrics: {
      latency: async (params: TracingMetricsParams) =>
        apiCall('get', '/tracing/metrics/latency', { params }),

      errorRate: async (params: TracingMetricsParams) =>
        apiCall('get', '/tracing/metrics/error-rate', { params }),

      overTime: async (params: TracingMetricsParams) =>
        apiCall('get', '/tracing/metrics/over-time', { params }),
    },

    topServices: async (params: QueryParams) => apiCall('get', '/tracing/top-services', { params }),

    topEndpoints: async (params: QueryParams) =>
      apiCall('get', '/tracing/top-endpoints', { params }),
  },
};
