"use client";

import { useState, useEffect } from "react";
import { battleService } from "@/lib/battle-service";
import { Battle } from "@/types";
import { Button } from "@/components/shared/ui/button";
import { Badge } from "@/components/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/shared/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs";
import { 
  Swords, 
  Users, 
  Clock, 
  Trophy,
  Play,
  Eye,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function BattleList() {
  const { user } = useAuth();
  const [availableBattles, setAvailableBattles] = useState<Battle[]>([]);
  const [userBattles, setUserBattles] = useState<Battle[]>([]);
  const [liveBattles, setLiveBattles] = useState<Battle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    loadBattles();
  }, [user]);

  const loadBattles = async () => {
    try {
      setIsLoading(true);
      
      const [available, live] = await Promise.all([
        battleService.findAvailableBattles(20),
        battleService.getLiveBattles(20)
      ]);
      
      setAvailableBattles(available);
      setLiveBattles(live);
      
      if (user) {
        const userHistory = await battleService.getUserBattles(user.id, 20);
        setUserBattles(userHistory);
      }
    } catch (error) {
      console.error("Error loading battles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickMatch = async (difficulty?: 'easy' | 'medium' | 'hard') => {
    try {
      const battleId = await battleService.quickMatch(difficulty);
      window.location.href = `/battle/${battleId}`;
    } catch (error) {
      console.error("Error creating quick match:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "text-yellow-600";
      case "active": return "text-green-600";
      case "completed": return "text-blue-600";
      default: return "text-gray-600";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Loading battles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Swords className="w-8 h-8" />
            Battles
          </h1>
          <p className="text-muted-foreground mt-2">
            Challenge developers in real-time coding battles
          </p>
        </div>

        {/* Quick Match Buttons */}
        <div className="flex gap-2">
          <Button onClick={() => handleQuickMatch()} className="gap-2">
            <Play className="w-4 h-4" />
            Quick Match
          </Button>
          <Button variant="outline" onClick={() => handleQuickMatch("easy")} className="gap-2">
            Easy
          </Button>
          <Button variant="outline" onClick={() => handleQuickMatch("medium")} className="gap-2">
            Medium
          </Button>
          <Button variant="outline" onClick={() => handleQuickMatch("hard")} className="gap-2">
            Hard
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="available">Available ({availableBattles.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({liveBattles.length})</TabsTrigger>
          <TabsTrigger value="history">My Battles ({userBattles.length})</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {availableBattles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Swords className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No battles available</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a battle or wait for others to join!
                </p>
                <Button onClick={() => handleQuickMatch()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Battle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableBattles.map((battle) => (
                <Card key={battle.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{battle.problem?.title}</CardTitle>
                      <Badge 
                        variant={battle.problem?.difficulty === "easy" ? "secondary" : 
                                battle.problem?.difficulty === "medium" ? "default" : "destructive"}
                      >
                        {battle.problem?.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(battle.created_at)}</span>
                      <Badge variant="outline" className="ml-auto">
                        {battle.battle_mode}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Player 1 */}
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={battle.player1?.avatar_url || ""} />
                          <AvatarFallback>
                            {battle.player1?.username?.[0]?.toUpperCase() || "P1"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{battle.player1?.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Level {battle.player1?.level || 1}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Win Rate</p>
                          <p className="text-sm font-medium">
                            {battle.player1?.win_rate?.toFixed(1) || "0.0"}%
                          </p>
                        </div>
                      </div>

                      <div className="text-center py-2">
                        <span className="text-sm text-muted-foreground">vs</span>
                      </div>

                      {/* Player 2 Slot */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 border-2 border-dashed border-muted-foreground rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-muted-foreground">
                            Waiting for opponent...
                          </p>
                        </div>
                      </div>

                      <Link href={`/battle/${battle.id}`}>
                        <Button className="w-full" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Join Battle
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {liveBattles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No live battles</h3>
                <p className="text-muted-foreground">
                  No battles are currently in progress. Check back later!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveBattles.map((battle) => (
                <Card key={battle.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{battle.problem?.title}</CardTitle>
                      <Badge variant="default" className="bg-green-500">
                        <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />
                        LIVE
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Players */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={battle.player1?.avatar_url || ""} />
                            <AvatarFallback className="text-xs">
                              {battle.player1?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {battle.player1?.username}
                          </span>
                        </div>
                        
                        <span className="text-xs text-muted-foreground">VS</span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {battle.player2?.username}
                          </span>
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={battle.player2?.avatar_url || ""} />
                            <AvatarFallback className="text-xs">
                              {battle.player2?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>

                      <Link href={`/battle/${battle.id}`}>
                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Spectate
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {!user ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground">
                  Please login to view your battle history.
                </p>
              </CardContent>
            </Card>
          ) : userBattles.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No battles yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start your first battle to see your history here!
                </p>
                <Button onClick={() => handleQuickMatch()}>
                  <Play className="w-4 h-4 mr-2" />
                  Start First Battle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userBattles.map((battle) => (
                <Card key={battle.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {battle.winner_id === user?.id ? (
                            <Trophy className="w-5 h-5 text-yellow-500" />
                          ) : battle.winner_id ? (
                            <div className="w-5 h-5 bg-gray-300 rounded" />
                          ) : (
                            <Clock className="w-5 h-5 text-gray-400" />
                          )}
                          <span className="font-medium">{battle.problem?.title}</span>
                        </div>
                        
                        <Badge 
                          variant={battle.problem?.difficulty === "easy" ? "secondary" : 
                                  battle.problem?.difficulty === "medium" ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {battle.problem?.difficulty}
                        </Badge>
                        
                        <span className={`text-sm font-medium ${getStatusColor(battle.status)}`}>
                          {battle.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(battle.created_at)}
                        </span>
                        
                        <Link href={`/battle/${battle.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Battle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Battle Creation</h3>
                <p className="text-muted-foreground mb-6">
                  Create custom battles with specific problems and settings.
                </p>
                <div className="space-y-2">
                  <Button onClick={() => handleQuickMatch("easy")} variant="outline" className="w-full">
                    Easy Battle
                  </Button>
                  <Button onClick={() => handleQuickMatch("medium")} variant="outline" className="w-full">
                    Medium Battle
                  </Button>
                  <Button onClick={() => handleQuickMatch("hard")} variant="outline" className="w-full">
                    Hard Battle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}