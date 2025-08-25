import { Request, Response, NextFunction } from 'express';
import { SocketService } from '../services/socket.service';

// Extend Request interface to include socket service
declare global {
  namespace Express {
    interface Request {
      socketService?: SocketService;
    }
  }
}

/**
 * Middleware to add socket service to request context
 */
export const attachSocketService = (socketService: SocketService) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.socketService = socketService;
    next();
  };
};