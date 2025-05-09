import http from 'http';
import { createApp } from './app';
import logger from './utils/logger';
import { config } from './config/env';
import { setupGracefulShutdown } from './utils/graceful-shutdown';

const app = createApp();
const PORT = config.server.port;

const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Server running in ${config.server.environment} mode on port ${PORT}`);
  logger.info(`API documentation available at http://localhost:${PORT}/api-docs`);
});

setupGracefulShutdown(server);