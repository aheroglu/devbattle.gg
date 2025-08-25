import { Request, Response, NextFunction } from 'express';
import { JWTService } from '../utils/jwt';
import { prisma } from '../config/database';
import { AppError } from './error-handler';
import { logger } from '../utils/logger';
import { JWTPayload } from '../types/auth';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface User extends JWTPayload {}
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Extract token from Authorization header
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // Handle "Bearer TOKEN" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Handle direct token
  return authHeader;
};

/**
 * Authenticate JWT token middleware
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      throw new AppError('Access token required', 401);
    }
    
    // Verify token
    const decoded = JWTService.verifyAccessToken(token);
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        created_at: true
      }
    });
    
    if (!user) {
      throw new AppError('User not found', 401);
    }
    
    // Add user to request
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error instanceof AppError) {
      return next(error);
    }
    
    // Handle JWT specific errors
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return next(new AppError('Token expired', 401));
      }
      if (error.message.includes('invalid')) {
        return next(new AppError('Invalid token', 401));
      }
    }
    
    next(new AppError('Authentication failed', 401));
  }
};

/**
 * Optional authentication middleware (doesn't throw error if no token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }
    
    const decoded = JWTService.verifyAccessToken(token);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });
    
    if (user) {
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Authorize user roles
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
};

/**
 * Check if user is admin
 */
export const requireAdmin = authorizeRoles('ADMIN');

/**
 * Check if user is admin or moderator
 */
export const requireModeratorOrAdmin = authorizeRoles('ADMIN', 'MODERATOR');

/**
 * Check if user owns the resource or is admin
 */
export const requireOwnershipOrAdmin = (getUserId: (req: Request) => string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    const resourceUserId = getUserId(req);
    
    // Allow if user owns the resource or is admin
    if (req.user.userId === resourceUserId || req.user.role === 'ADMIN') {
      return next();
    }
    
    next(new AppError('Access denied', 403));
  };
};

/**
 * Rate limiting for authentication routes
 */
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This will be implemented with express-rate-limit in routes
  next();
};