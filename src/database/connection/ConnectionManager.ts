import { DatabaseProvider } from '../providers/DatabaseProvider';
import { MysqlProvider } from '../mysql/MysqlProvider';

export interface ConnectionConfig {
  id?: string;
  connection_name: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  password_raw: string;
  ssl_mode: 'require' | 'disable' | 'prefer';
  timeout_ms?: number;
  retry_count?: number;
  pool_max_size?: number;
}

export class ConnectionManager {
  private static instance: ConnectionManager;
  private activeProvider: DatabaseProvider;
  private configCache: Map<string, ConnectionConfig> = new Map();

  private constructor() {
    // Initial active provider defaults to the high-performance MySQL/Simulated engine
    this.activeProvider = new MysqlProvider();
  }

  public static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  public getProvider(): DatabaseProvider {
    return this.activeProvider;
  }

  public async setProvider(provider: DatabaseProvider): Promise<void> {
    if (this.activeProvider) {
      await this.activeProvider.disconnect();
    }
    this.activeProvider = provider;
    await this.activeProvider.connect();
  }

  public async registerAndConnect(config: ConnectionConfig): Promise<DatabaseProvider> {
    const id = config.id || `conn-${Date.now()}`;
    this.configCache.set(id, config);

    // Create a new MysqlProvider using the supplied settings
    const newProvider = new MysqlProvider({
      host: config.host,
      port: config.port,
      database: config.database_name,
      user: config.username,
      password: config.password_raw,
      ssl: config.ssl_mode === 'disable' ? undefined : {},
      connectTimeout: config.timeout_ms || 5000
    });

    await newProvider.connect();
    this.activeProvider = newProvider;
    return newProvider;
  }

  public getRegisteredConfigs(): ConnectionConfig[] {
    return Array.from(this.configCache.values());
  }

  public removeConnection(id: string) {
    this.configCache.delete(id);
  }
}
