import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import passport from '../config/passport';

const router = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for login/register
  message: {
    error: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Public routes (no authentication required)
router.post('/register', strictAuthLimiter, AuthController.register);
router.post('/login', strictAuthLimiter, AuthController.login);
router.post('/refresh', authLimiter, AuthController.refreshToken);

// Google OAuth routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/auth/login?error=oauth_failed'
  }),
  AuthController.googleCallback
);

// GitHub OAuth routes
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false 
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    session: false,
    failureRedirect: '/auth/login?error=oauth_failed'
  }),
  AuthController.githubCallback
);

// Protected routes (authentication required)
router.use(authenticateToken); // All routes below require authentication

router.get('/me', AuthController.getMe);
router.put('/profile', AuthController.updateProfile);
router.post('/logout', AuthController.logout);

export default router;