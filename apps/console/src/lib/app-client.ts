import axios from 'axios';

const apiClient = axios.create({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CreateProjectParams {
  name: string;
  org_id: string;
}

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  org_id: string;
  api_key: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const appClient = {
  projects: {
    create: async (params: CreateProjectParams): Promise<ApiResponse<ProjectData>> => {
      try {
        const response = await apiClient.post<ApiResponse<ProjectData>>('/api/projects', params);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    list: async (orgSlug: string): Promise<ApiResponse<ProjectData[]>> => {
      try {
        const response = await apiClient.get<ApiResponse<ProjectData[]>>('/api/projects', {
          params: { org_slug: orgSlug },
        });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          return error.response.data;
        }
        return { error: 'An unexpected error occurred' };
      }
    },

    get: async (slug: string): Promise<ApiResponse<ProjectData>> => {
      try {
        const response = await apiClient.get<ApiResponse<ProjectData>>('/api/projects', {
          params: { slug },
        });
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
