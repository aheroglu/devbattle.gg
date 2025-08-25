import { Request, Response } from 'express';
import { SocketService } from '../services/socket.service';
import { AppError, asyncHandler } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class SocketController {
  private static socketService: SocketService;

  static setSocketService(service: SocketService) {
    this.socketService = service;
  }

  /**
   * Get Socket.IO connection statistics
   * GET /api/socket/stats
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403);
    }

    const stats = this.socketService.getStats();

    res.json({
      success: true,
      data: {
        stats,
        timestamp: new Date()
      }
    });
  });

  /**
   * Send notification to specific user
   * POST /api/socket/notify-user
   */
  static notifyUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const { userId, type, message } = req.body;

    if (!userId || !type || !message) {
      throw new AppError('userId, type, and message are required', 400);
    }

    if (!['info', 'success', 'warning', 'error'].includes(type)) {
      throw new AppError('Invalid notification type', 400);
    }

    this.socketService.emitToUser(userId, 'notification', { type, message });

    logger.info(`Notification sent to user ${userId} by ${req.user.username}: ${message}`);

    res.json({
      success: true,
      message: 'Notification sent successfully'
    });
  });

  /**
   * Send notification to battle participants
   * POST /api/socket/notify-battle
   */
  static notifyBattle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !['ADMIN', 'MODERATOR'].includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    const { battleId, type, message } = req.body;

    if (!battleId || !type || !message) {
      throw new AppError('battleId, type, and message are required', 400);
    }

    if (!['info', 'success', 'warning', 'error'].includes(type)) {
      throw new AppError('Invalid notification type', 400);
    }

    this.socketService.emitToBattle(battleId, 'notification', { type, message });

    logger.info(`Battle notification sent to ${battleId} by ${req.user.username}: ${message}`);

    res.json({
      success: true,
      message: 'Battle notification sent successfully'
    });
  });

  /**
   * Send global notification to all users
   * POST /api/socket/notify-all
   */
  static notifyAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403);
    }

    const { type, message } = req.body;

    if (!type || !message) {
      throw new AppError('type and message are required', 400);
    }

    if (!['info', 'success', 'warning', 'error'].includes(type)) {
      throw new AppError('Invalid notification type', 400);
    }

    this.socketService.broadcast('notification', { type, message });

    logger.info(`Global notification sent by ${req.user.username}: ${message}`);

    res.json({
      success: true,
      message: 'Global notification sent successfully'
    });
  });

  /**
   * Send server message to all users
   * POST /api/socket/server-message
   */
  static serverMessage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403);
    }

    const { message } = req.body;

    if (!message) {
      throw new AppError('message is required', 400);
    }

    this.socketService.broadcast('server-message', message);

    logger.info(`Server message sent by ${req.user.username}: ${message}`);

    res.json({
      success: true,
      message: 'Server message sent successfully'
    });
  });

  /**
   * Force battle timeout (admin only)
   * POST /api/socket/force-battle-timeout
   */
  static forceBattleTimeout = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || req.user.role !== 'ADMIN') {
      throw new AppError('Admin access required', 403);
    }

    const { battleId } = req.body;

    if (!battleId) {
      throw new AppError('battleId is required', 400);
    }

    this.socketService.emitToBattle(battleId, 'battle-timeout', battleId);

    logger.info(`Battle timeout forced for ${battleId} by ${req.user.username}`);

    res.json({
      success: true,
      message: 'Battle timeout triggered successfully'
    });
  });

  // Methods to be called by other services

  /**
   * Handle battle creation event
   */
  static handleBattleCreated(battle: any) {
    if (this.socketService) {
      this.socketService.handleBattleCreated(battle);
    }
  }

  /**
   * Handle battle deletion event
   */
  static handleBattleDeleted(battleId: string) {
    if (this.socketService) {
      this.socketService.handleBattleDeleted(battleId);
    }
  }

  /**
   * Handle battle start event
   */
  static handleBattleStarted(battleId: string, startTime: Date, maxDuration: number) {
    if (this.socketService) {
      this.socketService.handleBattleStarted(battleId, startTime, maxDuration);
    }
  }

  /**
   * Handle battle end event
   */
  static handleBattleEnded(battleId: string, winnerId?: string) {
    if (this.socketService) {
      this.socketService.handleBattleEnded(battleId, winnerId);
    }
  }

  /**
   * Handle battle join event
   */
  static handleBattleJoin(battleId: string, participant: any, participantCount: number) {
    if (this.socketService) {
      this.socketService.emitToBattleList('battle-status-changed', {
        battleId,
        status: 'participant-joined',
        participantCount
      });
    }
  }

  /**
   * Handle battle leave event
   */
  static handleBattleLeave(battleId: string, participantCount: number) {
    if (this.socketService) {
      this.socketService.emitToBattleList('battle-status-changed', {
        battleId,
        status: 'participant-left',
        participantCount
      });
    }
  }

  /**
   * Handle submission result event
   */
  static handleSubmissionResult(data: {
    battleId: string;
    userId: string;
    username: string;
    result: any;
    isSuccess: boolean;
  }) {
    if (this.socketService) {
      this.socketService.handleSubmissionResult({
        ...data,
        timestamp: new Date()
      });
    }
  }

  /**
   * Handle battle update event
   */
  static handleBattleUpdate(battleId: string, battle: any) {
    if (this.socketService) {
      this.socketService.emitToBattle(battleId, 'battle-updated', {
        battleId,
        battle
      });
    }
  }
}