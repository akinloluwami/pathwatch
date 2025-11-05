import axios from 'axios';

const queryClient = axios.create({
  baseURL: import.meta.env.VITE_QUERY_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface QueryParams {
  org_id: string;
  project_id: string;
  limit?: number;
}

interface IntervalQueryParams extends QueryParams {
  interval?: string;
}

interface RequestsQueryParams extends QueryParams {
  method?: string;
  status?: number;
  start_date?: string;
  end_date?: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const query = {
  setApiKey: (apiKey: string) => {
    queryClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  },

  analytics: {
    totalRequests: async (params: QueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/total-requests', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    errorRate: async (params: QueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/error-rate', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    avgLatency: async (params: QueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/avg-latency', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    topPaths: async (params: QueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/top-paths', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    requestsOverTime: async (params: IntervalQueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/requests-over-time', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    requestCountsByPeriod: async (params: IntervalQueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/analytics/request-counts-by-period', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },
  },

  requests: {
    list: async (params: RequestsQueryParams): Promise<ApiResponse<any>> => {
      try {
        const response = await queryClient.get('/requests', { params });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },
  },
};
