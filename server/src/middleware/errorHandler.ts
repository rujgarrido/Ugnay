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
  public readonly data?: unknown;

  constructor(message: string, statusCode = 500, data?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Central error-handling middleware. Must be registered LAST in app.ts.
 * Produces a consistent JSON error shape and never leaks stack traces
 * to the client in production.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: 'Validation error',
      data: err.flatten(),
    });
    return;
  }
  // Handle custom application errors
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, err.message);
    }
    res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
      data: err.data ?? {},
    });
    return;
  }

  // Handle generic errors
  logger.error({ err }, 'Unhandled error');
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).json({
    status: 500,
    message: isProd ? 'Internal server error' : (err as Error)?.message || 'Unknown error',
    data: {},
  });
}
