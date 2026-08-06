import axios, { AxiosInstance } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Axios Client Configuration with Interceptors, Retry, and Token Refresh ---

const API_URL = '/api';

export const biAxios: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
biAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.url = config.url ? `${config.url}${config.url.includes('?') ? '&' : '?'}token=${token}` : `?token=${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Retry & Mock Refresh Token logic
let isRefreshing = false;
biAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    
    // Simple retry mechanism for transient network or 503 errors (up to 2 retries)
    if (originalRequest && error && (error.code === 'ECONNABORTED' || error.response?.status >= 500) && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;
      return biAxios(originalRequest);
    } else if (originalRequest?._retryCount && originalRequest._retryCount < 2) {
      originalRequest._retryCount++;
      return biAxios(originalRequest);
    }

    // Refresh Token mock handler for 401 Unauthorized errors
    if (originalRequest && error?.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const token = localStorage.getItem('token');
        if (token) {
          isRefreshing = false;
          return biAxios(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// --- TanStack Query Custom Hooks for Enterprise DW & BI ---

// 1. Executive Cockpit Hook
export function useExecutiveCockpitQuery() {
  return useQuery({
    queryKey: ['executiveCockpit'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'executiveCockpit' });
      return response.data.data;
    },
    refetchInterval: 30000, // Background auto-refresh every 30 seconds
  });
}

// 2. ETL Jobs Status Hook
export function useEtlJobsQuery() {
  return useQuery({
    queryKey: ['etlJobs'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'etlStatus' });
      return response.data.data;
    },
  });
}

// 3. ETL Run Mutation Hook
export function useEtlRunMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await biAxios.post('', { action: 'etlRun', job_id: jobId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['etlJobs'] });
      queryClient.invalidateQueries({ queryKey: ['etlHistory'] });
      queryClient.invalidateQueries({ queryKey: ['executiveCockpit'] });
    },
  });
}

// 4. ETL History Hook
export function useEtlHistoryQuery() {
  return useQuery({
    queryKey: ['etlHistory'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'etlHistory' });
      return response.data.data;
    },
  });
}

// 5. Data Mart Status Hook
export function useDataMartsQuery() {
  return useQuery({
    queryKey: ['dataMarts'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'dataMartList' });
      return response.data.data;
    },
  });
}

// 6. Data Mart Refresh Mutation Hook
export function useDataMartRefreshMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (martId: string) => {
      const response = await biAxios.post('', { action: 'dataMartRefresh', mart_id: martId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataMarts'] });
      queryClient.invalidateQueries({ queryKey: ['executiveCockpit'] });
    },
  });
}

// 7. Forecasts List Hook
export function useForecastsQuery() {
  return useQuery({
    queryKey: ['forecasts'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'forecastList' });
      return response.data.data;
    },
  });
}

// 8. Forecast Generation Mutation Hook
export function useForecastGenerateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: string) => {
      const response = await biAxios.post('', { action: 'forecastGenerate', category });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    },
  });
}

// 9. Predictions Hook (Student Dropout risk model, failure projections)
export function usePredictionsQuery() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'predictionGenerate' });
      return response.data.data;
    },
  });
}

// 10. AI Recommendations Hook
export function useAiRecommendationsQuery() {
  return useQuery({
    queryKey: ['aiRecommendations'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'aiRecommendation' });
      return response.data.data;
    },
  });
}

// 11. KPI Snapshots Hook
export function useKpiSnapshotsQuery() {
  return useQuery({
    queryKey: ['kpiSnapshots'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'kpiSnapshot' });
      return response.data.data;
    },
  });
}

// 12. Data Quality Checks Hook
export function useQualityChecksQuery() {
  return useQuery({
    queryKey: ['qualityChecks'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'qualityCheck' });
      return response.data.data;
    },
  });
}

// 13. Metadata Catalog Hook
export function useMetadataCatalogQuery() {
  return useQuery({
    queryKey: ['metadataCatalog'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'metadataCatalog' });
      return response.data.data;
    },
  });
}

// 14. Dashboard Shares Hook
export function useDashboardSharesQuery() {
  return useQuery({
    queryKey: ['dashboardShares'],
    queryFn: async () => {
      const response = await biAxios.post('', { action: 'dashboardList' });
      return response.data.data.shares || [];
    },
  });
}

// 15. Create Dashboard Share Mutation Hook
export function useCreateDashboardShareMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title: string; expiration_date?: string; access_level?: string }) => {
      const response = await biAxios.post('', { action: 'dashboardShare', ...payload });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardShares'] });
    },
  });
}
