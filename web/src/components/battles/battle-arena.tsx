"use client";

import { useState, useEffect } from "react";
import { useBattle } from "@/hooks/use-battle";
import { battleService } from "@/lib/battle-service";
import { ProgrammingLanguage, CodeExecutionResult } from "@/types";
import CodeEditor from "./code-editor";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Separator } from "@/components/shared/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Progress } from "@/components/shared/ui/progress";
import { 
  Timer, 
  Users, 
  Trophy, 
  MessageCircle, 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface BattleArenaProps {
  battleId: string;
}

export default function BattleArena({ battleId }: BattleArenaProps) {
  const { user } = useAuth();
  const {
    battle,
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    updateCode,
    submitSolution,
    joinBattle,
    joinAsSpectator,
  } = useBattle(battleId);

  const [currentCode, setCurrentCode] = useState("");
  const [currentLanguage, setCurrentLanguage] = useState<ProgrammingLanguage>("javascript");
  const [chatMessage, setChatMessage] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testResults, setTestResults] = useState<CodeExecutionResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate time remaining
  useEffect(() => {
    if (battle?.started_at && battle.status === "active") {
      const interval = setInterval(() => {
        const startTime = new Date(battle.started_at!).getTime();
        const maxDuration = (battle.max_duration || 1800) * 1000; // default 30 minutes
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, maxDuration - elapsed);
        
        setTimeRemaining(Math.floor(remaining / 1000));
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [battle]);

  // Initialize code from battle data
  useEffect(() => {
    if (battle && user) {
      const isPlayer1 = battle.player1_id === user.id;
      const playerCode = isPlayer1 ? battle.player1_code : battle.player2_code;
      const playerLanguage = isPlayer1 ? battle.player1_language : battle.player2_language;
      
      if (playerCode) {
        setCurrentCode(playerCode);
      } else if (battle.problem?.starter_code) {
        const starterCode = battle.problem.starter_code[currentLanguage];
        if (starterCode) {
          setCurrentCode(starterCode);
        }
      }
      
      if (playerLanguage) {
        setCurrentLanguage(playerLanguage as ProgrammingLanguage);
      }
    }
  }, [battle, user, currentLanguage]);

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
    updateCode(code, currentLanguage);
  };

  const handleLanguageChange = (language: ProgrammingLanguage) => {
    setCurrentLanguage(language);
    
    // Load starter code for new language if available
    if (battle?.problem?.starter_code?.[language]) {
      const starterCode = battle.problem.starter_code[language];
      setCurrentCode(starterCode);
      updateCode(starterCode, language);
    }
  };

  const handleRunCode = async () => {
    if (!battle?.problem) return;
    
    try {
      const result = await battleService.executeCode({
        language: currentLanguage,
        code: currentCode,
        test_cases: battle.problem.test_cases,
      });
      
      setTestResults(result);
    } catch (error) {
      console.error("Error running code:", error);
    }
  };

  const handleSubmitSolution = async () => {
    if (!battle || !currentCode.trim()) return;
    
    setIsSubmitting(true);
    try {
      const result = await battleService.submitBattleSolution(
        battleId,
        currentCode,
        currentLanguage
      );
      
      setTestResults(result);
      await submitSolution(currentCode, currentLanguage);
    } catch (error) {
      console.error("Error submitting solution:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendMessage(chatMessage);
      setChatMessage("");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const canParticipate = user && battle && (
    battle.player1_id === user.id || 
    battle.player2_id === user.id
  );

  const isSpectator = user && battle && !canParticipate;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading battle...</p>
        </div>
      </div>
    );
  }

  if (error || !battle) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500">Error: {error || "Battle not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Battle Header */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h1 className="text-xl font-bold">{battle.problem?.title}</h1>
              <Badge variant={
                battle.problem?.difficulty === "easy" ? "secondary" :
                battle.problem?.difficulty === "medium" ? "default" : "destructive"
              }>
                {battle.problem?.difficulty}
              </Badge>
            </div>
            
            <Badge variant={
              battle.status === "active" ? "default" :
              battle.status === "completed" ? "secondary" : "outline"
            }>
              {battle.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {battle.status === "active" && timeRemaining > 0 && (
              <div className="flex items-center gap-2 text-orange-500">
                <Timer className="w-4 h-4" />
                <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-sm text-muted-foreground">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Player 1 */}
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={battle.player1?.avatar_url || ""} />
                <AvatarFallback>
                  {battle.player1?.username?.[0]?.toUpperCase() || "P1"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{battle.player1?.username || "Player 1"}</p>
                <p className="text-xs text-muted-foreground">
                  Level {battle.player1?.level || 1}
                </p>
              </div>
              {battle.player1_submitted_at && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>

            <span className="text-lg font-bold">VS</span>

            {/* Player 2 */}
            {battle.player2 ? (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={battle.player2.avatar_url || ""} />
                  <AvatarFallback>
                    {battle.player2.username?.[0]?.toUpperCase() || "P2"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{battle.player2.username}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {battle.player2.level || 1}
                  </p>
                </div>
                {battle.player2_submitted_at && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 border-2 border-dashed border-muted-foreground rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">Waiting for opponent...</span>
                {user && battle.status === "waiting" && battle.player1_id !== user.id && (
                  <Button size="sm" onClick={joinBattle}>Join Battle</Button>
                )}
              </div>
            )}
          </div>

          {/* Spectator Actions */}
          {isSpectator && (
            <Button variant="outline" onClick={joinAsSpectator}>
              <Users className="w-4 h-4 mr-2" />
              Spectate
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Problem & Code */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="problem" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="problem">Problem</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>
            
            <TabsContent value="problem" className="flex-1 p-4">
              <div className="prose max-w-none">
                <h3>Description</h3>
                <p>{battle.problem?.description}</p>
                
                {battle.problem?.test_cases && battle.problem.test_cases.length > 0 && (
                  <>
                    <h4>Example</h4>
                    <div className="bg-muted p-3 rounded">
                      <p><strong>Input:</strong> {JSON.stringify(battle.problem.test_cases[0].input)}</p>
                      <p><strong>Output:</strong> {JSON.stringify(battle.problem.test_cases[0].output)}</p>
                      {battle.problem.test_cases[0].explanation && (
                        <p><strong>Explanation:</strong> {battle.problem.test_cases[0].explanation}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="results" className="flex-1 p-4">
              {testResults ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Test Results</h3>
                    <Badge variant={testResults.success ? "default" : "destructive"}>
                      {testResults.passed_tests}/{testResults.total_tests} Passed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Execution Time:</span>
                      <span className="ml-2">{testResults.execution_time.toFixed(2)}ms</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory Used:</span>
                      <span className="ml-2">{(testResults.memory_used / 1024).toFixed(2)}KB</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {testResults.test_results.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Test Case {index + 1}</span>
                            {result.passed ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-muted-foreground">Expected:</span>
                              <code className="ml-2 bg-muted px-1 rounded">
                                {JSON.stringify(result.expected)}
                              </code>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Actual:</span>
                              <code className="ml-2 bg-muted px-1 rounded">
                                {JSON.stringify(result.actual)}
                              </code>
                            </div>
                            {result.error && (
                              <div className="text-red-500">
                                <span className="text-muted-foreground">Error:</span>
                                <span className="ml-2">{result.error}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Zap className="w-12 h-12 mx-auto mb-4" />
                    <p>Run your code to see test results</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel - Code Editor & Chat */}
        <div className="w-1/2 border-l flex flex-col">
          {/* Code Editor */}
          <div className="flex-1">
            <CodeEditor
              language={currentLanguage}
              code={currentCode}
              onChange={handleCodeChange}
              onLanguageChange={handleLanguageChange}
              onRun={handleRunCode}
              onSubmit={handleSubmitSolution}
              isReadOnly={!canParticipate}
              height="100%"
            />
          </div>

          {/* Chat */}
          <div className="h-64 border-t flex flex-col">
            <div className="p-3 border-b bg-muted/30">
              <h3 className="font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Battle Chat
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`text-sm ${
                    message.message_type === "system"
                      ? "text-center text-muted-foreground italic"
                      : ""
                  }`}
                >
                  {message.message_type !== "system" && (
                    <span className="font-medium text-primary">
                      {message.sender?.username}:
                    </span>
                  )}
                  <span className="ml-1">{message.message}</span>
                </div>
              ))}
            </div>
            
            {canParticipate && (
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-1 border rounded text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button size="sm" onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}