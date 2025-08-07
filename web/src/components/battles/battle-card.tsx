import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Code, Users, Clock, Trophy, Play } from "lucide-react";
import { BattleSession } from "@/types";

interface BattleCardProps {
  battle: BattleSession;
  onJoinClick: (battle: BattleSession) => void;
}

export function BattleCard({ battle, onJoinClick }: BattleCardProps) {
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
    <Card className="battle-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden">
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-green-500/20 text-green-400 border-green-400/30 rounded-full">
            OPEN
          </Badge>
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
            0/20
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
            style={{ width: "0%" }}
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

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onJoinClick(battle)}
            className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl"
          >
            <Play className="h-4 w-4 mr-2" />
            Join Battle
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
