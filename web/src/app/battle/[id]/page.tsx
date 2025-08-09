"use client";

import { use, useState, useEffect, useRef } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shared/ui/dialog";
import {
  Users,
  Trophy,
  Send,
  Play,
  ArrowLeft,
  MessageCircle,
  Settings,
  Maximize2,
  Clock,
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BattleSession } from "@/types";

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

export default function BattlePage(props: { params: Promise<{ id: string }> }) {
  const { id } = use(props.params);
  const supabase = createClientComponentClient();

  const router = useRouter();

  // Battle data and loading states
  const [battle, setBattle] = useState<BattleSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);

  // Battle arena states
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [code, setCode] = useState("// Loading...");
  const [isRunning, setIsRunning] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Fetch battle data
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const { data, error } = await supabase
          .from("battle_sessions")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          setError("Battle not found");
          return;
        }

        setBattle(data);
        setLanguage(data.language);
        setTimeLeft(data.max_duration); // max_duration is already in seconds
        setCode(`// ${data.title} Challenge\n// Start coding here...\n\n`);

        // Fetch participants with user data
        const { data: participantData, error: participantError } =
          await supabase
            .from("battle_participants")
            .select(
              `
            id,
            user_id,
            result,
            created_at,
            users!inner(
              username,
              avatar_url,
              title
            )
          `
            )
            .eq("battle_id", id);

        if (!participantError && participantData) {
          setParticipantCount(participantData.length);

          // Transform data for display
          const transformedParticipants = participantData.map(
            (p: any, index: number) => ({
              id: p.id,
              name: `@${p.users.username}`,
              progress: Math.floor(Math.random() * 100), // Mock progress for now
              rank: index + 1,
              avatar: p.users.avatar_url ? "👤" : "🥷", // Mock avatar
              title: p.users.title || "Developer",
              result: p.result,
            })
          );

          setParticipants(transformedParticipants);
        }

        // Check if current user is a participant (will be checked in auth effect)
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: userParticipant } = await supabase
            .from("battle_participants")
            .select("id")
            .eq("battle_id", id)
            .eq("user_id", session.user.id)
            .single();

          setIsParticipant(!!userParticipant);
        }
      } catch (err) {
        setError("Failed to load battle");
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [id, supabase]);

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login with current page as redirect
        router.push(`/auth/login?redirect=/battle/${id}`);
        return;
      }
    };

    if (battle) {
      checkAuth();
    }
  }, [battle, id, supabase]);

  // Realtime participant updates
  useEffect(() => {
    if (!battle) return;

    const channel = supabase
      .channel(`battle-${battle.id}-participants`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_participants",
          filter: `battle_id=eq.${battle.id}`,
        },
        async () => {
          // Refetch participants when changes occur
          const { data: participantData, error: participantError } =
            await supabase
              .from("battle_participants")
              .select(
                `
              id,
              user_id,
              result,
              created_at,
              users!inner(
                username,
                avatar_url,
                title
              )
            `
              )
              .eq("battle_id", battle.id);

          if (!participantError && participantData) {
            setParticipantCount(participantData.length);

            const transformedParticipants = participantData.map(
              (p: any, index: number) => ({
                id: p.id,
                name: `@${p.users.username}`,
                progress: Math.floor(Math.random() * 100),
                rank: index + 1,
                avatar: p.users.avatar_url ? "👤" : "🥷",
                title: p.users.title || "Developer",
                result: p.result,
              })
            );

            setParticipants(transformedParticipants);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [battle, supabase]);

  const editorRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<string | null>("plaintext");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up! Handle timeout
          handleBattleTimeout();
          return 0;
        }
        return prev - 1;
      });
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

  const handleLeaveBattle = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      // Delete user from battle_participants
      const { error } = await supabase
        .from("battle_participants")
        .delete()
        .eq("battle_id", id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error leaving battle:", error);
        return;
      }

      // Redirect to battles page
      router.push("/battles");
    } catch (error) {
      console.error("Error leaving battle:", error);
    }
  };

  const handleBattleTimeout = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      console.log("Battle timeout - removing participant and redirecting");

      // Delete user from battle_participants due to timeout
      const { error } = await supabase
        .from("battle_participants")
        .delete()
        .eq("battle_id", id)
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Error removing participant on timeout:", error);
      }

      // Redirect to battles page after timeout
      setTimeout(() => {
        router.push("/battles");
      }, 1000); // Small delay to show timeout state
    } catch (error) {
      console.error("Error handling battle timeout:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-400";
      case "medium":
        return "text-yellow-400";
      case "hard":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-400">Loading battle...</div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || "Battle not found"}</div>
          <Link href="/battles">
            <Button
              variant="outline"
              className="text-green-400 border-green-400/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Battles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      {/* Header */}
      <div className="relative z-10 border-b border-green-400/30 bg-black/80 backdrop-blur-sm">
        <div className=" mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setShowLeaveModal(true)}
                className="text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 rounded-xl"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Leave Battle
              </Button>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <h1 className="text-xl font-bold text-green-400">
                {battle.title}
              </h1>
              <div className="flex items-center space-x-2">
                <Badge
                  className={`${getDifficultyColor(battle.difficulty).replace(
                    "text-",
                    "bg-"
                  )}-500/20 ${getDifficultyColor(
                    battle.difficulty
                  )} border-${getDifficultyColor(battle.difficulty).replace(
                    "text-",
                    ""
                  )}-400/30 rounded-full`}
                >
                  {battle.difficulty}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 rounded-full">
                  {battle.session_type}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-gray-400">Time Left</div>
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
                <h3 className="text-white font-semibold mb-2">
                  {battle.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {battle.description || "No description available"}
                </p>
              </div>

              {battle.description && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">
                    Challenge Description:
                  </h4>
                  <div className="bg-black p-3 rounded-lg border border-green-400/20 text-sm">
                    <div className="text-gray-300">{battle.description}</div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-green-400 font-semibold mb-2">
                  Technologies:
                </h4>
                <div className="bg-black p-3 rounded-lg border border-green-400/20">
                  <div className="flex flex-wrap gap-1">
                    {battle.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded border border-gray-600/30"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className={getDifficultyColor(battle.difficulty)}>
                  Difficulty: {battle.difficulty}
                </span>
                <span className="text-green-400">
                  Prize: {battle.xp_reward} XP
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card className="battle-element m-4 bg-gray-900/50 border-green-400/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-green-400 text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Participants ({participantCount}/50)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.length > 0 ? (
                participants.map((participant) => (
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
                          {participant.title} • {participant.result}
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
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">
                  No participants yet. Be the first to join!
                </div>
              )}
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
                <span className="text-green-400 text-sm">
                  solution.
                  {language === "javascript"
                    ? "js"
                    : language === "python"
                    ? "py"
                    : language === "typescript"
                    ? "ts"
                    : language === "java"
                    ? "java"
                    : language === "cpp"
                    ? "cpp"
                    : language === "go"
                    ? "go"
                    : language === "rust"
                    ? "rs"
                    : language === "csharp"
                    ? "cs"
                    : language === "plaintext"
                    ? "txt"
                    : language}
                </span>
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
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div ref={editorRef} className="flex-1 bg-black/80">
            <MonacoEditor
              height="100%"
              language={language || "plaintext"}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily:
                  "JetBrains Mono, Fira Code, Monaco, Consolas, monospace",
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

      {/* Leave Battle Confirmation Modal */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent className="bg-black/95 border-red-400/30 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Leave Battle?</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to leave this battle? You will lose any
              progress and won't be able to submit a solution.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowLeaveModal(false)}
              className="text-gray-300 hover:text-white border-gray-600/30 hover:border-gray-400"
            >
              Stay in Battle
            </Button>
            <Button
              onClick={handleLeaveBattle}
              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/30 hover:border-red-400"
            >
              Leave Battle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
