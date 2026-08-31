import type { Request, Response } from 'express';

/** Catches any request that didn't match a route. Register just before errorHandler. */
export function notFound(req: Request, res: Response): void {
  res.status(404).json({
   status: 400,
    message: 'Not found',
  });
}
