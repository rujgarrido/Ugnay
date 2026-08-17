import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../lib/logger';

/**
 * A small, explicit application error class. Feature services should throw
 * this (or a subclass) instead of generic Error so the handler below can map
 * it to the right HTTP status consistently across every feature module.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Central error-handling middleware. Must be registered LAST in app.ts.
 * Produces a consistent JSON error shape and never leaks stack traces
 * to the client in production.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.flatten(),
      },
    });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    error: {
      message: isProd ? 'Internal server error' : (err as Error)?.message || 'Unknown error',
    },
  });
}
