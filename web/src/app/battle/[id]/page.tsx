"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import {
  Users,
  Trophy,
  Send,
  Play,
  ArrowLeft,
  MessageCircle,
  Settings,
  Maximize2,
} from "lucide-react";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black/80">
      <div className="text-green-400">Loading editor...</div>
    </div>
  ),
});

interface BattlePageProps {
  battleId: string;
}

export default function BattlePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const [timeLeft, setTimeLeft] = useState(847); // seconds
  const [code, setCode] = useState(`// Two Sum Problem
function twoSum(nums, target) {
    // Your solution here
    
}`);
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [participants] = useState([
    { id: 1, name: "@codeNinja_42", progress: 75, rank: 1, avatar: "🥷" },
    { id: 2, name: "@pythonMaster", progress: 60, rank: 2, avatar: "🐍" },
    { id: 3, name: "@reactGuru", progress: 45, rank: 3, avatar: "⚛️" },
    { id: 4, name: "@algorithmQueen", progress: 30, rank: 4, avatar: "👑" },
  ]);

  const editorRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("javascript");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");

      // Battle arena entrance animation
      const elements = document.querySelectorAll(".battle-element");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.3,
          ease: "power2.out",
        }
      );
    };

    loadGSAP();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const runCode = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative">
      {/* Header */}
      <div className="fixed top-4 left-4 z-20">
        <Link href="/battles">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl bg-black/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Battles
          </Button>
        </Link>
      </div>

      <div className="relative z-10 border-b border-green-400/30 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-4 justify-between w-full">
              <Badge className="bg-red-500/20 text-red-400 border-red-400/30 animate-pulse rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                LIVE
              </Badge>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-400">Time Left</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Battle Area */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem & Participants */}
        <div className="w-80 border-r border-green-400/30 bg-black/50 backdrop-blur-sm overflow-y-auto">
          {/* Problem Description */}
          <Card className="battle-element m-4 bg-gray-900/50 border-green-400/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-green-400 text-lg flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Problem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-white font-semibold mb-2">Two Sum</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Given an array of integers nums and an integer target, return
                  indices of the two numbers such that they add up to target.
                </p>
              </div>

              <div>
                <h4 className="text-green-400 font-semibold mb-2">Example:</h4>
                <div className="bg-black p-3 rounded-lg border border-green-400/20 font-mono text-sm">
                  <div className="text-gray-300">
                    Input: nums = [2,7,11,15], target = 9
                  </div>
                  <div className="text-gray-300">Output: [0,1]</div>
                  <div className="text-gray-500">
                    // Because nums[0] + nums[1] == 9
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-400">Difficulty: Medium</span>
                <span className="text-green-400">Prize: 500 XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="battle-element m-4 bg-gray-900/50 border-green-400/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-green-400 text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants (4/50)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 bg-black/30 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{participant.avatar}</span>
                    <div>
                      <div className="text-blue-400 text-sm font-semibold">
                        {participant.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        Rank #{participant.rank}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-sm font-bold">
                      {participant.progress}%
                    </div>
                    <div className="w-16 bg-gray-700 rounded-full h-1 mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                        style={{ width: `${participant.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="border-b border-green-400/30 bg-black/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-green-400 text-sm">solution.js</span>

                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-900/50 border border-green-400/20 rounded-lg px-3 py-1 text-green-400 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={runCode}
                  disabled={isRunning}
                  className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Run Code (Ctrl+Enter)
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded-xl"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded-xl"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div ref={editorRef} className="flex-1 bg-black/80">
            <MonacoEditor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "IBM Plex Mono, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: "on",
                lineNumbers: "on",
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 0,
                lineNumbersMinChars: 3,
                renderLineHighlight: "line",
                selectOnLineNumbers: true,
                roundedSelection: false,
                readOnly: false,
                cursorStyle: "line",
                scrollbar: {
                  vertical: "visible",
                  horizontal: "visible",
                  useShadows: false,
                  verticalHasArrows: false,
                  horizontalHasArrows: false,
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
              beforeMount={(monaco) => {
                // Define custom theme
                monaco.editor.defineTheme("devbattle-dark", {
                  base: "vs-dark",
                  inherit: true,
                  rules: [
                    { token: "comment", foreground: "6A9955" },
                    { token: "keyword", foreground: "569CD6" },
                    { token: "string", foreground: "CE9178" },
                    { token: "number", foreground: "B5CEA8" },
                    { token: "function", foreground: "DCDCAA" },
                    { token: "variable", foreground: "9CDCFE" },
                  ],
                  colors: {
                    "editor.background": "#000000",
                    "editor.foreground": "#D4D4D4",
                    "editor.lineHighlightBackground": "#22C55E10",
                    "editor.selectionBackground": "#22C55E30",
                    "editor.inactiveSelectionBackground": "#22C55E20",
                    "editorCursor.foreground": "#22C55E",
                    "editorLineNumber.foreground": "#858585",
                    "editorLineNumber.activeForeground": "#22C55E",
                    "scrollbarSlider.background": "#22C55E30",
                    "scrollbarSlider.hoverBackground": "#22C55E50",
                    "scrollbarSlider.activeBackground": "#22C55E70",
                  },
                });
              }}
              onMount={(editor, monaco) => {
                // Set custom theme
                monaco.editor.setTheme("devbattle-dark");

                // Add custom keybindings
                editor.addCommand(
                  monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
                  () => {
                    runCode();
                  }
                );

                // Focus the editor
                editor.focus();
              }}
            />
          </div>

          {/* Output Panel */}
          <div className="h-32 border-t border-green-400/30 bg-gray-900/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-semibold">
                Output
              </span>
              <Button
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 rounded-xl"
              >
                Submit Solution
              </Button>
            </div>
            <div className="bg-black p-3 rounded-lg border border-green-400/20 h-20 overflow-y-auto">
              <div className="text-gray-300 text-sm font-mono">
                {isRunning ? (
                  <div className="text-yellow-400">Running tests...</div>
                ) : (
                  <div className="text-gray-500">
                    Click "Run Code" to test your solution
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-80 border-l border-green-400/30 bg-black/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 border-b border-green-400/30">
            <h3 className="text-green-400 font-semibold flex items-center">
              <MessageCircle className="h-4 w-4 mr-2" />
              Battle Chat
            </h3>
          </div>

          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3">
            {[
              {
                user: "@codeNinja_42",
                message: "This problem looks tricky!",
                time: "2m ago",
                avatar: "🥷",
              },
              {
                user: "@pythonMaster",
                message: "Hash map approach should work",
                time: "1m ago",
                avatar: "🐍",
              },
              {
                user: "@reactGuru",
                message: "Anyone else getting TLE?",
                time: "30s ago",
                avatar: "⚛️",
              },
            ].map((chat, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="text-sm">{chat.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-400 text-xs font-semibold">
                      {chat.user}
                    </span>
                    <span className="text-gray-500 text-xs">{chat.time}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-green-400/30">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300 text-sm"
              />
              <Button
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
