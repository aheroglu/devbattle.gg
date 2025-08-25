import { Request, Response } from 'express';
import { BattleService } from '../services/battle.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class BattleController {
  /**
   * Get all battles with optional filtering
   * GET /api/battles
   */
  static getAllBattles = asyncHandler(async (req: Request, res: Response) => {
    const { 
      status, 
      difficulty, 
      language, 
      page = '1', 
      limit = '10' 
    } = req.query;

    const filters = {
      status: status as string,
      difficulty: difficulty as string,
      language: language as string
    };

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await BattleService.getAllBattles(filters, pagination);

    res.json({
      success: true,
      data: result
    });
  });

  /**
   * Get battle by ID
   * GET /api/battles/:id
   */
  static getBattleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    const battle = await BattleService.getBattleById(id, userId);

    res.json({
      success: true,
      data: { battle }
    });
  });

  /**
   * Create new battle
   * POST /api/battles
   */
  static createBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const {
      title,
      description,
      difficulty,
      language,
      max_duration,
      max_participants,
      problem_id
    } = req.body;

    // Validation
    if (!title || !difficulty || !language || !max_duration || !problem_id) {
      throw new AppError('Title, difficulty, language, max_duration, and problem_id are required', 400);
    }

    if (max_duration < 5 || max_duration > 180) {
      throw new AppError('Duration must be between 5 and 180 minutes', 400);
    }

    if (max_participants < 2 || max_participants > 10) {
      throw new AppError('Participants must be between 2 and 10', 400);
    }

    const battleData = {
      title,
      description,
      difficulty,
      language,
      max_duration,
      max_participants,
      problem_id,
      creator_id: req.user.userId
    };

    const battle = await BattleService.createBattle(battleData);

    res.status(201).json({
      success: true,
      data: { battle },
      message: 'Battle created successfully'
    });
  });

  /**
   * Update battle
   * PUT /api/battles/:id
   */
  static updateBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const {
      title,
      description,
      difficulty,
      language,
      max_duration,
      max_participants
    } = req.body;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    const updateData = {
      title,
      description,
      difficulty,
      language,
      max_duration,
      max_participants
    };

    const battle = await BattleService.updateBattle(id, req.user.userId, updateData);

    res.json({
      success: true,
      data: { battle },
      message: 'Battle updated successfully'
    });
  });

  /**
   * Delete battle
   * DELETE /api/battles/:id
   */
  static deleteBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    await BattleService.deleteBattle(id, req.user.userId);

    res.json({
      success: true,
      message: 'Battle deleted successfully'
    });
  });

  /**
   * Join battle
   * POST /api/battles/:id/join
   */
  static joinBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { role = 'SOLVER' } = req.body;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    if (!['SOLVER', 'SPECTATOR'].includes(role)) {
      throw new AppError('Role must be SOLVER or SPECTATOR', 400);
    }

    const participant = await BattleService.joinBattle(id, req.user.userId, role);

    res.status(201).json({
      success: true,
      data: { participant },
      message: `Joined battle as ${role.toLowerCase()}`
    });
  });

  /**
   * Leave battle
   * POST /api/battles/:id/leave
   */
  static leaveBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    await BattleService.leaveBattle(id, req.user.userId);

    res.json({
      success: true,
      message: 'Left battle successfully'
    });
  });

  /**
   * Submit code solution
   * POST /api/battles/:id/submit
   */
  static submitSolution = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;
    const { code, language } = req.body;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    if (!code || !language) {
      throw new AppError('Code and language are required', 400);
    }

    if (code.length > 10000) {
      throw new AppError('Code must be less than 10,000 characters', 400);
    }

    const result = await BattleService.submitSolution(id, req.user.userId, code, language);

    res.json({
      success: true,
      data: { result },
      message: 'Solution submitted successfully'
    });
  });

  /**
   * Get battle participants
   * GET /api/battles/:id/participants
   */
  static getBattleParticipants = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    const participants = await BattleService.getBattleParticipants(id);

    res.json({
      success: true,
      data: { participants }
    });
  });

  /**
   * Get user's battle history
   * GET /api/battles/user/history
   */
  static getUserBattleHistory = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { page = '1', limit = '10' } = req.query;

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const history = await BattleService.getUserBattleHistory(req.user.userId, pagination);

    res.json({
      success: true,
      data: history
    });
  });

  /**
   * Start battle (for creators)
   * POST /api/battles/:id/start
   */
  static startBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    const battle = await BattleService.startBattle(id, req.user.userId);

    res.json({
      success: true,
      data: { battle },
      message: 'Battle started successfully'
    });
  });

  /**
   * End battle (for creators or auto-timeout)
   * POST /api/battles/:id/end
   */
  static endBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const { id } = req.params;

    if (!id) {
      throw new AppError('Battle ID is required', 400);
    }

    const battle = await BattleService.endBattle(id, req.user.userId);

    res.json({
      success: true,
      data: { battle },
      message: 'Battle ended successfully'
    });
  });
}