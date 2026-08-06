export interface QueryResult {
  affectedRows: number;
  insertId?: any;
}

export interface DatabaseMetrics {
  active_connections: number;
  idle_connections: number;
  total_queries_executed: number;
  slow_queries_count: number;
  avg_execution_time_ms: number;
  cache_hits: number;
}

export interface DatabaseProvider {
  id: string;
  name: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<QueryResult>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  testConnection(): Promise<{ success: boolean; message: string; latency_ms: number }>;
  getMetrics(): DatabaseMetrics;
}
