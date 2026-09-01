import { Request, Response } from 'express';
import {  AuthService} from './auth.service';
import { REFRESH_TOKEN_TTL_MS } from '../../config/constants';
import { env } from '../../config/env';

export class AuthController {
    
    constructor(private readonly authService: AuthService) {}


// Controller function for user registration
  register = async (req: Request, res: Response) => {
    
    const data = req.body; 

    // Call the authService to handle the registration logic
    await this.authService.register(data);

    return res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      }
    });
  }
     

  // Controller function for user login
  login = async (req: Request, res: Response) => {

    const data = req.body;

    // Call the authService to handle the login logic
    const { accessToken, refreshToken } = await this.authService.login(data);  

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Adjust based on your requirements
      maxAge: REFRESH_TOKEN_TTL_MS, // 7 days in milliseconds
    });

    return res.status(200).json({
      status: 200,
      message: "Logged in successfully",
      data: { accessToken }
    })
  };

  // Controller function for user logout
  logout = async (req: Request, res: Response) => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(200).json({
        status: 200,
        message: "User is already logged out"
      });
    }
    
    await this.authService.logout(refreshToken);
    res.clearCookie('refreshToken');

    return res.status(200).json({
      status: 200,
      message: "Logged out successfully"
    });
  };
  
  // Controller function for refreshing tokens
  refresh = async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken } = await this.authService.refreshTokens(rawRefreshToken);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: REFRESH_TOKEN_TTL_MS,
  });

  return res.status(200).json({
    status: 200,
    message: 'Token refreshed',
    data: { accessToken },
    });
  }
}

