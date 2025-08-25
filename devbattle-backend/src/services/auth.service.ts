import { prisma } from '../config/database';
import { JWTService } from '../utils/jwt';
import { PasswordService } from '../utils/password';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import {
  AuthUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OAuthProfile,
  TokenPair,
  RefreshTokenRequest
} from '../types/auth';

export class AuthService {
  /**
   * Register new user with email and password
   */
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate password
      const passwordValidation = PasswordService.validatePassword(data.password);
      if (!passwordValidation.valid) {
        throw new AppError(passwordValidation.errors.join(', '), 400);
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email.toLowerCase() },
            { username: data.username.toLowerCase() }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === data.email.toLowerCase()) {
          throw new AppError('User with this email already exists', 409);
        }
        throw new AppError('Username already taken', 409);
      }

      // Hash password
      const passwordHash = await PasswordService.hash(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          username: data.username.toLowerCase(),
          password_hash: passwordHash,
          full_name: data.full_name || null,
          role: 'DEVELOPER'
        }
      });

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      const authUser = this.mapToAuthUser(user);

      logger.info(`New user registered: ${user.email}`);

      return {
        user: authUser,
        tokens,
        message: 'Registration successful'
      };
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (!user || !user.password_hash) {
        throw new AppError('Invalid email or password', 401);
      }

      // Verify password
      const isValidPassword = await PasswordService.compare(data.password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid email or password', 401);
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { last_active: new Date() }
      });

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      const authUser = this.mapToAuthUser(user);

      logger.info(`User logged in: ${user.email}`);

      return {
        user: authUser,
        tokens,
        message: 'Login successful'
      };
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * OAuth authentication (Google/GitHub)
   */
  static async oauthLogin(profile: OAuthProfile): Promise<AuthResponse> {
    try {
      let user;
      const providerIdField = `${profile.provider}_id`;

      // Find existing user by OAuth provider ID
      user = await prisma.user.findFirst({
        where: {
          [providerIdField]: profile.id
        }
      });

      if (!user) {
        // Find by email if no OAuth user exists
        user = await prisma.user.findUnique({
          where: { email: profile.email.toLowerCase() }
        });

        if (user) {
          // Link OAuth account to existing user
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              [providerIdField]: profile.id,
              avatar_url: profile.avatar_url || user.avatar_url
            }
          });
        } else {
          // Create new user
          const username = await this.generateUniqueUsername(profile.username);
          
          user = await prisma.user.create({
            data: {
              email: profile.email.toLowerCase(),
              username,
              full_name: profile.full_name || null,
              avatar_url: profile.avatar_url || null,
              [providerIdField]: profile.id,
              role: 'DEVELOPER'
            }
          });
        }
      }

      // Update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          last_active: new Date(),
          avatar_url: profile.avatar_url || user.avatar_url
        }
      });

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      const authUser = this.mapToAuthUser(user);

      logger.info(`OAuth login: ${user.email} via ${profile.provider}`);

      return {
        user: authUser,
        tokens,
        message: 'OAuth login successful'
      };
    } catch (error) {
      logger.error('OAuth login error:', error);
      throw new AppError('OAuth authentication failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(data.refreshToken);

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true
        }
      });

      if (!user) {
        throw new AppError('User not found', 401);
      }

      // Generate new tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Token refresh failed', 401);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<AuthUser> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return this.mapToAuthUser(user);
    } catch (error) {
      logger.error('Get current user error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get user profile', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: Partial<AuthUser>): Promise<AuthUser> {
    try {
      // Check if username is taken (if being updated)
      if (data.username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username: data.username.toLowerCase(),
            id: { not: userId }
          }
        });

        if (existingUser) {
          throw new AppError('Username already taken', 409);
        }
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(data.username && { username: data.username.toLowerCase() }),
          ...(data.full_name !== undefined && { full_name: data.full_name }),
          ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
          ...(data.title !== undefined && { title: data.title }),
          ...(data.badge !== undefined && { badge: data.badge }),
          ...(data.preferred_languages && { preferred_languages: data.preferred_languages })
        }
      });

      return this.mapToAuthUser(user);
    } catch (error) {
      logger.error('Update profile error:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update profile', 500);
    }
  }

  /**
   * Generate unique username
   */
  private static async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase().replace(/[^a-z0-9_]/g, '');
    let counter = 0;
    
    while (true) {
      const testUsername = counter === 0 ? username : `${username}_${counter}`;
      
      const existingUser = await prisma.user.findUnique({
        where: { username: testUsername }
      });
      
      if (!existingUser) {
        return testUsername;
      }
      
      counter++;
      if (counter > 999) {
        // Fallback to timestamp
        return `${username}_${Date.now()}`;
      }
    }
  }

  /**
   * Map database user to AuthUser
   */
  private static mapToAuthUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      role: user.role,
      xp: user.xp,
      level: user.level,
      title: user.title,
      badge: user.badge,
      preferred_languages: user.preferred_languages || []
    };
  }
}