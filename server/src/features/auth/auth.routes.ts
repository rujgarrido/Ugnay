import {Router} from 'express';
import {AuthController }from './auth.controller';
import { catchAsync } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { loginRateLimiter, apiRateLimiter, registerRateLimiter } from '../../middleware/rateLimiter';
import { registerSchema, loginSchema } from "./auth.schema";


export const authRoutes = (authController: AuthController): Router => {
    const router = Router();
    // apply middlewares to authentication routes
    router.post('/register', apiRateLimiter, validate(registerSchema), catchAsync(authController.register));
    router.post('/login', loginRateLimiter, validate(loginSchema), catchAsync(authController.login));
    router.post('/register', registerRateLimiter, validate(registerSchema), catchAsync(authController.register));

    return router;
};
