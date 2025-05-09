import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
  cache: {
    idempotencyExpiration: parseInt(process.env.IDEMPOTENCY_EXPIRATION || '3600', 10), 
  },
  throttling: {
    enabled: process.env.THROTTLING_ENABLED === 'true',
    limit: parseInt(process.env.THROTTLING_LIMIT || '100', 10),
    window: parseInt(process.env.THROTTLING_WINDOW || '60', 10), 
  },
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
  },
};