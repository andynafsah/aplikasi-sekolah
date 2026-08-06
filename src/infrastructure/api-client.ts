import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { IApiResponse } from '../application/dto.base';
import { logger } from '../core/logger';

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private tenantId: string | null = null;

  constructor(baseURL: string = '/api/v1') {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 10000, // 10 seconds timeout limit
    });

    this.initializeInterceptors();
  }

  /**
   * Set JWT Authentication token globally for all future client requests
   */
  public setAuthToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Set SaaS Tenant context ID globally for all future client requests
   */
  public setTenantId(tenantId: string | null): void {
    this.tenantId = tenantId;
  }

  private initializeInterceptors(): void {
    // 1. Request Interceptor: Inject credentials & tenancy headers
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        if (this.tenantId) {
          config.headers['X-Tenant-ID'] = this.tenantId;
        }
        return config;
      },
      (error: AxiosError) => {
        logger.error('[ApiClient] Request setup exception', error);
        return Promise.reject(error);
      }
    );

    // 2. Response Interceptor: Unified envelope parser and exception mapping
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<IApiResponse<any>>) => {
        // Axios successfully resolved HTTP 2xx
        const envelope = response.data;
        if (envelope && envelope.success === false) {
          // If server returned success: false despite 2xx status code
          return Promise.reject(new Error(envelope.message || 'API completed with unsuccessful result code.'));
        }
        return response;
      },
      (error: AxiosError<IApiResponse<any>>) => {
        // Handles standard HTTP 4xx, 5xx failures
        const responseData = error.response?.data;
        const statusCode = error.response?.status || 500;
        
        logger.warn(`[ApiClient] Server responded with error [${statusCode}]: ${responseData?.message || error.message}`);

        const clientError = {
          statusCode,
          message: responseData?.message || 'Terjadi gangguan koneksi pada server api.',
          details: responseData?.details || null,
          originalError: error,
        };

        return Promise.reject(clientError);
      }
    );
  }

  /**
   * Safe dynamic HTTP action wrappers
   */
  public async get<T>(url: string, config = {}): Promise<IApiResponse<T>> {
    const res = await this.axiosInstance.get<IApiResponse<T>>(url, config);
    return res.data;
  }

  public async post<T>(url: string, data = {}, config = {}): Promise<IApiResponse<T>> {
    const res = await this.axiosInstance.post<IApiResponse<T>>(url, data, config);
    return res.data;
  }

  public async put<T>(url: string, data = {}, config = {}): Promise<IApiResponse<T>> {
    const res = await this.axiosInstance.put<IApiResponse<T>>(url, data, config);
    return res.data;
  }

  public async delete<T>(url: string, config = {}): Promise<IApiResponse<T>> {
    const res = await this.axiosInstance.delete<IApiResponse<T>>(url, config);
    return res.data;
  }
}

export const api = new ApiClient();
export default api;
