import { Request, Response, NextFunction } from 'express';

type AsyncRouteHandler = (req: Request, res: Response) => Promise<Response>;

export function catchAsync (handler: AsyncRouteHandler) {
    return (req: Request, res: Response, next: NextFunction): void => {
    
        handler(req, res)
    .catch((error) => {
        next(error);

    });
    }
}