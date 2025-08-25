import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { BattleController } from '../controllers/battle.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Rate limiting for battle operations
const battleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many battle requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const submissionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 submissions per 5 minutes
  message: {
    error: 'Too many code submissions, please slow down'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const createBattleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 battle creations per hour
  message: {
    error: 'Too many battles created, please wait before creating more'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes (optional authentication for enhanced features)
router.get('/', optionalAuth, battleLimiter, BattleController.getAllBattles);
router.get('/:id', optionalAuth, battleLimiter, BattleController.getBattleById);
router.get('/:id/participants', battleLimiter, BattleController.getBattleParticipants);

// Protected routes (authentication required)
router.use(authenticateToken);

// Battle management
router.post('/', createBattleLimiter, BattleController.createBattle);
router.put('/:id', battleLimiter, BattleController.updateBattle);
router.delete('/:id', battleLimiter, BattleController.deleteBattle);

// Battle participation
router.post('/:id/join', battleLimiter, BattleController.joinBattle);
router.post('/:id/leave', battleLimiter, BattleController.leaveBattle);
router.post('/:id/submit', submissionLimiter, BattleController.submitSolution);

// Battle control (for creators)
router.post('/:id/start', battleLimiter, BattleController.startBattle);
router.post('/:id/end', battleLimiter, BattleController.endBattle);

// User battle history
router.get('/user/history', battleLimiter, BattleController.getUserBattleHistory);

export default router;