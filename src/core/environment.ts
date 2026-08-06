import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().url().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(8).default('super-secret-jwt-key-for-erp-platform-2026'),
  DATABASE_URL: z.string().optional().default('mysql://root:password@localhost:3306/erp_db'),
  CACHE_TTL: z.coerce.number().default(3600),
});

export type EnvConfig = z.infer<typeof envSchema>;

class Environment {
  private config: EnvConfig;

  constructor() {
    this.config = this.loadEnv();
  }

  private loadEnv(): EnvConfig {
    const processEnv = typeof process !== 'undefined' ? process.env : {};
    
    const parsed = envSchema.safeParse(processEnv);

    if (!parsed.success) {
      console.warn('⚠️ Invalid or missing environment variables detected. Using default fallback configurations.');
      const fallback = envSchema.safeParse({});
      if (fallback.success) {
        return fallback.data;
      }
      return {
        NODE_ENV: 'development',
        API_URL: 'http://localhost:3000',
        JWT_SECRET: 'super-secret-jwt-key-for-erp-platform-2026',
        DATABASE_URL: 'mysql://root:password@localhost:3306/erp_db',
        CACHE_TTL: 3600,
      };
    }

    return parsed.data;
  }

  public get<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
    return this.config[key];
  }

  public getAll(): EnvConfig {
    return { ...this.config };
  }

  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }
}

export const env = new Environment();
export default env;
