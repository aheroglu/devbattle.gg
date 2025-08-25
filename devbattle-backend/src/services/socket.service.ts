import { Server, Socket } from 'socket.io';
import { JWTService } from '../utils/jwt';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SocketUser,
  getRoomName,
  BattleJoinData,
  BattleLeaveData,
  CodeChangeData,
  SubmissionResultData
} from '../types/socket';

type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type SocketConnection = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export class SocketService {
  private io: SocketServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId
  private typingUsers = new Map<string, Set<string>>(); // battleId -> Set<userId>
  private battleTimers = new Map<string, NodeJS.Timeout>(); // battleId -> timer

  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketHandlers();
    this.startCleanupTimer();
  }

  private setupSocketHandlers() {
    this.io.use(this.authenticateSocket);

    this.io.on('connection', (socket: SocketConnection) => {
      logger.info(`Socket connected: ${socket.id}`);
      
      // Initialize socket data
      socket.data.battleRooms = new Set();
      socket.data.lastActivity = new Date();
      socket.data.status = 'online';

      this.setupBattleHandlers(socket);
      this.setupBattleListHandlers(socket);
      this.setupCodeHandlers(socket);
      this.setupChatHandlers(socket);
      this.setupPresenceHandlers(socket);
      this.setupDisconnectHandler(socket);
    });
  }

  /**
   * Socket authentication middleware
   */
  private authenticateSocket = async (socket: SocketConnection, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token as string;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = JWTService.verifyAccessToken(token);
      
      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          avatar_url: true,
          level: true,
          role: true
        }
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user as SocketUser;
      this.connectedUsers.set(user.id, socket.id);
      
      socket.emit('authenticated', socket.data.user);
      logger.info(`Socket authenticated: ${socket.id} -> ${user.username}`);
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  };

  /**
   * Setup battle-related event handlers
   */
  private setupBattleHandlers(socket: SocketConnection) {
    socket.on('join-battle', async (battleId: string) => {
      try {
        if (!socket.data.user) return;

        const battleRoom = getRoomName('BATTLE', battleId);
        await socket.join(battleRoom);
        socket.data.battleRooms.add(battleId);

        // Get battle and participant info
        const battle = await prisma.battleSession.findUnique({
          where: { id: battleId },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar_url: true,
                    level: true
                  }
                }
              }
            }
          }
        });

        if (!battle) return;

        // Find user's participant record
        const participant = battle.participants.find(p => p.user_id === socket.data.user?.id);
        if (!participant) return;

        const joinData: BattleJoinData = {
          battleId,
          participant: {
            ...participant,
            user: participant.user as SocketUser
          },
          participantCount: battle.participants.length
        };

        // Notify all battle participants
        socket.to(battleRoom).emit('battle-joined', joinData);
        
        logger.info(`User ${socket.data.user.username} joined battle ${battleId}`);

        // Start battle timer if battle is active
        if (battle.status === 'ACTIVE' && battle.start_time && !this.battleTimers.has(battleId)) {
          this.startBattleTimer(battleId, battle.start_time, battle.max_duration);
        }
      } catch (error) {
        logger.error('Join battle error:', error);
      }
    });

    socket.on('leave-battle', async (battleId: string) => {
      try {
        if (!socket.data.user) return;

        const battleRoom = getRoomName('BATTLE', battleId);
        await socket.leave(battleRoom);
        socket.data.battleRooms.delete(battleId);

        // Get participant count
        const battle = await prisma.battleSession.findUnique({
          where: { id: battleId },
          include: {
            _count: { select: { participants: true } }
          }
        });

        const leaveData: BattleLeaveData = {
          battleId,
          userId: socket.data.user.id,
          participantCount: battle?._count.participants || 0
        };

        // Notify remaining participants
        socket.to(battleRoom).emit('battle-left', leaveData);
        
        logger.info(`User ${socket.data.user.username} left battle ${battleId}`);
      } catch (error) {
        logger.error('Leave battle error:', error);
      }
    });

    socket.on('battle-subscribe', async (battleId: string) => {
      const battleRoom = getRoomName('BATTLE', battleId);
      await socket.join(battleRoom);
      socket.data.battleRooms.add(battleId);
    });

    socket.on('battle-unsubscribe', async (battleId: string) => {
      const battleRoom = getRoomName('BATTLE', battleId);
      await socket.leave(battleRoom);
      socket.data.battleRooms.delete(battleId);
    });
  }

  /**
   * Setup battle list handlers
   */
  private setupBattleListHandlers(socket: SocketConnection) {
    socket.on('subscribe-battles', async () => {
      const battleListRoom = getRoomName('BATTLE_LIST');
      await socket.join(battleListRoom);
      logger.info(`User subscribed to battle list: ${socket.data.user?.username}`);
    });

    socket.on('unsubscribe-battles', async () => {
      const battleListRoom = getRoomName('BATTLE_LIST');
      await socket.leave(battleListRoom);
      logger.info(`User unsubscribed from battle list: ${socket.data.user?.username}`);
    });
  }

  /**
   * Setup code submission handlers
   */
  private setupCodeHandlers(socket: SocketConnection) {
    socket.on('code-change', async (data: { battleId: string; code: string; language: string }) => {
      try {
        if (!socket.data.user) return;

        const battleRoom = getRoomName('BATTLE', data.battleId);
        
        const codeChangeData: CodeChangeData = {
          battleId: data.battleId,
          userId: socket.data.user.id,
          username: socket.data.user.username,
          language: data.language,
          timestamp: new Date(),
          codeLength: data.code.length
        };

        // Notify other participants (excluding sender)
        socket.to(battleRoom).emit('code-changed', codeChangeData);
      } catch (error) {
        logger.error('Code change error:', error);
      }
    });

    socket.on('code-submit', async (data: { battleId: string; code: string; language: string }) => {
      try {
        if (!socket.data.user) return;

        // The actual submission will be handled by the REST API
        // This just notifies other participants that a submission occurred
        const battleRoom = getRoomName('BATTLE', data.battleId);
        
        socket.to(battleRoom).emit('notification', {
          type: 'info',
          message: `${socket.data.user.username} submitted their solution`
        });

        logger.info(`Code submitted in battle ${data.battleId} by ${socket.data.user.username}`);
      } catch (error) {
        logger.error('Code submit error:', error);
      }
    });
  }

  /**
   * Setup chat handlers
   */
  private setupChatHandlers(socket: SocketConnection) {
    socket.on('battle-message', async (data: { battleId: string; message: string }) => {
      try {
        if (!socket.data.user || !data.message.trim()) return;

        const battleRoom = getRoomName('BATTLE', data.battleId);
        
        const messageData = {
          battleId: data.battleId,
          user: socket.data.user,
          message: data.message.trim(),
          timestamp: new Date()
        };

        // Broadcast to all battle participants including sender
        this.io.to(battleRoom).emit('battle-message', messageData);

        logger.info(`Chat message in battle ${data.battleId} from ${socket.data.user.username}`);
      } catch (error) {
        logger.error('Battle message error:', error);
      }
    });

    socket.on('typing-start', (battleId: string) => {
      if (!socket.data.user) return;

      const battleRoom = getRoomName('BATTLE', battleId);
      
      if (!this.typingUsers.has(battleId)) {
        this.typingUsers.set(battleId, new Set());
      }
      
      this.typingUsers.get(battleId)?.add(socket.data.user.id);
      
      socket.to(battleRoom).emit('user-typing', {
        battleId,
        userId: socket.data.user.id,
        username: socket.data.user.username
      });
    });

    socket.on('typing-stop', (battleId: string) => {
      if (!socket.data.user) return;

      const battleRoom = getRoomName('BATTLE', battleId);
      
      this.typingUsers.get(battleId)?.delete(socket.data.user.id);
      
      socket.to(battleRoom).emit('user-stopped-typing', {
        battleId,
        userId: socket.data.user.id
      });
    });
  }

  /**
   * Setup presence handlers
   */
  private setupPresenceHandlers(socket: SocketConnection) {
    socket.on('user-presence', (status: 'online' | 'away' | 'busy') => {
      if (!socket.data.user) return;

      socket.data.status = status;
      socket.data.lastActivity = new Date();

      // Broadcast status change to relevant rooms
      socket.broadcast.emit('user-status-changed', {
        userId: socket.data.user.id,
        status
      });

      logger.info(`User ${socket.data.user.username} status changed to ${status}`);
    });
  }

  /**
   * Setup disconnect handler
   */
  private setupDisconnectHandler(socket: SocketConnection) {
    socket.on('disconnect', () => {
      if (socket.data.user) {
        this.connectedUsers.delete(socket.data.user.id);
        
        // Clean up typing indicators
        for (const [battleId, typingSet] of this.typingUsers) {
          if (typingSet.has(socket.data.user.id)) {
            typingSet.delete(socket.data.user.id);
            const battleRoom = getRoomName('BATTLE', battleId);
            socket.to(battleRoom).emit('user-stopped-typing', {
              battleId,
              userId: socket.data.user.id
            });
          }
        }

        // Broadcast user offline status
        socket.broadcast.emit('user-offline', {
          userId: socket.data.user.id,
          username: socket.data.user.username
        });

        logger.info(`Socket disconnected: ${socket.id} (${socket.data.user.username})`);
      } else {
        logger.info(`Socket disconnected: ${socket.id}`);
      }
    });
  }

  /**
   * Public methods for external services to emit events
   */

  /**
   * Notify battle participants of events
   */
  emitToBattle(battleId: string, event: keyof ServerToClientEvents, data: any) {
    const battleRoom = getRoomName('BATTLE', battleId);
    this.io.to(battleRoom).emit(event as any, data);
  }

  /**
   * Notify battle list subscribers
   */
  emitToBattleList(event: keyof ServerToClientEvents, data: any) {
    const battleListRoom = getRoomName('BATTLE_LIST');
    this.io.to(battleListRoom).emit(event as any, data);
  }

  /**
   * Notify specific user
   */
  emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event as any, data);
    }
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: keyof ServerToClientEvents, data: any) {
    this.io.emit(event as any, data);
  }

  /**
   * Handle submission result from API
   */
  handleSubmissionResult(submissionData: SubmissionResultData) {
    this.emitToBattle(submissionData.battleId, 'submission-result', submissionData);

    if (submissionData.isSuccess) {
      this.emitToBattle(submissionData.battleId, 'participant-completed', {
        battleId: submissionData.battleId,
        userId: submissionData.userId,
        username: submissionData.username,
        completionTime: submissionData.timestamp,
        rank: 1 // This would be calculated based on other completions
      });
    }
  }

  /**
   * Handle battle state changes from API
   */
  handleBattleCreated(battle: any) {
    this.emitToBattleList('battle-created', battle);
  }

  handleBattleDeleted(battleId: string) {
    this.emitToBattleList('battle-deleted', battleId);
  }

  handleBattleStarted(battleId: string, startTime: Date, maxDuration: number) {
    this.emitToBattle(battleId, 'battle-started', { battleId, startTime });
    this.startBattleTimer(battleId, startTime, maxDuration);
  }

  handleBattleEnded(battleId: string, winnerId?: string) {
    const endTime = new Date();
    this.emitToBattle(battleId, 'battle-ended', { battleId, winnerId, endTime });
    this.clearBattleTimer(battleId);
  }

  /**
   * Start battle timer for automatic timeout
   */
  private startBattleTimer(battleId: string, startTime: Date, maxDurationMinutes: number) {
    const remainingTime = (maxDurationMinutes * 60 * 1000) - (Date.now() - startTime.getTime());
    
    if (remainingTime <= 0) {
      this.emitToBattle(battleId, 'battle-timeout', battleId);
      return;
    }

    const timer = setTimeout(() => {
      this.emitToBattle(battleId, 'battle-timeout', battleId);
      this.clearBattleTimer(battleId);
      logger.info(`Battle ${battleId} timed out`);
    }, remainingTime);

    this.battleTimers.set(battleId, timer);
    logger.info(`Battle timer started for ${battleId}, remaining: ${Math.round(remainingTime / 1000)}s`);
  }

  /**
   * Clear battle timer
   */
  private clearBattleTimer(battleId: string) {
    const timer = this.battleTimers.get(battleId);
    if (timer) {
      clearTimeout(timer);
      this.battleTimers.delete(battleId);
    }
  }

  /**
   * Cleanup inactive connections and expired data
   */
  private startCleanupTimer() {
    setInterval(() => {
      const now = Date.now();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      // Clean up typing indicators for inactive users
      for (const [battleId, typingSet] of this.typingUsers) {
        for (const userId of typingSet) {
          const socketId = this.connectedUsers.get(userId);
          if (!socketId) {
            typingSet.delete(userId);
            const battleRoom = getRoomName('BATTLE', battleId);
            this.io.to(battleRoom).emit('user-stopped-typing', { battleId, userId });
          }
        }
        
        if (typingSet.size === 0) {
          this.typingUsers.delete(battleId);
        }
      }
    }, 30000); // Run every 30 seconds
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeBattleTimers: this.battleTimers.size,
      typingIndicators: Array.from(this.typingUsers.entries()).reduce(
        (total, [, userSet]) => total + userSet.size, 
        0
      ),
      rooms: this.io.sockets.adapter.rooms.size
    };
  }
}