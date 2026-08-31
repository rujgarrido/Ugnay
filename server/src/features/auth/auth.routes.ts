import {Router} from 'express';
import {AuthController }from './auth.controller';
import { catchAsync } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { registerSchema, loginSchema } from "./auth.schema";


export const authRoutes = (authController: AuthController): Router => {
    const router = Router();

    router.post('/register', validate(registerSchema),catchAsync(authController.register));
    router.post('/login', validate(loginSchema), catchAsync(authController.login));

    return router;
};
