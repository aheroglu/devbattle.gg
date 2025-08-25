import { prisma } from '../config/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import { CodeExecutionService } from './code-execution.service';

export interface CreateBattleData {
  title: string;
  description?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  language: string;
  max_duration: number;
  max_participants: number;
  problem_id: string;
  creator_id: string;
}

export interface BattleFilters {
  status?: string;
  difficulty?: string;
  language?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export class BattleService {
  /**
   * Get all battles with filtering and pagination
   */
  static async getAllBattles(filters: BattleFilters, pagination: Pagination) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.difficulty) where.difficulty = filters.difficulty;
      if (filters.language) where.language = filters.language;

      const [battles, total] = await Promise.all([
        prisma.battleSession.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                avatar_url: true,
                level: true,
                title: true
              }
            },
            problem: {
              select: {
                id: true,
                title: true,
                difficulty: true
              }
            },
            participants: {
              select: {
                id: true,
                role: true,
                result: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    avatar_url: true,
                    level: true
                  }
                }
              }
            },
            _count: {
              select: {
                participants: true
              }
            }
          }
        }),
        prisma.battleSession.count({ where })
      ]);

      return {
        battles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all battles error:', error);
      throw new AppError('Failed to fetch battles', 500);
    }
  }

  /**
   * Get battle by ID
   */
  static async getBattleById(battleId: string, userId?: string) {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              level: true,
              title: true
            }
          },
          problem: {
            select: {
              id: true,
              title: true,
              description: true,
              difficulty: true,
              sample_test_cases: true,
              starter_code: true,
              time_limit: true,
              memory_limit: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatar_url: true,
                  level: true,
                  title: true
                }
              },
              submissions: {
                orderBy: { submitted_at: 'desc' },
                take: 1
              }
            }
          }
        }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      // Check if user is a participant
      const userParticipant = userId 
        ? battle.participants.find(p => p.user_id === userId)
        : null;

      return {
        ...battle,
        userParticipant,
        isCreator: battle.creator_id === userId
      };
    } catch (error) {
      logger.error('Get battle by ID error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch battle', 500);
    }
  }

  /**
   * Create new battle
   */
  static async createBattle(data: CreateBattleData) {
    try {
      // Verify problem exists
      const problem = await prisma.problemDefinition.findUnique({
        where: { id: data.problem_id }
      });

      if (!problem) {
        throw new AppError('Problem not found', 404);
      }

      // Verify creator exists
      const creator = await prisma.user.findUnique({
        where: { id: data.creator_id }
      });

      if (!creator) {
        throw new AppError('Creator not found', 404);
      }

      const battle = await prisma.battleSession.create({
        data: {
          title: data.title,
          description: data.description || null,
          difficulty: data.difficulty,
          language: data.language,
          max_duration: data.max_duration,
          max_participants: data.max_participants,
          status: 'WAITING',
          creator_id: data.creator_id,
          problem_id: data.problem_id
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              level: true,
              title: true
            }
          },
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        }
      });

      // Automatically join creator as SOLVER
      await this.joinBattle(battle.id, data.creator_id, 'SOLVER');

      logger.info(`Battle created: ${battle.id} by ${creator.username}`);
      
      return battle;
    } catch (error) {
      logger.error('Create battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create battle', 500);
    }
  }

  /**
   * Update battle
   */
  static async updateBattle(battleId: string, userId: string, updateData: Partial<CreateBattleData>) {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      // Only creator can update battle
      if (battle.creator_id !== userId) {
        throw new AppError('Only battle creator can update battle', 403);
      }

      // Can't update active or completed battles
      if (battle.status !== 'WAITING') {
        throw new AppError('Cannot update battle that is not waiting', 400);
      }

      const updatedBattle = await prisma.battleSession.update({
        where: { id: battleId },
        data: {
          ...(updateData.title && { title: updateData.title }),
          ...(updateData.description !== undefined && { description: updateData.description }),
          ...(updateData.difficulty && { difficulty: updateData.difficulty }),
          ...(updateData.language && { language: updateData.language }),
          ...(updateData.max_duration && { max_duration: updateData.max_duration }),
          ...(updateData.max_participants && { max_participants: updateData.max_participants })
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              level: true,
              title: true
            }
          },
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true
            }
          }
        }
      });

      return updatedBattle;
    } catch (error) {
      logger.error('Update battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update battle', 500);
    }
  }

  /**
   * Delete battle
   */
  static async deleteBattle(battleId: string, userId: string) {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      // Only creator can delete battle
      if (battle.creator_id !== userId) {
        throw new AppError('Only battle creator can delete battle', 403);
      }

      // Can't delete active battles
      if (battle.status === 'ACTIVE') {
        throw new AppError('Cannot delete active battle', 400);
      }

      await prisma.battleSession.delete({
        where: { id: battleId }
      });

      logger.info(`Battle deleted: ${battleId} by ${userId}`);
    } catch (error) {
      logger.error('Delete battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete battle', 500);
    }
  }

  /**
   * Join battle
   */
  static async joinBattle(battleId: string, userId: string, role: 'SOLVER' | 'SPECTATOR') {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId },
        include: {
          participants: true
        }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      // Check if battle is joinable
      if (battle.status === 'COMPLETED') {
        throw new AppError('Cannot join completed battle', 400);
      }

      // Check if user is already a participant
      const existingParticipant = battle.participants.find(p => p.user_id === userId);
      if (existingParticipant) {
        throw new AppError('Already joined this battle', 400);
      }

      // Check participant limits for SOLVER role
      if (role === 'SOLVER') {
        const solverCount = battle.participants.filter(p => p.role === 'SOLVER').length;
        if (solverCount >= battle.max_participants) {
          throw new AppError('Battle is full', 400);
        }
      }

      const participant = await prisma.battleParticipant.create({
        data: {
          battle_id: battleId,
          user_id: userId,
          role,
          result: 'PENDING'
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              level: true,
              title: true
            }
          }
        }
      });

      logger.info(`User ${userId} joined battle ${battleId} as ${role}`);
      
      return participant;
    } catch (error) {
      logger.error('Join battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to join battle', 500);
    }
  }

  /**
   * Leave battle
   */
  static async leaveBattle(battleId: string, userId: string) {
    try {
      const participant = await prisma.battleParticipant.findFirst({
        where: {
          battle_id: battleId,
          user_id: userId
        }
      });

      if (!participant) {
        throw new AppError('Not a participant in this battle', 400);
      }

      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId }
      });

      // Creator cannot leave their own battle
      if (battle?.creator_id === userId) {
        throw new AppError('Battle creator cannot leave battle', 400);
      }

      // Cannot leave active battles (unless spectator)
      if (battle?.status === 'ACTIVE' && participant.role === 'SOLVER') {
        throw new AppError('Cannot leave active battle as solver', 400);
      }

      await prisma.battleParticipant.delete({
        where: { id: participant.id }
      });

      logger.info(`User ${userId} left battle ${battleId}`);
    } catch (error) {
      logger.error('Leave battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to leave battle', 500);
    }
  }

  /**
   * Submit solution
   */
  static async submitSolution(battleId: string, userId: string, code: string, language: string) {
    try {
      // Get battle and participant info
      const battleData = await prisma.battleSession.findUnique({
        where: { id: battleId },
        include: {
          problem: true,
          participants: {
            where: { user_id: userId }
          }
        }
      });

      if (!battleData) {
        throw new AppError('Battle not found', 404);
      }

      if (battleData.status !== 'ACTIVE') {
        throw new AppError('Battle is not active', 400);
      }

      const participant = battleData.participants[0];
      if (!participant) {
        throw new AppError('Not a participant in this battle', 400);
      }

      if (participant.role !== 'SOLVER') {
        throw new AppError('Only solvers can submit solutions', 400);
      }

      // Check if battle has timed out
      if (battleData.start_time) {
        const timeElapsed = Date.now() - battleData.start_time.getTime();
        const maxTime = battleData.max_duration * 60 * 1000; // Convert to milliseconds
        
        if (timeElapsed > maxTime) {
          throw new AppError('Battle has timed out', 400);
        }
      }

      // Execute code
      const executionResult = await CodeExecutionService.executeSubmission(
        code,
        language as any,
        battleData.problem.sample_test_cases as any[],
        battleData.problem.time_limit,
        battleData.problem.memory_limit
      );

      // Create submission result
      const submission = await prisma.submissionResult.create({
        data: {
          battle_id: battleId,
          participant_id: participant.id,
          code,
          language,
          status: executionResult.status,
          execution_time: executionResult.execution_time || null,
          memory_usage: executionResult.memory_usage || null,
          test_results: executionResult.test_results as any,
          total_tests: executionResult.total_tests,
          passed_tests: executionResult.passed_tests,
          error_message: executionResult.error_message || null
        }
      });

      // Update participant result if solution passed
      if (executionResult.status === 'AC') {
        await prisma.battleParticipant.update({
          where: { id: participant.id },
          data: {
            result: 'SUCCESS',
            completion_time: new Date(),
            score: executionResult.passed_tests
          }
        });

        // Update user stats
        await prisma.user.update({
          where: { id: userId },
          data: {
            battles_won: { increment: 1 },
            xp: { increment: 100 } // Award XP for successful solution
          }
        });
      }

      logger.info(`Solution submitted for battle ${battleId} by user ${userId}: ${executionResult.status}`);
      
      return {
        ...submission,
        execution_result: executionResult
      };
    } catch (error) {
      logger.error('Submit solution error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to submit solution', 500);
    }
  }

  /**
   * Get battle participants
   */
  static async getBattleParticipants(battleId: string) {
    try {
      const participants = await prisma.battleParticipant.findMany({
        where: { battle_id: battleId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar_url: true,
              level: true,
              title: true,
              xp: true
            }
          },
          submissions: {
            orderBy: { submitted_at: 'desc' },
            take: 1,
            select: {
              status: true,
              execution_time: true,
              submitted_at: true,
              passed_tests: true,
              total_tests: true
            }
          }
        },
        orderBy: { joined_at: 'asc' }
      });

      return participants;
    } catch (error) {
      logger.error('Get battle participants error:', error);
      throw new AppError('Failed to fetch participants', 500);
    }
  }

  /**
   * Get user's battle history
   */
  static async getUserBattleHistory(userId: string, pagination: Pagination) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      const [battles, total] = await Promise.all([
        prisma.battleParticipant.findMany({
          where: { user_id: userId },
          skip,
          take: limit,
          orderBy: { joined_at: 'desc' },
          include: {
            battle: {
              include: {
                creator: {
                  select: {
                    id: true,
                    username: true,
                    avatar_url: true
                  }
                },
                problem: {
                  select: {
                    id: true,
                    title: true,
                    difficulty: true
                  }
                },
                _count: {
                  select: {
                    participants: true
                  }
                }
              }
            },
            submissions: {
              orderBy: { submitted_at: 'desc' },
              take: 1
            }
          }
        }),
        prisma.battleParticipant.count({
          where: { user_id: userId }
        })
      ]);

      return {
        battles: battles.map(participant => ({
          ...participant.battle,
          user_role: participant.role,
          user_result: participant.result,
          user_completion_time: participant.completion_time,
          user_score: participant.score,
          latest_submission: participant.submissions[0] || null
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get user battle history error:', error);
      throw new AppError('Failed to fetch battle history', 500);
    }
  }

  /**
   * Start battle
   */
  static async startBattle(battleId: string, userId: string) {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId },
        include: {
          participants: {
            where: { role: 'SOLVER' }
          }
        }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      if (battle.creator_id !== userId) {
        throw new AppError('Only battle creator can start battle', 403);
      }

      if (battle.status !== 'WAITING') {
        throw new AppError('Battle is not in waiting status', 400);
      }

      if (battle.participants.length < 2) {
        throw new AppError('Need at least 2 solvers to start battle', 400);
      }

      const updatedBattle = await prisma.battleSession.update({
        where: { id: battleId },
        data: {
          status: 'ACTIVE',
          start_time: new Date()
        }
      });

      logger.info(`Battle started: ${battleId} by ${userId}`);
      
      return updatedBattle;
    } catch (error) {
      logger.error('Start battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to start battle', 500);
    }
  }

  /**
   * End battle
   */
  static async endBattle(battleId: string, userId: string) {
    try {
      const battle = await prisma.battleSession.findUnique({
        where: { id: battleId },
        include: {
          participants: {
            where: { role: 'SOLVER' },
            orderBy: { completion_time: 'asc' }
          }
        }
      });

      if (!battle) {
        throw new AppError('Battle not found', 404);
      }

      if (battle.creator_id !== userId) {
        throw new AppError('Only battle creator can end battle', 403);
      }

      if (battle.status !== 'ACTIVE') {
        throw new AppError('Battle is not active', 400);
      }

      // Determine winner (first to complete successfully)
      const winner = battle.participants.find(p => p.result === 'SUCCESS' && p.completion_time);

      const updatedBattle = await prisma.battleSession.update({
        where: { id: battleId },
        data: {
          status: 'COMPLETED',
          end_time: new Date(),
          winner_id: winner?.user_id || null
        }
      });

      // Update participants who didn't finish
      await prisma.battleParticipant.updateMany({
        where: {
          battle_id: battleId,
          result: 'PENDING'
        },
        data: {
          result: 'FAILURE'
        }
      });

      // Update user stats for losers
      const losers = battle.participants.filter(p => p.user_id !== winner?.user_id);
      for (const loser of losers) {
        await prisma.user.update({
          where: { id: loser.user_id },
          data: {
            battles_lost: { increment: 1 }
          }
        });
      }

      logger.info(`Battle ended: ${battleId} by ${userId}, winner: ${winner?.user_id || 'none'}`);
      
      return updatedBattle;
    } catch (error) {
      logger.error('End battle error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to end battle', 500);
    }
  }
}