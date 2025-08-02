'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/shared/ui/badge';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Clock, Trophy, Users, User, Play, ArrowLeft, Settings, Maximize2 } from 'lucide-react';

import dynamic from 'next/dynamic';

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>,
});

// Mock battle data
const mockBattle = {
  id: '1',
  title: 'Algorithm Challenge: Two Sum',
  description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
  difficulty: 'Easy',
  participants: { current: 1, max: 1 },
  timeLimit: '30 min',
  xpReward: 50,
  status: 'waiting',
  type: 'solo',
  tags: ['Array', 'Hash Table'],
  starterCode: {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    
}`,
    python: `def two_sum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    # Your solution here
    pass`,
  },
  testCases: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    }
  ]
};

export default function BattlePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [battle] = useState(mockBattle);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(mockBattle.starterCode.javascript);
  const [hasJoined, setHasJoined] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(mockBattle.starterCode[newLanguage as keyof typeof mockBattle.starterCode] || '// Start coding here...');
  };

  function getDifficultyColor(difficulty: string) {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link href="/battles">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Battles
              </Button>
            </Link>
          </div>

          {/* Battle Info */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(battle.difficulty)}>
                      {battle.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {battle.type === 'solo' ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                      {battle.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-2xl mb-2">{battle.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{battle.description}</p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {battle.participants.current}/{battle.participants.max} participants
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {battle.timeLimit}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {battle.xpReward} XP
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                {/* Example */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Example:</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                    <div><strong>Input:</strong> {battle.testCases[0].input}</div>
                    <div><strong>Output:</strong> {battle.testCases[0].output}</div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Explanation:</strong> {battle.testCases[0].explanation}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {battle.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Join Button */}
                <Button
                  onClick={() => setHasJoined(true)}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {battle.type === 'solo' ? 'Start Challenge' : 'Join Battle'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/battles">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold">{battle.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {battle.timeLimit}
                  </span>
                  <span className="flex items-center">
                    <Trophy className="w-3 h-3 mr-1" />
                    {battle.xpReward} XP
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(battle.difficulty)}>
                {battle.difficulty}
              </Badge>
              <Badge variant="outline">
                {battle.type === 'solo' ? <User className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                {battle.type.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/3 border-r overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Problem</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{battle.description}</p>
            
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Example:</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                <div><strong>Input:</strong> {battle.testCases[0].input}</div>
                <div><strong>Output:</strong> {battle.testCases[0].output}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-2">
                  <strong>Explanation:</strong> {battle.testCases[0].explanation}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {battle.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">solution.js</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
                <Button size="sm">
                  Submit
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console/Output */}
          <div className="h-32 border-t bg-gray-50 dark:bg-gray-900 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Console</span>
              <Button size="sm" variant="ghost">Clear</Button>
            </div>
            <div className="bg-white dark:bg-gray-800 border rounded p-2 h-20 overflow-y-auto font-mono text-sm">
              <div className="text-gray-500">Click "Run" to test your code</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}