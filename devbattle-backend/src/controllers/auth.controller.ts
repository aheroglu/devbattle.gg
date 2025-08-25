import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest,
  AuthResponse 
} from '../types/auth';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password, full_name }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      throw new AppError('Email, username, and password are required', 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      throw new AppError('Username must be between 3 and 20 characters', 400);
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new AppError('Username can only contain letters, numbers, and underscores', 400);
    }

    const result = await AuthService.register({
      email,
      username,
      password,
      full_name: full_name || null
    });

    res.status(201).json({
      success: true,
      data: result
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    const result = await AuthService.login({ email, password });

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken }: RefreshTokenRequest = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const tokens = await AuthService.refreshToken({ refreshToken });

    res.json({
      success: true,
      data: { tokens }
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const user = await AuthService.getCurrentUser(req.user.userId);

    res.json({
      success: true,
      data: { user }
    });
  });

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { username, full_name, avatar_url, title, badge, preferred_languages } = req.body;

    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 20) {
        throw new AppError('Username must be between 3 and 20 characters', 400);
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new AppError('Username can only contain letters, numbers, and underscores', 400);
      }
    }

    // Validate preferred_languages if provided
    if (preferred_languages && !Array.isArray(preferred_languages)) {
      throw new AppError('Preferred languages must be an array', 400);
    }

    const user = await AuthService.updateProfile(req.user.userId, {
      username,
      full_name,
      avatar_url,
      title,
      badge,
      preferred_languages
    });

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In JWT-based auth, logout is typically handled client-side
    // Here we just return a success message
    // In a more complex setup, we might maintain a token blacklist
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  /**
   * Google OAuth callback
   * GET /api/auth/google/callback
   */
  static googleCallback = asyncHandler(async (req: Request, res: Response) => {
    // This will be handled by Passport middleware
    // The user data should be in req.user after successful OAuth
    const authResponse = req.user as unknown as AuthResponse;

    if (!authResponse) {
      throw new AppError('OAuth authentication failed', 401);
    }

    // In a real app, you might redirect to frontend with tokens in query params
    // or set secure cookies
    const redirectUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback';
    const queryParams = new URLSearchParams({
      token: authResponse.tokens.accessToken,
      refreshToken: authResponse.tokens.refreshToken
    });

    res.redirect(`${redirectUrl}?${queryParams.toString()}`);
  });

  /**
   * GitHub OAuth callback
   * GET /api/auth/github/callback
   */
  static githubCallback = asyncHandler(async (req: Request, res: Response) => {
    const authResponse = req.user as unknown as AuthResponse;

    if (!authResponse) {
      throw new AppError('OAuth authentication failed', 401);
    }

    const redirectUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/callback';
    const queryParams = new URLSearchParams({
      token: authResponse.tokens.accessToken,
      refreshToken: authResponse.tokens.refreshToken
    });

    res.redirect(`${redirectUrl}?${queryParams.toString()}`);
  });
}