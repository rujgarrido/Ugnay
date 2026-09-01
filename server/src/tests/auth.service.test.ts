/**
 * Unit tests for AuthService.
 *
 * These are UNIT tests, not integration tests: AuthRepository, bcrypt, and
 * the jwt.util helpers are all FAKED ("mocked"). No real database, no real
 * hashing, no real JWT signing happens here. We're only testing
 * AuthService's own logic: does it call the right things, in the right
 * order, and throw/return the right values for each scenario?
 *
 * This works because AuthService receives its repository via constructor
 * injection (`new AuthService(fakeRepository)`) instead of importing a real
 * one directly.
 */

import { AuthService } from '../features/auth/auth.service';
import { AuthRepository } from '../features/auth/auth.repository';
import bcrypt from 'bcrypt';
import {
  generateRefreshToken,
  hashRefreshToken,
  generateAccessToken,
} from '../lib/jwt.util';

// Tell Jest to replace these modules with auto-generated fakes.
// Every exported function becomes a jest.fn() we can control per-test.
jest.mock('bcrypt');
jest.mock('../lib/jwt.util');

describe('AuthService', () => {
  // A hand-written fake repository. Every method is a jest.fn() so we can
  // tell it what to return, and later check whether/how it was called.
  // Method names must match AuthRepository exactly: findUserByEmail,
  // createUser, createRefreshToken, findRefreshToken, revokeRefreshToken.
  const mockAuthRepository = {
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
  };

  let authService: AuthService;

  beforeEach(() => {
    // Reset all mocks before every single test, so one test's setup can
    // never accidentally leak into the next one.
    jest.clearAllMocks();
    authService = new AuthService(mockAuthRepository as unknown as AuthRepository);
  });

  // ---------------------------------------------------------------------
  // register
  // ---------------------------------------------------------------------
  describe('register', () => {
    const registerInput = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'plainPassword123',
      confirmPassword: 'plainPassword123',
    };

    it('creates a new user and returns safe fields when the email is not taken', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null); // no existing user
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockAuthRepository.createUser.mockResolvedValue({
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        passwordHash: 'hashedPassword', // should NOT end up in the return value
      });

      const result = await authService.register(registerInput);

      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword123', 10);
      expect(result).toEqual({
        id: 'user-1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      });
      expect(result).not.toHaveProperty('passwordHash'); // guards the leak we fixed earlier
    });

    it('throws a 409 AppError when the email already exists', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(registerInput)).rejects.toMatchObject({
        message: 'User already exists',
        statusCode: 409,
      });

      // Should stop immediately — never attempt to hash or create anything.
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockAuthRepository.createUser).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------
  describe('login', () => {
    const loginInput = { email: 'test@example.com', password: 'plainPassword123' };
    const existingUser = { id: 'user-1', email: 'test@example.com', passwordHash: 'hashedPassword' };

    it('returns tokens on correct credentials', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (generateAccessToken as jest.Mock).mockReturnValue('fake.jwt.token');
      (generateRefreshToken as jest.Mock).mockReturnValue('raw-refresh-token');
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');

      const result = await authService.login(loginInput);

      expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword123', 'hashedPassword');
      expect(generateAccessToken).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', tokenHash: 'hashed-refresh-token' }),
      );
      expect(result).toEqual({ accessToken: 'fake.jwt.token', refreshToken: 'raw-refresh-token' });
    });

    it('throws generic 401 when the email does not exist', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      await expect(authService.login(loginInput)).rejects.toMatchObject({
        message: 'Invalid email or password',
        statusCode: 401,
      });
      expect(bcrypt.compare).not.toHaveBeenCalled(); // never even attempts a password check
    });

    it('throws the SAME generic 401 when the password is wrong', async () => {
      mockAuthRepository.findUserByEmail.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(loginInput)).rejects.toMatchObject({
        message: 'Invalid email or password', // must match the "no user" message exactly
        statusCode: 401,
      });
    });
  });

  // ---------------------------------------------------------------------
  // logout
  // ---------------------------------------------------------------------
  describe('logout', () => {
    it('revokes the token when it exists and is not already revoked', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        id: 'token-row-1',
        userId: 'user-1',
        tokenHash: 'hashed-refresh-token',
        revokedAt: null,
      });

      await authService.logout('raw-refresh-token');

      expect(mockAuthRepository.revokeRefreshToken).toHaveBeenCalledWith('token-row-1');
    });

    it('throws a 401 AppError when the token is not found', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('unknown-hash');
      mockAuthRepository.findRefreshToken.mockResolvedValue(null);

      await expect(authService.logout('bad-token')).rejects.toMatchObject({
        message: 'Invalid refresh token',
        statusCode: 401,
      });
      expect(mockAuthRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });

    it('does nothing (no throw) when the token was already revoked', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        id: 'token-row-1',
        userId: 'user-1',
        tokenHash: 'hashed-refresh-token',
        revokedAt: new Date(), // already revoked
      });

      await expect(authService.logout('raw-refresh-token')).resolves.toBeUndefined();
      expect(mockAuthRepository.revokeRefreshToken).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------
  // refreshTokens
  // ---------------------------------------------------------------------
  describe('refreshTokens', () => {
    const validRow = {
      id: 'token-row-1',
      userId: 'user-1',
      tokenHash: 'hashed-refresh-token',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
    };

    it('rotates the token and returns new tokens when valid', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');
      mockAuthRepository.findRefreshToken.mockResolvedValue(validRow);
      (generateAccessToken as jest.Mock).mockReturnValue('new.access.token');
      (generateRefreshToken as jest.Mock).mockReturnValue('new-raw-refresh-token');

      const result = await authService.refreshTokens('raw-refresh-token');

      expect(mockAuthRepository.revokeRefreshToken).toHaveBeenCalledWith('token-row-1');
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
      );
      expect(result).toEqual({ accessToken: 'new.access.token', refreshToken: 'new-raw-refresh-token' });
    });

    it('throws a 400 AppError when no refresh token is provided at all', async () => {
      await expect(authService.refreshTokens(undefined as unknown as string)).rejects.toMatchObject({
        message: 'Refresh token is required',
        statusCode: 400,
      });
      expect(mockAuthRepository.findRefreshToken).not.toHaveBeenCalled(); // never even hashes `undefined`
    });

    it('throws 401 when the token hash matches nothing', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('some-hash');
      mockAuthRepository.findRefreshToken.mockResolvedValue(null);

      await expect(authService.refreshTokens('fake-token')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws 401 when the token was already revoked (reuse detection)', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        ...validRow,
        revokedAt: new Date(), // already used once before
      });

      await expect(authService.refreshTokens('raw-refresh-token')).rejects.toMatchObject({ statusCode: 401 });
    });

    it('throws 401 when the token has expired', async () => {
      (hashRefreshToken as jest.Mock).mockReturnValue('hashed-refresh-token');
      mockAuthRepository.findRefreshToken.mockResolvedValue({
        ...validRow,
        expiresAt: new Date(Date.now() - 1000), // 1 second in the past
      });

      await expect(authService.refreshTokens('raw-refresh-token')).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});