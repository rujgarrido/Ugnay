import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

export function createApp(): Express {
  const app = express();
  // helmet and cors should be registered before any other middleware to ensure security and cross-origin requests are handled properly
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  //
  app.use(express.json());
  //strip pino-http headers to avoid logging sensitive information
  app.use(pinoHttp({ logger, serializers: {
    req: (req) => ({ method: req.method, url: req.url }), // strip headers
    res: (res) => ({ statusCode: res.statusCode }),
  },
 }));

  // Health check — used for local verification and platform (Render) health probes.
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Feature routers are mounted here as they're built, e.g.:
  // app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1/projects', projectsRouter);
  const apiRouter = express.Router();
  apiRouter.get('/', (_req, res) => {
    res.json({ message: 'Ugnay API v1 — no feature routes registered yet' });
  });
  app.use('/api/v1', apiRouter);

  // Must be registered last, in this order.
  // 
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
