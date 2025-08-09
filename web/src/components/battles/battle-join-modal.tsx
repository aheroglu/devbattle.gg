"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/ui/dialog";
import { Badge } from "@/components/shared/ui/badge";
import { Users, Trophy, Clock, Play, X, Code, User, Eye } from "lucide-react";
import { BattleSession } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface BattleJoinModalProps {
  battle: BattleSession | null;
  open: boolean;
  onClose: () => void;
}

export function BattleJoinModal({
  battle,
  open,
  onClose,
}: BattleJoinModalProps) {
  const [isJoining, setIsJoining] = useState(false);
  const [battleIsLive, setBattleIsLive] = useState(false);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Check if battle is live when modal opens
  useEffect(() => {
    const checkBattleStatus = async () => {
      if (!battle || !open) return;
      
      try {
        const { data: solverExists } = await supabase
          .from("battle_participants")
          .select("id")
          .eq("battle_id", battle.id)
          .eq("role", "SOLVER")
          .single();
          
        setBattleIsLive(!!solverExists);
      } catch (error) {
        console.error("Error checking battle status:", error);
        setBattleIsLive(false);
      }
    };
    
    checkBattleStatus();
  }, [battle, open, supabase]);

  if (!battle) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "hard":
        return "bg-red-500/20 text-red-400 border-red-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const handleJoinBattle = async () => {
    setIsJoining(true);

    try {
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Redirect to login with current page as redirect
        router.push(`/auth/login?redirect=/battle/${battle.id}`);
        return;
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from("battle_participants")
        .select("id, role")
        .eq("battle_id", battle.id)
        .eq("user_id", session.user.id)
        .single();

      // If not already a participant, determine their role and add them
      if (!existingParticipant) {
        console.log("User is not a participant, determining role...");
        
        // Check if there's already a SOLVER in this battle
        const { data: existingSolver } = await supabase
          .from("battle_participants")
          .select("id, role")
          .eq("battle_id", battle.id)
          .eq("role", "SOLVER")
          .single();

        // Determine user role: SOLVER if no solver exists, SPECTATOR otherwise
        const userRole = existingSolver ? "SPECTATOR" : "SOLVER";
        
        console.log(`Assigning role: ${userRole} (existing solver: ${!!existingSolver})`);

        const { error: participantError } = await supabase
          .from("battle_participants")
          .insert({
            battle_id: battle.id,
            user_id: session.user.id,
            result: "PENDING",
            xp_earned: 0,
            submitted_at: null,
            role: userRole,
          });

        if (participantError) {
          console.error("Error joining battle:", participantError);
          throw new Error("Failed to join battle");
        }
      }

      // User is authenticated and joined, proceed to battle page
      router.push(`/battle/${battle.id}`);
    } catch (error) {
      console.error("Error joining battle:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/95 border-green-400/30 text-white backdrop-blur-sm fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-green-400">
              {battle.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Battle Info Header */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge className={getDifficultyColor(battle.difficulty)}>
                {battle.difficulty}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                {battle.session_type === "SOLO" ? (
                  <User className="w-3 h-3 mr-1" />
                ) : (
                  <Users className="w-3 h-3 mr-1" />
                )}
                {battle.session_type}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-bold text-xl">
                {battle.xp_reward} XP
              </div>
              <div className="text-gray-400 text-sm">Reward</div>
            </div>
          </div>

          {/* Description */}
          {battle.description && (
            <div className="bg-gray-900/50 p-4 rounded-xl border border-green-400/20">
              <h3 className="text-green-400 font-semibold mb-2">Description</h3>
              <p className="text-gray-300">{battle.description}</p>
            </div>
          )}

          {/* Battle Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-blue-400 font-bold">0/20</div>
              <div className="text-gray-400 text-sm">Participants</div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="text-yellow-400 font-bold">
                {Math.floor(battle.max_duration / 60)}m
              </div>
              <div className="text-gray-400 text-sm">Duration</div>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-600/30 text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-5 w-5 text-green-400" />
              </div>
              <div className="text-green-400 font-bold">{battle.xp_reward}</div>
              <div className="text-gray-400 text-sm">XP Reward</div>
            </div>
          </div>

          {/* Technologies */}
          <div className="bg-gray-900/50 p-4 rounded-xl border border-green-400/20">
            <h3 className="text-green-400 font-semibold mb-3 flex items-center">
              <Code className="h-4 w-4 mr-2" />
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {battle.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800/50 text-gray-300 text-sm rounded-lg border border-gray-600/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Join Button */}
          <div className="pt-4">
            <Button
              onClick={handleJoinBattle}
              disabled={isJoining}
              className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 text-lg py-6 rounded-xl transition-all duration-300"
              size="lg"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Joining...
                </>
              ) : (
                <>
                  {battleIsLive ? (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Watch Live
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {battle.session_type === "SOLO"
                        ? "Start Challenge"
                        : "Join Battle"}
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Info Text */}
          <div className="text-center text-gray-400 text-sm">
            <p>
              You will be redirected to the coding environment after joining.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
