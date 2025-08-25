import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class UserController {
  /**
   * Get all users with pagination and filtering
   * GET /api/users
   */
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const { 
      search,
      role,
      sort = 'xp',
      order = 'desc',
      page = '1', 
      limit = '20'
    } = req.query;

    const filters = {
      search: search as string,
      role: role as string
    };

    const sorting = {
      sort: sort as string,
      order: order as 'asc' | 'desc'
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await UserService.getAllUsers(filters, sorting, pagination);

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get user by ID or username
   * GET /api/users/:identifier
   */
  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { identifier } = req.params;
    const requesterId = req.user?.userId;

    if (!identifier) {
      throw new AppError('User identifier is required', 400);
    }

    const user = await UserService.getUserById(identifier, requesterId);

    res.json({
      success: true,
      data: { user }
    });
  });

  /**
   * Update user profile
   * PUT /api/users/:id
   */
  static updateUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    // Users can only update their own profile unless they're admin
    if (req.user.userId !== id && req.user.role !== 'ADMIN') {
      throw new AppError('Can only update your own profile', 403);
    }

    const user = await UserService.updateUser(id, updateData, req.user.role);

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully'
    });
  });

  /**
   * Get user statistics
   * GET /api/users/:id/stats
   */
  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    const stats = await UserService.getUserStats(id);

    res.json({
      success: true,
      data: { stats }
    });
  });

  /**
   * Get user achievements
   * GET /api/users/:id/achievements
   */
  static getUserAchievements = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    const achievements = await UserService.getUserAchievements(id);

    res.json({
      success: true,
      data: { achievements }
    });
  });

  /**
   * Get leaderboard
   * GET /api/users/leaderboard
   */
  static getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
    const { 
      type = 'xp',
      period = 'all',
      limit = '20'
    } = req.query;

    if (!['xp', 'level', 'battles_won', 'win_rate'].includes(type as string)) {
      throw new AppError('Invalid leaderboard type', 400);
    }

    if (!['all', 'week', 'month', 'year'].includes(period as string)) {
      throw new AppError('Invalid leaderboard period', 400);
    }

    const leaderboard = await UserService.getLeaderboard(
      type as 'xp' | 'level' | 'battles_won' | 'win_rate',
      period as 'all' | 'week' | 'month' | 'year',
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: { leaderboard }
    });
  });

  /**
   * Search users
   * GET /api/users/search
   */
  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { 
      q: query,
      limit = '10'
    } = req.query;

    if (!query || typeof query !== 'string') {
      throw new AppError('Search query is required', 400);
    }

    if (query.length < 2) {
      throw new AppError('Search query must be at least 2 characters', 400);
    }

    const users = await UserService.searchUsers(query, parseInt(limit as string));

    res.json({
      success: true,
      data: { users }
    });
  });

  /**
   * Follow/unfollow user
   * POST /api/users/:id/follow
   */
  static toggleFollow = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { action } = req.body; // 'follow' or 'unfollow'

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    if (req.user.userId === id) {
      throw new AppError('Cannot follow yourself', 400);
    }

    if (!['follow', 'unfollow'].includes(action)) {
      throw new AppError('Action must be follow or unfollow', 400);
    }

    const result = await UserService.toggleFollow(req.user.userId, id, action);

    res.json({
      success: true,
      data: result,
      message: `Successfully ${action}ed user`
    });
  });

  /**
   * Get user's followers
   * GET /api/users/:id/followers
   */
  static getUserFollowers = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const followers = await UserService.getUserFollowers(id, pagination);

    res.json({
      success: true,
      data: followers
    });
  });

  /**
   * Get users that user is following
   * GET /api/users/:id/following
   */
  static getUserFollowing = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const following = await UserService.getUserFollowing(id, pagination);

    res.json({
      success: true,
      data: following
    });
  });

  /**
   * Delete user account (admin only or self-deletion)
   * DELETE /api/users/:id
   */
  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { confirm } = req.body;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    // Users can only delete their own account unless they're admin
    if (req.user.userId !== id && req.user.role !== 'ADMIN') {
      throw new AppError('Insufficient permissions', 403);
    }

    if (!confirm) {
      throw new AppError('Account deletion must be confirmed', 400);
    }

    await UserService.deleteUser(id);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  });

  /**
   * Update user role (admin only)
   * PUT /api/users/:id/role
   */
  static updateUserRole = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403);
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    if (!['DEVELOPER', 'MODERATOR', 'ADMIN'].includes(role)) {
      throw new AppError('Invalid role', 400);
    }

    const user = await UserService.updateUserRole(id, role);

    res.json({
      success: true,
      data: { user },
      message: 'User role updated successfully'
    });
  });
}