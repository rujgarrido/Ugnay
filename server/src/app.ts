import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler } from './middleware/errorHandler';
import { routesNotFound } from './middleware/routesNotFound';
import { authRoutes } from './features/auth/auth.routes';
import { AuthController } from './features/auth/auth.controller';
import { AuthService } from './features/auth/auth.service';
import { AuthRepository } from './features/auth/auth.repository';
export function createApp(): Express {
  const app = express();
  
  // helmet and cors should be registered before any other middleware to ensure security and cross-origin requests are handled properly
  app.use(helmet());
  
  // CORS configuration to allow requests from the specified origin and include credentials (cookies, authorization headers, etc.)
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  
  // Middleware to parse JSON request bodies
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

  // Initialize the AuthController with its dependencies
  const authController = new AuthController(new AuthService(new AuthRepository()));


  // Feature routers are mounted here as they're built, e.g.:
  // app.use('/api/v1/auth', authRouter);
  const apiRouter = express.Router();
  apiRouter.get('/', (_req, res) => {
    res.json({ message: 'Ugnay API v1 — no feature routes registered yet' });
  });
  app.use('/api/v1', apiRouter);

  // Authentication Routes
  app.use('/api/v1/auth', authRoutes(authController));

console.log('Auth routes registered at /api/v1/auth');

  // 404 handler for unmatched routes
  app.use(routesNotFound);
  // Central error handler for all errors thrown in the application
  app.use(errorHandler);

  return app;
}
