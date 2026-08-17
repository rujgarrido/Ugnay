import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Reusable request-validation middleware factory.
 * Usage in a feature route file (once features exist):
 *
 *   router.post('/', validate(createTaskSchema), createTaskController);
 *
 * Invalid input is thrown as a ZodError, which the central errorHandler
 * converts into a consistent 400 response — no per-route error handling needed.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}
