import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { SocketController } from '../controllers/socket.controller';
import { authenticateToken, requireAdmin, requireModeratorOrAdmin } from '../middleware/auth';

const router = Router();

// Rate limiting for socket operations
const socketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many socket requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const notificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit notifications to prevent spam
  message: {
    error: 'Too many notifications sent, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// All socket routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/stats', requireAdmin, socketLimiter, SocketController.getStats);
router.post('/notify-all', requireAdmin, notificationLimiter, SocketController.notifyAll);
router.post('/server-message', requireAdmin, notificationLimiter, SocketController.serverMessage);
router.post('/force-battle-timeout', requireAdmin, socketLimiter, SocketController.forceBattleTimeout);

// Moderator and admin routes
router.post('/notify-user', requireModeratorOrAdmin, notificationLimiter, SocketController.notifyUser);
router.post('/notify-battle', requireModeratorOrAdmin, notificationLimiter, SocketController.notifyBattle);

export default router;