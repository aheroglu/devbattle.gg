import { PrismaClient, DifficultyLevel, ValidationType } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@devbattle.gg' },
    update: {},
    create: {
      email: 'admin@devbattle.gg',
      username: 'admin',
      password_hash: adminPassword,
      full_name: 'DevBattle Admin',
      role: 'ADMIN',
      xp: 10000,
      level: 50,
      title: 'System Administrator',
      badge: '👑',
      preferred_languages: ['javascript', 'typescript', 'python'],
      bio: 'DevBattle platform administrator',
      avatar_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=admin'
    }
  });

  // Create sample users
  const userPassword = await bcrypt.hash('user123', 12);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        username: 'alice_codes',
        password_hash: userPassword,
        full_name: 'Alice Johnson',
        xp: 2500,
        level: 15,
        battles_won: 12,
        battles_lost: 8,
        win_rate: 0.6,
        title: 'Code Ninja',
        badge: '🥋',
        preferred_languages: ['javascript', 'python'],
        bio: 'Frontend developer who loves React and Vue.js',
        github_url: 'https://github.com/alice',
        avatar_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=alice'
      }
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        username: 'bob_dev',
        password_hash: userPassword,
        full_name: 'Bob Smith',
        xp: 3200,
        level: 18,
        battles_won: 15,
        battles_lost: 10,
        win_rate: 0.6,
        title: 'Backend Master',
        badge: '⚡',
        preferred_languages: ['java', 'python', 'go'],
        bio: 'Backend developer specializing in microservices',
        github_url: 'https://github.com/bobsmith',
        avatar_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=bob'
      }
    }),
    prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: {
        email: 'charlie@example.com',
        username: 'charlie_algo',
        password_hash: userPassword,
        full_name: 'Charlie Wilson',
        xp: 4500,
        level: 22,
        battles_won: 28,
        battles_lost: 12,
        win_rate: 0.7,
        title: 'Algorithm Expert',
        badge: '🧠',
        preferred_languages: ['cpp', 'python', 'java'],
        bio: 'Competitive programmer and algorithm enthusiast',
        github_url: 'https://github.com/charliewilson',
        avatar_url: 'https://api.dicebear.com/7.x/avatars/svg?seed=charlie'
      }
    })
  ]);

  console.log(`✅ Created ${users.length + 1} users (including admin)`);

  // Create sample problems
  const problems = await Promise.all([
    prisma.problemDefinition.create({
      data: {
        title: 'Two Sum',
        description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
        difficulty: DifficultyLevel.EASY,
        sample_test_cases: [
          {
            input: '[2,7,11,15], 9',
            expected_output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
          },
          {
            input: '[3,2,4], 6',
            expected_output: '[1,2]',
            explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
          }
        ],
        hidden_test_cases: [
          {
            input: '[3,3], 6',
            expected_output: '[0,1]',
            explanation: 'Both elements are the same but at different indices.'
          },
          {
            input: '[-1,-2,-3,-4,-5], -8',
            expected_output: '[2,4]',
            explanation: 'Works with negative numbers too.'
          }
        ],
        starter_code: {
          javascript: `function twoSum(nums, target) {
    // Your code here
}`,
          python: `def two_sum(nums, target):
    # Your code here
    pass`,
          java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
    return new int[0];
}`,
          cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your code here
    return {};
}`
        },
        time_limit: 2000,
        memory_limit: 128000,
        validation_type: ValidationType.EXACT_MATCH
      }
    }),
    prisma.problemDefinition.create({
      data: {
        title: 'Valid Parentheses',
        description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
        difficulty: DifficultyLevel.EASY,
        sample_test_cases: [
          {
            input: '"()"',
            expected_output: 'true',
            explanation: 'The string contains valid parentheses.'
          },
          {
            input: '"()[]{}"',
            expected_output: 'true',
            explanation: 'Multiple types of brackets, all valid.'
          },
          {
            input: '"(]"',
            expected_output: 'false',
            explanation: 'Mismatched bracket types.'
          }
        ],
        hidden_test_cases: [
          {
            input: '""',
            expected_output: 'true',
            explanation: 'Empty string is valid.'
          },
          {
            input: '"((("',
            expected_output: 'false',
            explanation: 'Unclosed brackets.'
          }
        ],
        starter_code: {
          javascript: `function isValid(s) {
    // Your code here
}`,
          python: `def is_valid(s):
    # Your code here
    pass`,
          java: `public boolean isValid(String s) {
    // Your code here
    return false;
}`,
          cpp: `bool isValid(string s) {
    // Your code here
    return false;
}`
        },
        time_limit: 1000,
        memory_limit: 64000,
        validation_type: ValidationType.EXACT_MATCH
      }
    }),
    prisma.problemDefinition.create({
      data: {
        title: 'Merge Two Sorted Lists',
        description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
        difficulty: DifficultyLevel.MEDIUM,
        sample_test_cases: [
          {
            input: 'list1 = [1,2,4], list2 = [1,3,4]',
            expected_output: '[1,1,2,3,4,4]',
            explanation: 'Merge and sort both lists.'
          },
          {
            input: 'list1 = [], list2 = []',
            expected_output: '[]',
            explanation: 'Both lists are empty.'
          }
        ],
        hidden_test_cases: [
          {
            input: 'list1 = [], list2 = [0]',
            expected_output: '[0]',
            explanation: 'One list is empty.'
          }
        ],
        starter_code: {
          javascript: `function mergeTwoLists(list1, list2) {
    // Your code here
}`,
          python: `def merge_two_lists(list1, list2):
    # Your code here
    pass`,
          java: `public ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    // Your code here
    return null;
}`,
          cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {
    // Your code here
    return nullptr;
}`
        },
        time_limit: 3000,
        memory_limit: 256000,
        validation_type: ValidationType.EXACT_MATCH
      }
    })
  ]);

  console.log(`✅ Created ${problems.length} sample problems`);

  // Create sample battle sessions
  const battles = await Promise.all([
    prisma.battleSession.create({
      data: {
        title: 'Quick JavaScript Challenge',
        description: 'Solve the Two Sum problem in JavaScript',
        difficulty: DifficultyLevel.EASY,
        language: 'javascript',
        max_duration: 15, // 15 minutes
        max_participants: 2,
        status: 'WAITING',
        creator_id: users[0].id,
        problem_id: problems[0].id
      }
    }),
    prisma.battleSession.create({
      data: {
        title: 'Python Algorithm Battle',
        description: 'Test your Python skills with this algorithm challenge',
        difficulty: DifficultyLevel.MEDIUM,
        language: 'python',
        max_duration: 30, // 30 minutes
        max_participants: 4,
        status: 'WAITING',
        creator_id: users[1].id,
        problem_id: problems[2].id
      }
    })
  ]);

  console.log(`✅ Created ${battles.length} sample battles`);

  // Create some achievements
  const achievements = await Promise.all([
    prisma.userAchievement.create({
      data: {
        user_id: users[0].id,
        title: 'First Victory',
        description: 'Win your first coding battle',
        badge_url: '🏆'
      }
    }),
    prisma.userAchievement.create({
      data: {
        user_id: users[1].id,
        title: 'Speed Demon',
        description: 'Complete a problem in under 5 minutes',
        badge_url: '⚡'
      }
    }),
    prisma.userAchievement.create({
      data: {
        user_id: users[2].id,
        title: 'Perfectionist',
        description: 'Submit a solution that passes all test cases on first try',
        badge_url: '💯'
      }
    })
  ]);

  console.log(`✅ Created ${achievements.length} achievements`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });