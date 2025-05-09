import winston from 'winston';
import { config } from '../config/env';

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    config.logging.format === 'json' 
      ? winston.format.json() 
      : winston.format.simple()
  ),
  defaultMeta: { service: 'betting-api' },
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;