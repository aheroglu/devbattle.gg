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
  User,
  Trophy,
  Star,
  Code,
  Zap,
  TrendingUp,
  Medal,
  Target,
  Clock,
  ArrowLeft,
  Settings,
  Share2,
  Edit3,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage(props: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(props.params);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const [profile] = useState({
    username: username,
    avatar: "🥷",
    rank: 15,
    xp: "8547",
    badge: "EXPERT",
    joinDate: "15.02.2023",
    location: "San Francisco, CA",
    bio: "Full-stack developer passionate about algorithms and clean code. Love solving complex problems and learning new technologies.",
    languages: ["JavaScript", "Python", "React", "Node.js", "TypeScript"],
    stats: {
      battlesPlayed: 127,
      battlesWon: 89,
      winRate: 70,
      currentStreak: 8,
      longestStreak: 15,
      totalXP: "8547",
      averageRank: 12,
      favoriteLanguage: "JavaScript",
    },
    recentBattles: [
      {
        id: 1,
        title: "Array Manipulation Challenge",
        result: "won",
        xp: "+150",
        rank: 2,
        date: "2 hours ago",
        language: "JavaScript",
      },
      {
        id: 2,
        title: "Python Data Structures",
        result: "won",
        xp: "+200",
        rank: 1,
        date: "1 day ago",
        language: "Python",
      },
      {
        id: 3,
        title: "React Component Battle",
        result: "lost",
        xp: "+50",
        rank: 8,
        date: "2 days ago",
        language: "React",
      },
    ],
    achievements: [
      {
        name: "First Victory",
        description: "Win your first battle",
        icon: "🏆",
        unlocked: true,
      },
      {
        name: "Speed Demon",
        description: "Solve a problem in under 5 minutes",
        icon: "⚡",
        unlocked: true,
      },
      {
        name: "Streak Master",
        description: "Win 10 battles in a row",
        icon: "🔥",
        unlocked: true,
      },
      {
        name: "Language Explorer",
        description: "Use 5 different languages",
        icon: "🌍",
        unlocked: false,
      },
      {
        name: "Code Warrior",
        description: "Win 100 battles",
        icon: "⚔️",
        unlocked: false,
      },
      {
        name: "Legend",
        description: "Reach Legend rank",
        icon: "👑",
        unlocked: false,
      },
    ],
  });

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

      // Content animation
      const contentElements = document.querySelectorAll(".profile-content");
      gsap.fromTo(
        contentElements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
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

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      <div ref={pageRef} className="relative z-10 py-32">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div ref={headerRef} className="mb-8">
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
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  size="sm"
                  className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Header */}
            <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="text-center md:text-left">
                    <div className="text-8xl mb-4">{profile.avatar}</div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-green-400">
                        @{profile.username}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Badge
                          className={`${getBadgeColor(
                            profile.badge
                          )} rounded-full`}
                        >
                          {profile.badge}
                        </Badge>
                        <span className="text-gray-400">
                          Rank #{profile.rank}
                        </span>
                      </div>
                      <p className="text-gray-300 max-w-md">{profile.bio}</p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div
                    ref={statsRef}
                    className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {[
                      {
                        label: "Total XP",
                        value: profile.stats.totalXP.toLocaleString(),
                        icon: Star,
                        color: "text-yellow-400",
                      },
                      {
                        label: "Battles Won",
                        value: profile.stats.battlesWon,
                        icon: Trophy,
                        color: "text-green-400",
                      },
                      {
                        label: "Win Rate",
                        value: `${profile.stats.winRate}%`,
                        icon: Target,
                        color: "text-blue-400",
                      },
                      {
                        label: "Current Streak",
                        value: profile.stats.currentStreak,
                        icon: Zap,
                        color: "text-purple-400",
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-gray-900/50 p-4 rounded-xl border border-green-400/30 text-center"
                      >
                        <stat.icon
                          className={`h-6 w-6 mx-auto mb-2 ${stat.color}`}
                        />
                        <div className={`${stat.color} font-bold text-xl`}>
                          {stat.value}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mt-6 pt-6 border-t border-green-400/20">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-400 text-sm mr-2">
                      Languages:
                    </span>
                    {profile.languages.map((lang, i) => (
                      <Badge
                        key={i}
                        className="bg-gray-800/50 text-gray-300 border-gray-600/30 rounded-full text-xs"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "battles", label: "Recent Battles", icon: Code },
              { id: "achievements", label: "Achievements", icon: Medal },
              { id: "stats", label: "Statistics", icon: TrendingUp },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-green-500/20 text-green-400 border border-green-400/30"
                    : "text-gray-300 hover:text-green-400 hover:bg-green-400/10"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Profile Details */}
                <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Member Since</span>
                      <span className="text-gray-300">
                        {new Date(profile.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Location</span>
                      <span className="text-gray-300">{profile.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Favorite Language</span>
                      <span className="text-green-400">
                        {profile.stats.favoriteLanguage}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Average Rank</span>
                      <span className="text-blue-400">
                        #{profile.stats.averageRank}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400">
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Link href="/battles">
                      <Button className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl justify-start">
                        <Code className="h-4 w-4 mr-2" />
                        Join New Battle
                      </Button>
                    </Link>
                    <Button className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 rounded-xl justify-start">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Link href="/leaderboard">
                      <Button className="w-full bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 rounded-xl justify-start">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "battles" && (
              <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Code className="h-5 w-5 mr-2" />
                    Recent Battles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.recentBattles.map((battle) => (
                      <div
                        key={battle.id}
                        className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-green-400/20"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              battle.result === "won"
                                ? "bg-green-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                          <div>
                            <h4 className="text-gray-300 font-semibold">
                              {battle.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{battle.language}</span>
                              <span>•</span>
                              <span>Rank #{battle.rank}</span>
                              <span>•</span>
                              <span>{battle.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`font-bold ${
                              battle.result === "won"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {battle.result.toUpperCase()}
                          </div>
                          <div className="text-yellow-400 text-sm">
                            {battle.xp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "achievements" && (
              <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Medal className="h-5 w-5 mr-2" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.achievements.map((achievement, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          achievement.unlocked
                            ? "bg-green-500/10 border-green-400/30"
                            : "bg-gray-900/30 border-gray-600/30 opacity-50"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div>
                            <h4
                              className={`font-semibold ${
                                achievement.unlocked
                                  ? "text-green-400"
                                  : "text-gray-400"
                              }`}
                            >
                              {achievement.name}
                            </h4>
                            <p className="text-gray-400 text-sm">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "stats" && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Battle Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        label: "Total Battles",
                        value: profile.stats.battlesPlayed,
                      },
                      { label: "Battles Won", value: profile.stats.battlesWon },
                      { label: "Win Rate", value: `${profile.stats.winRate}%` },
                      {
                        label: "Current Streak",
                        value: profile.stats.currentStreak,
                      },
                      {
                        label: "Longest Streak",
                        value: profile.stats.longestStreak,
                      },
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-400">{stat.label}</span>
                        <span className="text-green-400 font-bold">
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        {
                          event: "Won JavaScript Battle",
                          time: "2 hours ago",
                          type: "win",
                        },
                        {
                          event: "Reached Expert Rank",
                          time: "1 week ago",
                          type: "achievement",
                        },
                        {
                          event: "10-win streak achieved",
                          time: "2 weeks ago",
                          type: "streak",
                        },
                        {
                          event: "First Python victory",
                          time: "1 month ago",
                          type: "win",
                        },
                      ].map((activity, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-3 p-2"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              activity.type === "win"
                                ? "bg-green-400"
                                : activity.type === "achievement"
                                ? "bg-yellow-400"
                                : "bg-purple-400"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <span className="text-gray-300 text-sm">
                              {activity.event}
                            </span>
                            <div className="text-gray-500 text-xs">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
