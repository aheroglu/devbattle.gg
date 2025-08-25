import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { UserController } from '../controllers/user.controller';
import { authenticateToken, optionalAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Rate limiting for user operations
const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many user requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 search requests per minute
  message: {
    error: 'Too many search requests, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 profile updates per 15 minutes
  message: {
    error: 'Too many profile updates, please wait before trying again'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes (optional authentication for enhanced features)
router.get('/', optionalAuth, userLimiter, UserController.getAllUsers);
router.get('/leaderboard', userLimiter, UserController.getLeaderboard);
router.get('/search', searchLimiter, UserController.searchUsers);

// Public user profile routes
router.get('/:identifier', optionalAuth, userLimiter, UserController.getUserById);
router.get('/:id/stats', userLimiter, UserController.getUserStats);
router.get('/:id/achievements', userLimiter, UserController.getUserAchievements);
router.get('/:id/followers', userLimiter, UserController.getUserFollowers);
router.get('/:id/following', userLimiter, UserController.getUserFollowing);

// Protected routes (authentication required)
router.use(authenticateToken);

// User management
router.put('/:id', updateLimiter, UserController.updateUser);
router.delete('/:id', userLimiter, UserController.deleteUser);

// Social features
router.post('/:id/follow', userLimiter, UserController.toggleFollow);

// Admin only routes
router.put('/:id/role', requireAdmin, userLimiter, UserController.updateUserRole);

export default router;