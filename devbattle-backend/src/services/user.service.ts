import { prisma } from '../config/database';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export interface UserFilters {
  search?: string;
  role?: string;
}

export interface UserSorting {
  sort: string;
  order: 'asc' | 'desc';
}

export interface Pagination {
  page: number;
  limit: number;
}

export class UserService {
  /**
   * Get all users with filtering, sorting, and pagination
   */
  static async getAllUsers(filters: UserFilters, sorting: UserSorting, pagination: Pagination) {
    try {
      const { page, limit } = pagination;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (filters.search) {
        where.OR = [
          { username: { contains: filters.search, mode: 'insensitive' } },
          { full_name: { contains: filters.search, mode: 'insensitive' } }
        ];
      }
      
      if (filters.role) {
        where.role = filters.role;
      }

      // Build order by clause
      const orderBy: any = {};
      const validSortFields = ['xp', 'level', 'battles_won', 'battles_lost', 'win_rate', 'created_at', 'username'];
      
      if (validSortFields.includes(sorting.sort)) {
        orderBy[sorting.sort] = sorting.order;
      } else {
        orderBy.xp = 'desc'; // Default sorting
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            username: true,
            full_name: true,
            avatar_url: true,
            xp: true,
            level: true,
            battles_won: true,
            battles_lost: true,
            rank: true,
            title: true,
            badge: true,
            win_rate: true,
            last_active: true,
            preferred_languages: true,
            role: true,
            created_at: true
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw new AppError('Failed to fetch users', 500);
    }
  }

  /**
   * Get user by ID or username
   */
  static async getUserById(identifier: string, requesterId?: string) {
    try {
      // Try to find by ID first, then by username
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: identifier },
            { username: identifier }
          ]
        },
        include: {
          achievements: {
            orderBy: { earned_at: 'desc' }
          },
          battle_participants: {
            where: { role: 'SOLVER' },
            include: {
              battle: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  difficulty: true,
                  language: true,
                  created_at: true
                }
              }
            },
            orderBy: { joined_at: 'desc' },
            take: 5 // Recent battles
          },
          created_battles: {
            select: {
              id: true,
              title: true,
              status: true,
              difficulty: true,
              created_at: true,
              _count: {
                select: {
                  participants: true
                }
              }
            },
            orderBy: { created_at: 'desc' },
            take: 5
          }
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Remove sensitive data
      const { password_hash, google_id, github_id, ...publicUser } = user;

      // Check if requester is following this user (if authenticated)
      let isFollowing = false;
      if (requesterId && requesterId !== user.id) {
        const followRelation = await prisma.user.findFirst({
          where: {
            id: requesterId,
            // This would need a followers relation in the schema
            // following: { some: { id: user.id } }
          }
        });
        isFollowing = !!followRelation;
      }

      return {
        ...publicUser,
        isFollowing,
        stats: {
          total_battles: user.battles_won + user.battles_lost,
          win_rate: user.win_rate,
          achievements_count: user.achievements.length,
          created_battles_count: user.created_battles.length
        }
      };
    } catch (error) {
      logger.error('Get user by ID error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch user', 500);
    }
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updateData: any, requesterRole: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Validate username uniqueness if being updated
      if (updateData.username && updateData.username !== user.username) {
        const existingUser = await prisma.user.findUnique({
          where: { username: updateData.username.toLowerCase() }
        });

        if (existingUser) {
          throw new AppError('Username already taken', 409);
        }
      }

      // Filter allowed fields based on role
      const allowedFields = [
        'username', 'full_name', 'avatar_url', 'bio', 
        'website', 'github_url', 'twitter_url', 'location',
        'preferred_languages', 'title', 'badge'
      ];

      // Admins can update additional fields
      if (requesterRole === 'ADMIN') {
        allowedFields.push('xp', 'level', 'battles_won', 'battles_lost', 'rank', 'win_rate');
      }

      const filteredData: any = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      }

      // Convert username to lowercase
      if (filteredData.username) {
        filteredData.username = filteredData.username.toLowerCase();
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: filteredData,
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar_url: true,
          xp: true,
          level: true,
          battles_won: true,
          battles_lost: true,
          rank: true,
          title: true,
          badge: true,
          win_rate: true,
          bio: true,
          website: true,
          github_url: true,
          twitter_url: true,
          location: true,
          preferred_languages: true,
          role: true,
          updated_at: true
        }
      });

      logger.info(`User profile updated: ${userId}`);
      
      return updatedUser;
    } catch (error) {
      logger.error('Update user error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update user', 500);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          battle_participants: {
            where: { role: 'SOLVER' },
            include: {
              battle: {
                select: {
                  difficulty: true,
                  language: true,
                  created_at: true
                }
              }
            }
          },
          achievements: true
        }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const battles = user.battle_participants;
      const totalBattles = battles.length;
      const wonBattles = battles.filter(p => p.result === 'SUCCESS').length;
      const lostBattles = battles.filter(p => p.result === 'FAILURE').length;

      // Language statistics
      const languageStats: Record<string, number> = {};
      battles.forEach(battle => {
        const lang = battle.battle.language;
        languageStats[lang] = (languageStats[lang] || 0) + 1;
      });

      // Difficulty statistics
      const difficultyStats = {
        EASY: battles.filter(b => b.battle.difficulty === 'EASY').length,
        MEDIUM: battles.filter(b => b.battle.difficulty === 'MEDIUM').length,
        HARD: battles.filter(b => b.battle.difficulty === 'HARD').length
      };

      // Monthly activity (last 12 months)
      const monthlyActivity: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toISOString().slice(0, 7); // YYYY-MM format
        monthlyActivity[key] = 0;
      }

      battles.forEach(battle => {
        const key = battle.battle.created_at.toISOString().slice(0, 7);
        if (monthlyActivity.hasOwnProperty(key)) {
          monthlyActivity[key] = (monthlyActivity[key] || 0) + 1;
        }
      });

      return {
        overview: {
          total_battles: totalBattles,
          battles_won: wonBattles,
          battles_lost: lostBattles,
          win_rate: totalBattles > 0 ? (wonBattles / totalBattles) * 100 : 0,
          xp: user.xp,
          level: user.level,
          rank: user.rank,
          achievements_count: user.achievements.length
        },
        languages: languageStats,
        difficulties: difficultyStats,
        monthly_activity: monthlyActivity,
        recent_achievements: user.achievements
          .sort((a, b) => b.earned_at.getTime() - a.earned_at.getTime())
          .slice(0, 5)
      };
    } catch (error) {
      logger.error('Get user stats error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch user statistics', 500);
    }
  }

  /**
   * Get user achievements
   */
  static async getUserAchievements(userId: string) {
    try {
      const achievements = await prisma.userAchievement.findMany({
        where: { user_id: userId },
        orderBy: { earned_at: 'desc' }
      });

      // Group by category/type for better organization
      const categorized = achievements.reduce((acc, achievement) => {
        const category = this.getAchievementCategory(achievement.title);
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
      }, {} as Record<string, typeof achievements>);

      return {
        total: achievements.length,
        achievements: categorized,
        recent: achievements.slice(0, 5)
      };
    } catch (error) {
      logger.error('Get user achievements error:', error);
      throw new AppError('Failed to fetch achievements', 500);
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: 'xp' | 'level' | 'battles_won' | 'win_rate',
    period: 'all' | 'week' | 'month' | 'year',
    limit: number
  ) {
    try {
      const orderBy: any = {};
      orderBy[type] = 'desc';

      // For period-based leaderboards, we'd need additional date filtering
      // This is a simplified version for 'all' period
      const whereClause: any = {};
      
      if (period !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        whereClause.last_active = {
          gte: startDate
        };
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar_url: true,
          xp: true,
          level: true,
          battles_won: true,
          battles_lost: true,
          win_rate: true,
          rank: true,
          title: true,
          badge: true,
          last_active: true
        }
      });

      // Add position numbers
      const leaderboard = users.map((user, index) => ({
        ...user,
        position: index + 1,
        total_battles: user.battles_won + user.battles_lost
      }));

      return {
        type,
        period,
        users: leaderboard,
        generated_at: new Date()
      };
    } catch (error) {
      logger.error('Get leaderboard error:', error);
      throw new AppError('Failed to fetch leaderboard', 500);
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, limit: number) {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { full_name: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: limit,
        select: {
          id: true,
          username: true,
          full_name: true,
          avatar_url: true,
          level: true,
          title: true,
          badge: true,
          xp: true
        },
        orderBy: {
          xp: 'desc'
        }
      });

      return users;
    } catch (error) {
      logger.error('Search users error:', error);
      throw new AppError('Failed to search users', 500);
    }
  }

  /**
   * Toggle follow/unfollow user
   */
  static async toggleFollow(followerId: string, followeeId: string, action: 'follow' | 'unfollow') {
    try {
      const followee = await prisma.user.findUnique({
        where: { id: followeeId }
      });

      if (!followee) {
        throw new AppError('User not found', 404);
      }

      // Note: This would require a separate followers/following table in the schema
      // For now, we'll return a placeholder response
      return {
        action,
        user_id: followeeId,
        username: followee.username,
        message: `${action} functionality would be implemented with a proper followers table`
      };
    } catch (error) {
      logger.error('Toggle follow error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to update follow status', 500);
    }
  }

  /**
   * Get user followers
   */
  static async getUserFollowers(userId: string, pagination: Pagination) {
    try {
      // Note: This would require a followers table in the schema
      // For now, return empty result
      return {
        followers: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          pages: 0
        }
      };
    } catch (error) {
      logger.error('Get user followers error:', error);
      throw new AppError('Failed to fetch followers', 500);
    }
  }

  /**
   * Get users that user is following
   */
  static async getUserFollowing(userId: string, pagination: Pagination) {
    try {
      // Note: This would require a following table in the schema
      // For now, return empty result
      return {
        following: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          pages: 0
        }
      };
    } catch (error) {
      logger.error('Get user following error:', error);
      throw new AppError('Failed to fetch following', 500);
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Delete user and all related data (cascading deletes in schema)
      await prisma.user.delete({
        where: { id: userId }
      });

      logger.info(`User account deleted: ${userId}`);
    } catch (error) {
      logger.error('Delete user error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete user', 500);
    }
  }

  /**
   * Update user role (admin only)
   */
  static async updateUserRole(userId: string, role: string) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any },
        select: {
          id: true,
          username: true,
          full_name: true,
          email: true,
          role: true,
          updated_at: true
        }
      });

      logger.info(`User role updated: ${userId} -> ${role}`);
      
      return updatedUser;
    } catch (error) {
      logger.error('Update user role error:', error);
      throw new AppError('Failed to update user role', 500);
    }
  }

  /**
   * Helper method to categorize achievements
   */
  private static getAchievementCategory(title: string): string {
    const categories: Record<string, string[]> = {
      'Combat': ['First Victory', 'Winning Streak', 'Battle Master'],
      'Speed': ['Speed Demon', 'Lightning Fast', 'Quick Draw'],
      'Skills': ['Perfectionist', 'Code Ninja', 'Algorithm Expert'],
      'Social': ['Team Player', 'Mentor', 'Community Star'],
      'Milestones': ['Veteran', 'Elite', 'Legend']
    };

    for (const [category, titles] of Object.entries(categories)) {
      if (titles.some(t => title.includes(t))) {
        return category;
      }
    }

    return 'Other';
  }
}