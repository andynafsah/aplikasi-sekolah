import { env } from '../core/environment';

/**
 * System-wide structural settings and business metadata configuration
 */
export const AppConfig = {
  // Application identity settings
  app: {
    name: 'Enterprise ERP Pesantren',
    version: '3.0.0',
    build: '2026.07.07',
    environment: env.get('NODE_ENV'),
    apiUrl: env.get('API_URL'),
  },

  // Multi-tenancy SaaS Tier Limits & Plans
  saas: {
    plans: {
      TRIAL: {
        maxStudents: 100,
        maxTeachers: 10,
        maxStorageMb: 1024, // 1 GB
        features: ['academic', 'attendance'],
      },
      GROWTH: {
        maxStudents: 500,
        maxTeachers: 50,
        maxStorageMb: 10240, // 10 GB
        features: ['academic', 'attendance', 'finance', 'ppdb'],
      },
      ENTERPRISE: {
        maxStudents: 10000,
        maxTeachers: 1000,
        maxStorageMb: 102400, // 100 GB
        features: ['academic', 'attendance', 'finance', 'ppdb', 'boarding', 'ai_copilot'],
      }
    }
  },

  // Security policy constraints
  security: {
    bcryptSaltRounds: 10,
    accessTokenExpirySeconds: 3600, // 1 hour
    refreshTokenExpirySeconds: 7 * 86400, // 7 days
    jwtSecretHint: env.get('JWT_SECRET').substring(0, 8) + '***',
  },

  // System Caching TTL
  cache: {
    ttlSeconds: env.get('CACHE_TTL'),
  },

  // Feature Toggles based on Environment
  features: {
    enableDevTools: env.isDevelopment(),
    enableTelemetry: env.isProduction(),
    enableOfflineSync: true,
  }
};

export default AppConfig;
