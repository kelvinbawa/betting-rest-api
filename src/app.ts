// src/app.ts
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
// import marketRoutes from './routes/market.routes';
// import { db } from './db/in-memory-db';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());

  // Seed some initial data
  //db.seedData();

  // API Routes
  //app.use('/api/markets', marketRoutes);

  // Swagger documentation
  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Sports Betting API',
        version: '1.0.0',
        description: 'A simple sports betting API for Podium technical assessment',
      },
    },
    apis: ['./src/routes/*.ts'],
  };

  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  //app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}

