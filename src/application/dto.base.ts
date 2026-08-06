export interface IPaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: any;
  errors?: any;
  details?: any;
  timestamp: string;
}

export abstract class BaseDto {
  /**
   * Optional helper to validate self using a dynamic schema if needed
   */
  abstract validate(): void | Promise<void>;
}
