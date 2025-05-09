import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import marketRoutes from './routes/market.routes';
import { db } from './db/in-memory-db';
import logger from './utils/logger';
import { config } from './config/env';
import { idempotencyMiddleware } from './middleware/idempotency.middleware';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error processing request: ${err.message}`, { 
    url: req.url,
    method: req.method,
    error: err.stack,
    requestId: req.headers['x-request-id'] || 'unknown'
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-Id', requestId);
  next();
};

export function createApp(): Express {
  const app = express();

  app.use(requestIdMiddleware);


  app.use(cors({
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id']
  }));
  
  app.use(helmet());
  app.use(express.json());

  if (config.throttling.enabled) {
    app.use('/api/', rateLimit({
      windowMs: config.throttling.window * 1000,
      max: config.throttling.limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' }
    }));
  }

  app.use(idempotencyMiddleware);

  db.seedData();

  app.use(`/api/${config.server.apiVersion}/markets`, marketRoutes);

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Betting API',
        version: config.server.apiVersion,
        description: 'Sports betting API docs',
      },
    },
    apis: ['./src/routes/*.ts'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  //TODO: Swagger is currently breaking my build. I will uncomment this when i've found the issue.
  //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
      status: 'ok',
      version: config.server.apiVersion,
      environment: config.server.environment
    });
  });

  app.use(errorHandler);

  return app;
}