import http from 'http';
import logger from './logger';
export const setupGracefulShutdown = (server: http.Server): void => {
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}, gracefully shutting down...`);
      
      server.close(() => {
        logger.info('HTTP server closed.');
        
        logger.info('All connections closed.');
        process.exit(0);
      });
      
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };
    
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  };