
import { generateRefreshToken, hashRefreshToken } from '../../lib/crypto.util';
import { AppError } from '../../middleware/errorHandler';
import { AuthRepository } from './auth.repository';
import { env } from '../../config/env';
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';
import { REFRESH_TOKEN_TTL_MS } from '../../config/constants';

export class AuthService {

    constructor (private readonly authRepository: AuthRepository){}

     register = async(data: { firstName: string; lastName: string; email: string; password: string , confirmPassword: string }) => {

        
        // check if the user already exists
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (existingUser) {
            throw new AppError("User already exists",409);
        }
        
        const hashedPassword = await bcrypt.hash(data.password, 10); 

        // Proceed with user registration
        const newUser = await this.authRepository.createUser({ 
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            passwordHash: hashedPassword
         });

         return {
            id: newUser.id,
            firstName:newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,}; // Return the newly created user object (excluding the password).

        

    }

    login = async(data: { email: string; password: string }) => {

        // check if the user exists
        const existingUser = await this.authRepository.findUserByEmail(data.email);
        if (!existingUser) {
            throw new AppError("Invalid email or password",401);
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(data.password, existingUser.passwordHash);
        if (!isPasswordValid) {
            throw new AppError("Invalid email or password",401);
        }

        // If login is successful, you can return user details or a access token and refresh token
        const payload = {id:existingUser.id};

        

        // Generate access token a
        const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
        

        // Generate refresh token
        const refreshtoken =  generateRefreshToken();

        // Hash the refresh token before storing it in the database
        const hashedRefreshToken = hashRefreshToken(refreshtoken);

        // Store the hashed refresh token in the database with an expiration date (7 days from now)
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        await this.authRepository.createRefreshToken({
            userId: payload.id,
            tokenHash: hashedRefreshToken,
            expiresAt: expiresAt,
        });
        
        return{ accessToken, refreshToken: refreshtoken } 
    }
    



}
