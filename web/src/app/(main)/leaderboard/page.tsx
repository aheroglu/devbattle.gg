"use client";

import { useState, useEffect, useRef } from "react";
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
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Filter,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("all-time");
  const [category, setCategory] = useState("overall");
  const router = useRouter();

  const [leaderboard] = useState([
    {
      rank: 1,
      name: "codeWizard_99",
      avatar: "🧙‍♂️",
      xp: "15847",
      badge: "LEGEND",
      battlesWon: 127,
      winRate: 89,
      streak: 12,
      trend: "up",
      trendValue: "+127",
      languages: ["JavaScript", "Python", "React"],
      joinDate: "01.15.2023",
    },
    {
      rank: 2,
      name: "algorithmQueen",
      avatar: "👑",
      xp: "14203",
      badge: "MASTER",
      battlesWon: 89,
      winRate: 85,
      streak: 8,
      trend: "up",
      trendValue: "+89",
      languages: ["Python", "Java", "C++"],
      joinDate: "02.20.2023",
    },
    {
      rank: 3,
      name: "debugHunter",
      avatar: "🔍",
      xp: "13956",
      badge: "MASTER",
      battlesWon: 156,
      winRate: 78,
      streak: 5,
      trend: "up",
      trendValue: "+156",
      languages: ["JavaScript", "TypeScript", "Go"],
      joinDate: "01.08.2023",
    },
    {
      rank: 4,
      name: "syntaxNinja",
      avatar: "🥷",
      xp: "12734",
      badge: "EXPERT",
      battlesWon: 43,
      winRate: 92,
      streak: 15,
      trend: "up",
      trendValue: "+43",
      languages: ["Rust", "C++", "Assembly"],
      joinDate: "03.12.2023",
    },
    {
      rank: 5,
      name: "loopBreaker",
      avatar: "🔄",
      xp: "11892",
      badge: "EXPERT",
      battlesWon: 78,
      winRate: 81,
      streak: 3,
      trend: "down",
      trendValue: "-12",
      languages: ["Python", "JavaScript", "Ruby"],
      joinDate: "02.05.2023",
    },
  ]);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");

      // Header animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
        );
      }

      // Stats animation
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          { opacity: 0, y: 30, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            delay: 0.8,
            ease: "power2.out",
          }
        );
      }

      // Leaderboard entries animation
      const entries = document.querySelectorAll(".leaderboard-entry");
      gsap.fromTo(
        entries,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          delay: 1.2,
          ease: "power2.out",
        }
      );
    };

    loadGSAP();
  }, []);

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "LEGEND":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "MASTER":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30";
      case "EXPERT":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      case "CODER":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      <div ref={pageRef} className="relative z-10 pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div ref={headerRef} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
                {"// "} LEADERBOARD
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Top developers competing in coding battles
              </p>
            </div>

            {/* Global Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                {
                  label: "Total Battles",
                  value: "2,847",
                  icon: "⚔️",
                  color: "text-red-400",
                },
                {
                  label: "Active Players",
                  value: "1,247",
                  icon: "👨‍💻",
                  color: "text-blue-400",
                },
                {
                  label: "XP Awarded",
                  value: "847K",
                  icon: "⭐",
                  color: "text-yellow-400",
                },
                {
                  label: "Languages",
                  value: "12",
                  icon: "💻",
                  color: "text-green-400",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 p-4 rounded-xl border border-green-400/30 backdrop-blur-sm"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className={`${stat.color} font-bold text-lg`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex gap-2">
              <span className="text-gray-400 text-sm flex items-center mr-4">
                <Calendar className="h-4 w-4 mr-2" />
                Timeframe:
              </span>
              {["all-time", "monthly", "weekly", "daily"].map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className={`rounded-xl transition-all duration-300 ${
                    timeframe === period
                      ? "bg-green-500/20 text-green-400 border border-green-400/30"
                      : "text-gray-300 hover:text-green-400 hover:bg-green-400/10"
                  }`}
                >
                  {period.charAt(0).toUpperCase() +
                    period.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <span className="text-gray-400 text-sm flex items-center mr-4">
                <Filter className="h-4 w-4 mr-2" />
                Category:
              </span>
              {["overall", "javascript", "python", "react"].map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCategory(cat)}
                  className={`rounded-xl transition-all duration-300 ${
                    category === cat
                      ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                      : "text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-green-400 text-2xl text-center flex items-center justify-center">
                <Trophy className="h-6 w-6 mr-2" />
                Top Developers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {leaderboard.map((player, i) => (
                  <div
                    key={player.rank}
                    className={`leaderboard-entry flex items-center justify-between p-6 transition-all duration-300 hover:bg-gray-900/30 cursor-pointer ${
                      i < leaderboard.length - 1
                        ? "border-b border-green-400/10"
                        : ""
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      {/* Rank */}
                      <div className="text-center min-w-[60px]">
                        <div className="text-2xl font-bold">
                          {player.rank <= 3 ? (
                            getRankIcon(player.rank)
                          ) : (
                            <span
                              className={`
                              ${
                                player.rank === 1
                                  ? "text-yellow-400"
                                  : player.rank === 2
                                  ? "text-gray-300"
                                  : player.rank === 3
                                  ? "text-orange-400"
                                  : "text-gray-500"
                              }
                            `}
                            >
                              #{player.rank}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{player.avatar}</div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <Link
                              href="/profile"
                              className="text-blue-400 hover:text-blue-300 font-bold text-lg transition-colors duration-300"
                            >
                              @{player.name}
                            </Link>
                            <Badge
                              className={`${getBadgeColor(
                                player.badge
                              )} rounded-full text-xs`}
                            >
                              {player.badge}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                            <span>Joined {player.joinDate}</span>
                            <span>•</span>
                            <span>{player.languages.join(", ")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8">
                      {/* XP */}
                      <div className="text-center">
                        <div className="text-green-400 font-bold text-xl">
                          {player.xp.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-xs">XP</div>
                      </div>

                      {/* Battles Won */}
                      <div className="text-center">
                        <div className="text-yellow-400 font-bold text-lg">
                          {player.battlesWon}
                        </div>
                        <div className="text-gray-400 text-xs">Wins</div>
                      </div>

                      {/* Win Rate */}
                      <div className="text-center">
                        <div className="text-blue-400 font-bold text-lg">
                          {player.winRate}%
                        </div>
                        <div className="text-gray-400 text-xs">Win Rate</div>
                      </div>

                      {/* Streak */}
                      <div className="text-center">
                        <div className="text-purple-400 font-bold text-lg flex items-center">
                          <Zap className="h-4 w-4 mr-1" />
                          {player.streak}
                        </div>
                        <div className="text-gray-400 text-xs">Streak</div>
                      </div>

                      {/* Trend */}
                      <div className="text-center">
                        <div
                          className={`font-bold text-lg flex items-center ${
                            player.trend === "up"
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {player.trend === "up" ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {player.trendValue}
                        </div>
                        <div className="text-gray-400 text-xs">This Week</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
            >
              <Users className="h-4 w-4 mr-2" />
              Load More Players
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
