import type { Request, Response } from 'express';

/** Catches any request that didn't match a route. Register just before errorHandler. */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
}
