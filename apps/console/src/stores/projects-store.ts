import { create } from 'zustand';
import { appClient } from '@/lib/app-client';

export type ProjectSummary = {
  id: string;
  slug: string;
  name: string;
  org_id: string;
  api_key: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  metrics?: {
    errors: number;
    p99: string;
  };
};

interface ProjectsState {
  projects: ProjectSummary[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (orgSlug: string) => Promise<void>;
  getProjectBySlug: (slug: string) => ProjectSummary | undefined;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (orgSlug: string) => {
    set({ isLoading: true, error: null });
    const result = await appClient.projects.list(orgSlug);

    if (result.error) {
      set({ error: result.error, isLoading: false });
      return;
    }

    set({ projects: result.data || [], isLoading: false });
  },

  getProjectBySlug: (slug: string) => {
    return get().projects.find((project) => project.slug === slug);
  },
}));
