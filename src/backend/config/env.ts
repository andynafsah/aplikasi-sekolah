/**
 * Enterprise Environment Configuration
 * 
 * Provides centralized, type-safe config management for the Enterprise Backend.
 * Includes defaults for sandbox environments and seamless failover to simulated mock states.
 */

import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  
  // Database (Prisma/MySQL)
  DATABASE_URL: z.string().default('mysql://root:secret@localhost:3306/enterprise_db'),
  DATABASE_SSL: z.coerce.boolean().default(false),
  
  // JWT Security
  JWT_SECRET: z.string().default('super-secret-enterprise-jwt-key-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('super-secret-enterprise-refresh-key-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  
  // Cache (Redis)
  REDIS_URL: z.string().default('redis://:secret@localhost:6379/0'),
  REDIS_ENABLE: z.coerce.boolean().default(false), // Disable by default to use high-fidelity Memory Cache in sandbox
  
  // Queue (BullMQ)
  BULLMQ_CONCURRENCY: z.coerce.number().default(5),
  BULLMQ_ENABLE: z.coerce.boolean().default(false),
  
  // Storage (MinIO / Cloudflare R2)
  S3_ENDPOINT: z.string().default('localhost'),
  S3_PORT: z.coerce.number().default(9000),
  S3_ACCESS_KEY: z.string().default('minio-admin'),
  S3_SECRET_KEY: z.string().default('minio-secret'),
  S3_USE_SSL: z.coerce.boolean().default(false),
  S3_BUCKET: z.string().default('enterprise-assets'),
  S3_PROVIDER: z.enum(['minio', 'r2', 's3']).default('minio'),
  
  // Security
  RATE_LIMIT_MAX: z.coerce.number().default(100), // per 1 minute
  CORS_ORIGIN: z.string().default('*'),
});

export type Env = z.infer<typeof EnvSchema>;

let parsedEnv: Env;

try {
  parsedEnv = EnvSchema.parse(process.env);
} catch (error) {
  console.warn('⚠️ Environmental validation warning, using default enterprise configurations.');
  parsedEnv = EnvSchema.parse({});
}

export const env = parsedEnv;
