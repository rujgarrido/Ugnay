import pino from 'pino';
import { env } from '../config/env';

/**
 * Structured JSON logging in production (CloudWatch/Render-log friendly),
 * pretty-printed in development for readability.
 */
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
        },
});
