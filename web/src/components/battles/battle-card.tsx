import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Code, Users, Clock, Trophy, Play, Eye } from "lucide-react";
import { BattleSession } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface BattleCardProps {
  battle: BattleSession;
  onJoinClick: (battle: BattleSession) => void;
}

export function BattleCard({ battle, onJoinClick }: BattleCardProps) {
  const [participantCount, setParticipantCount] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [battleStartTime, setBattleStartTime] = useState<Date | null>(null);
  const [timeProgress, setTimeProgress] = useState(0);
  const supabase = createClientComponentClient();

  // Fetch initial participant count and setup realtime subscription
  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from("battle_participants")
        .select("user_id")
        .eq("battle_id", battle.id);

      if (!error && data) {
        setParticipantCount(data.length);
        const wasLive = isLive;
        const nowLive = data.length > 0;
        setIsLive(nowLive);

        // If battle just became live, set start time
        if (!wasLive && nowLive && !battleStartTime) {
          setBattleStartTime(new Date());
        }
        // If battle is no longer live, reset start time
        if (wasLive && !nowLive) {
          setBattleStartTime(null);
          setTimeProgress(0);
        }
      }
    };

    // Initial fetch
    fetchParticipants();

    // Setup realtime subscription
    const channel = supabase
      .channel(`battle-card-${battle.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_participants",
          filter: `battle_id=eq.${battle.id}`,
        },
        (payload) => {
          // Handle different event types with immediate state updates
          if (payload.eventType === "INSERT") {
            setParticipantCount((prev) => prev + 1);
            setIsLive(true);
            setTimeout(fetchParticipants, 100);
          } else if (payload.eventType === "DELETE") {
            setParticipantCount((prev) => {
              const newCount = Math.max(0, prev - 1);
              setIsLive(newCount > 0);
              return newCount;
            });
            setTimeout(fetchParticipants, 100);
          } else if (payload.eventType === "UPDATE") {
            fetchParticipants();
          } else {
            fetchParticipants();
          }
        }
      )
      .subscribe();

    // Backup polling in case realtime fails
    const pollInterval = setInterval(fetchParticipants, 30000); // Every 30 seconds

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [battle.id, supabase, isLive, battleStartTime]);

  // Timer effect for live battles progress
  useEffect(() => {
    if (!isLive || !battleStartTime) {
      return;
    }

    const timer = setInterval(() => {
      const now = new Date();
      const elapsed = now.getTime() - battleStartTime.getTime();
      const elapsedSeconds = elapsed / 1000;
      const progress = Math.min(
        (elapsedSeconds / battle.max_duration) * 100,
        100
      );

      setTimeProgress(progress);
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, [isLive, battleStartTime, battle.max_duration]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-400/30";
      case "starting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "waiting":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HARD":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <Card className="battle-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-2">
            {isLive && (
              <Badge className="bg-red-500/20 text-red-400 border-red-400/30 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                LIVE
              </Badge>
            )}
            <Badge
              className={`${
                isLive
                  ? "bg-gray-500/20 text-gray-400"
                  : "bg-green-500/20 text-green-400"
              } border-gray-400/30 rounded-full`}
            >
              {battle.session_type}
            </Badge>
          </div>
          <Badge
            className={`bg-gray-500/20 border-gray-400/30 rounded-full ${getDifficultyColor(
              battle.difficulty
            )}`}
          >
            {battle.difficulty}
          </Badge>
        </div>

        <CardTitle className="text-green-400 text-lg mb-2">
          {battle.title}
        </CardTitle>
        <p className="text-gray-300 text-sm mb-3">
          {battle.description || "No description available"}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className="flex items-center">
            <Code className="h-4 w-4 mr-1" />
            {battle.technologies.join(", ") || "Various"}
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {participantCount}/{battle.session_type === "SOLO" ? "1" : "2"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isLive
                  ? "bg-gradient-to-r from-red-400 to-orange-400"
                  : "bg-gradient-to-r from-green-400 to-blue-400"
              }`}
              style={{
                width: isLive
                  ? `${timeProgress}%`
                  : `${
                      (participantCount /
                        (battle.session_type === "SOLO" ? 1 : 2)) *
                      100
                    }%`,
              }}
            ></div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {battle.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg border border-gray-600/30"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Battle Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center text-green-400">
                <Trophy className="h-4 w-4 mr-1" />
                {battle.xp_reward} XP
              </span>
              <span className="flex items-center text-yellow-400">
                <Clock className="h-4 w-4 mr-1" />
                {Math.floor(battle.max_duration / 60)}m
              </span>
            </div>
            {/* <span className="text-xs text-gray-500">by {battle.created_by}</span> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          {isLive ? (
            <Button
              onClick={() => onJoinClick(battle)}
              className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/30 hover:border-red-400 transition-all duration-300 rounded-xl"
            >
              <Eye className="h-4 w-4 mr-2" />
              Watch Live
            </Button>
          ) : (
            <Button
              onClick={() => onJoinClick(battle)}
              className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl"
            >
              <Play className="h-4 w-4 mr-2" />
              Join Battle
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
