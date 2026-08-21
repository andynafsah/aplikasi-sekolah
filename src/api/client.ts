/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

// Create central API client
const apiClient = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto-inject JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const previewRole = localStorage.getItem('erp_preview_role');
    if (previewRole) {
      config.headers['X-Preview-Role'] = previewRole;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Catch token expirations and handle rate limiting (429) retries
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const config = error.config;
    if (error.response?.status === 429 && config) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 5) {
        const delay = Math.pow(2, config._retryCount - 1) * 500; // 500ms, 1000ms, 2000ms, 4000ms, 8000ms
        console.warn(`API rate limited (429). Retrying request (attempt ${config._retryCount}/5) in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(config);
      }
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('erp_token');
      localStorage.removeItem('erp_user');
      localStorage.removeItem('erp_tenant');
      
      // Force page refresh to login if on protected routes
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
