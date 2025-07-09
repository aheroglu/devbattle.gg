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
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  Search,
  Play,
  Eye,
  Award,
  Target,
  Zap,
  Crown,
  Gift,
  Timer,
  Code,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const router = useRouter();

  const [tournaments] = useState([
    {
      id: 1,
      title: "Weekly JavaScript Championship",
      description:
        "Master JavaScript algorithms and data structures in this intense weekly competition",
      status: "upcoming",
      startDate: "01.20.2025",
      startTime: "19:00 UTC",
      duration: "2 hours",
      participants: 247,
      maxParticipants: 500,
      prizePool: "10,000 XP",
      difficulty: "INTERMEDIATE",
      language: "JavaScript",
      format: "Single Elimination",
      rounds: 5,
      entryFee: "Free",
      organizer: "@tournamentMaster",
      tags: ["JavaScript", "Algorithms", "Weekly"],
      prizes: [
        { place: "1st", reward: "5,000 XP + Gold Badge", icon: "🥇" },
        { place: "2nd", reward: "3,000 XP + Silver Badge", icon: "🥈" },
        { place: "3rd", reward: "2,000 XP + Bronze Badge", icon: "🥉" },
      ],
    },
    {
      id: 2,
      title: "Python Masters Grand Prix",
      description:
        "The ultimate Python programming tournament for advanced developers",
      status: "live",
      startDate: "01.15.2025",
      startTime: "18:00 UTC",
      duration: "3 hours",
      participants: 128,
      maxParticipants: 128,
      prizePool: "25,000 XP",
      difficulty: "ADVANCED",
      language: "Python",
      format: "Swiss System",
      rounds: 7,
      entryFee: "500 XP",
      organizer: "@pythonGuru",
      tags: ["Python", "Advanced", "Grand Prix"],
      prizes: [
        { place: "1st", reward: "15,000 XP + Legend Badge", icon: "👑" },
        { place: "2nd", reward: "7,000 XP + Master Badge", icon: "🏆" },
        { place: "3rd", reward: "3,000 XP + Expert Badge", icon: "⭐" },
      ],
    },
    {
      id: 3,
      title: "React Component Challenge",
      description:
        "Build amazing React components under pressure in this creative tournament",
      status: "upcoming",
      startDate: "01.25.2025",
      startTime: "20:00 UTC",
      duration: "90 minutes",
      participants: 89,
      maxParticipants: 200,
      prizePool: "15,000 XP",
      difficulty: "EXPERT",
      language: "React",
      format: "Round Robin",
      rounds: 4,
      entryFee: "Free",
      organizer: "@reactMaster",
      tags: ["React", "Components", "Creative"],
      prizes: [
        { place: "1st", reward: "8,000 XP + React Master Badge", icon: "⚛️" },
        { place: "2nd", reward: "5,000 XP + Component Expert", icon: "🎨" },
        { place: "3rd", reward: "2,000 XP + UI Specialist", icon: "💎" },
      ],
    },
    {
      id: 4,
      title: "Algorithm Speed Run Championship",
      description:
        "Solve algorithms as fast as possible in this high-speed tournament",
      status: "completed",
      startDate: "01.10.2025",
      startTime: "17:00 UTC",
      duration: "1 hour",
      participants: 156,
      maxParticipants: 200,
      prizePool: "12,000 XP",
      difficulty: "INTERMEDIATE",
      language: "Any",
      format: "Time Attack",
      rounds: 10,
      entryFee: "Free",
      organizer: "@speedCoder",
      tags: ["Algorithms", "Speed", "Championship"],
      winner: "@lightningCoder",
      prizes: [
        { place: "1st", reward: "6,000 XP + Speed Demon Badge", icon: "⚡" },
        { place: "2nd", reward: "4,000 XP + Quick Solver", icon: "🚀" },
        { place: "3rd", reward: "2,000 XP + Fast Fingers", icon: "💨" },
      ],
    },
  ]);

  const [leaderboard] = useState([
    {
      rank: 1,
      name: "@tournamentKing",
      avatar: "👑",
      wins: 15,
      points: 45000,
      badge: "LEGEND",
    },
    {
      rank: 2,
      name: "@codeChampion",
      avatar: "🏆",
      wins: 12,
      points: 38000,
      badge: "MASTER",
    },
    {
      rank: 3,
      name: "@algorithmAce",
      avatar: "⭐",
      wins: 9,
      points: 32000,
      badge: "EXPERT",
    },
    {
      rank: 4,
      name: "@speedDemon",
      avatar: "⚡",
      wins: 8,
      points: 28000,
      badge: "EXPERT",
    },
    {
      rank: 5,
      name: "@codeNinja",
      avatar: "🥷",
      wins: 7,
      points: 25000,
      badge: "EXPERT",
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

      // Tournament cards animation
      const tournamentCards = document.querySelectorAll(".tournament-card");
      gsap.fromTo(
        tournamentCards,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          delay: 1.2,
          ease: "back.out(1.7)",
        }
      );

      // Card hover animations
      tournamentCards.forEach((card) => {
        const cardElement = card as HTMLElement;
        cardElement.addEventListener("mouseenter", () => {
          gsap.to(card, {
            y: -10,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
          });
        });
        cardElement.addEventListener("mouseleave", () => {
          gsap.to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
        });
      });
    };

    loadGSAP();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500/20 text-red-400 border-red-400/30";
      case "upcoming":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      case "completed":
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "text-green-400";
      case "INTERMEDIATE":
        return "text-yellow-400";
      case "ADVANCED":
        return "text-orange-400";
      case "EXPERT":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "LEGEND":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "MASTER":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30";
      case "EXPERT":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesTab = activeTab === "all" || tournament.status === activeTab;
    const matchesSearch = tournament.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "all" ||
      tournament.difficulty.toLowerCase() === selectedFilter;
    return matchesTab && matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      <div ref={pageRef} className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
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
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
              {"// "} TOURNAMENTS
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Compete in epic coding tournaments and claim your glory
            </p>

            {/* Tournament Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                {
                  label: "Active Tournaments",
                  value: "8",
                  icon: "🏆",
                  color: "text-yellow-400",
                },
                {
                  label: "Total Participants",
                  value: "1.2K",
                  icon: "👥",
                  color: "text-blue-400",
                },
                {
                  label: "Prize Pool",
                  value: "150K XP",
                  icon: "💎",
                  color: "text-green-400",
                },
                {
                  label: "Champions",
                  value: "247",
                  icon: "👑",
                  color: "text-purple-400",
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

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {[
              { id: "upcoming", label: "Upcoming", icon: Calendar },
              { id: "live", label: "Live", icon: Play },
              { id: "completed", label: "Completed", icon: Trophy },
              { id: "leaderboard", label: "Champions", icon: Crown },
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

          {/* Content Area */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeTab !== "leaderboard" && (
                <>
                  {/* Search and Filters */}
                  <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl mb-6">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search tournaments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                          />
                        </div>

                        {/* Difficulty Filter */}
                        <select
                          value={selectedFilter}
                          onChange={(e) => setSelectedFilter(e.target.value)}
                          className="bg-gray-900/50 border border-green-400/20 rounded-xl px-4 py-3 text-green-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                        >
                          <option value="all">All Difficulties</option>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tournament Cards */}
                  <div className="space-y-6">
                    {filteredTournaments.map((tournament) => (
                      <Card
                        key={tournament.id}
                        className="tournament-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden"
                      >
                        <CardHeader className="relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Badge
                                className={`${getStatusColor(
                                  tournament.status
                                )} rounded-full`}
                              >
                                {tournament.status === "live" && (
                                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                                )}
                                {tournament.status.toUpperCase()}
                              </Badge>
                              <Badge
                                className={`bg-gray-500/20 border-gray-400/30 rounded-full ${getDifficultyColor(
                                  tournament.difficulty
                                )}`}
                              >
                                {tournament.difficulty}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <div className="text-yellow-400 font-bold text-lg">
                                {tournament.prizePool}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Prize Pool
                              </div>
                            </div>
                          </div>

                          <CardTitle className="text-2xl font-bold text-green-400 mb-2">
                            {tournament.title}
                          </CardTitle>
                          <p className="text-gray-300 mb-4">
                            {tournament.description}
                          </p>

                          {/* Tournament Info Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                              <div className="text-blue-400 font-semibold text-sm">
                                {tournament.startDate}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {tournament.startTime}
                              </div>
                            </div>
                            <div className="text-center">
                              <Users className="h-5 w-5 mx-auto mb-1 text-green-400" />
                              <div className="text-green-400 font-semibold text-sm">
                                {tournament.participants}/
                                {tournament.maxParticipants}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Participants
                              </div>
                            </div>
                            <div className="text-center">
                              <Clock className="h-5 w-5 mx-auto mb-1 text-purple-400" />
                              <div className="text-purple-400 font-semibold text-sm">
                                {tournament.duration}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Duration
                              </div>
                            </div>
                            <div className="text-center">
                              <Code className="h-5 w-5 mx-auto mb-1 text-orange-400" />
                              <div className="text-orange-400 font-semibold text-sm">
                                {tournament.language}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Language
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tournament.tags.map((tag, i) => (
                              <Badge
                                key={i}
                                className="bg-gray-800/50 text-gray-300 border-gray-600/30 rounded-full text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>

                        <CardContent>
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                                style={{
                                  width: `${
                                    (tournament.participants /
                                      tournament.maxParticipants) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          {/* Prizes */}
                          <div className="mb-6">
                            <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                              <Gift className="h-4 w-4 mr-2" />
                              Prizes
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {tournament.prizes.map((prize, i) => (
                                <div
                                  key={i}
                                  className="text-center p-2 bg-gray-900/30 rounded-lg"
                                >
                                  <div className="text-lg mb-1">
                                    {prize.icon}
                                  </div>
                                  <div className="text-xs text-gray-400 mb-1">
                                    {prize.place}
                                  </div>
                                  <div className="text-xs text-green-400 font-semibold">
                                    {prize.reward}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tournament Details */}
                          <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span>Format: {tournament.format}</span>
                              <span>•</span>
                              <span>Rounds: {tournament.rounds}</span>
                              <span>•</span>
                              <span>Entry: {tournament.entryFee}</span>
                            </div>
                            <span>by {tournament.organizer}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            {tournament.status === "upcoming" && (
                              <Button className="flex-1 bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl">
                                <Trophy className="h-4 w-4 mr-2" />
                                Register Now
                              </Button>
                            )}
                            {tournament.status === "live" && (
                              <Button className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/30 hover:border-red-400 transition-all duration-300 rounded-xl">
                                <Eye className="h-4 w-4 mr-2" />
                                Watch Live
                              </Button>
                            )}
                            {tournament.status === "completed" && (
                              <Button className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 rounded-xl">
                                <Award className="h-4 w-4 mr-2" />
                                View Results
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </div>

                          {tournament.status === "completed" &&
                            tournament.winner && (
                              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
                                <div className="flex items-center space-x-2">
                                  <Crown className="h-5 w-5 text-yellow-400" />
                                  <span className="text-yellow-400 font-semibold">
                                    Champion: {tournament.winner}
                                  </span>
                                </div>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}

              {/* Champions Leaderboard */}
              {activeTab === "leaderboard" && (
                <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-2xl text-center flex items-center justify-center">
                      <Crown className="h-6 w-6 mr-2" />
                      Tournament Champions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map((champion) => (
                        <div
                          key={champion.rank}
                          className="flex items-center justify-between p-6 bg-gray-900/30 rounded-xl border border-green-400/20 hover:border-green-400/50 transition-all duration-300"
                        >
                          <div className="flex items-center space-x-6">
                            {/* Rank */}
                            <div className="text-center min-w-[60px]">
                              <div className="text-2xl font-bold">
                                {champion.rank === 1 ? (
                                  "🥇"
                                ) : champion.rank === 2 ? (
                                  "🥈"
                                ) : champion.rank === 3 ? (
                                  "🥉"
                                ) : (
                                  <span className="text-gray-500">
                                    #{champion.rank}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Champion Info */}
                            <div className="flex items-center space-x-4">
                              <div className="text-3xl">{champion.avatar}</div>
                              <div>
                                <div className="flex items-center space-x-3">
                                  <Link
                                    href="/profile"
                                    className="text-blue-400 hover:text-blue-300 font-bold text-lg transition-colors duration-300"
                                  >
                                    {champion.name}
                                  </Link>
                                  <Badge
                                    className={`${getBadgeColor(
                                      champion.badge
                                    )} rounded-full text-xs`}
                                  >
                                    {champion.badge}
                                  </Badge>
                                </div>
                                <div className="text-gray-400 text-sm">
                                  Tournament Champion
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center space-x-8">
                            <div className="text-center">
                              <div className="text-yellow-400 font-bold text-xl">
                                {champion.wins}
                              </div>
                              <div className="text-gray-400 text-xs">Wins</div>
                            </div>
                            <div className="text-center">
                              <div className="text-green-400 font-bold text-xl">
                                {champion.points.toLocaleString()}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Points
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      label: "Your Tournaments",
                      value: "12",
                      color: "text-blue-400",
                    },
                    { label: "Wins", value: "3", color: "text-green-400" },
                    {
                      label: "Win Rate",
                      value: "25%",
                      color: "text-yellow-400",
                    },
                    {
                      label: "Total XP Won",
                      value: "8.5K",
                      color: "text-purple-400",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">
                        {stat.label}
                      </span>
                      <span className={`${stat.color} font-bold`}>
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg flex items-center">
                    <Timer className="h-5 w-5 mr-2" />
                    Next Events
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "JS Championship",
                      time: "2 days",
                      participants: "247/500",
                    },
                    {
                      name: "Python Masters",
                      time: "5 days",
                      participants: "89/200",
                    },
                    {
                      name: "React Challenge",
                      time: "1 week",
                      participants: "156/300",
                    },
                  ].map((event, i) => (
                    <div key={i} className="p-3 bg-gray-900/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-green-400 text-sm font-semibold">
                          {event.name}
                        </span>
                        <span className="text-yellow-400 text-xs">
                          {event.time}
                        </span>
                      </div>
                      <div className="text-gray-400 text-xs">
                        {event.participants} registered
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Tournament Tips */}
              <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Practice algorithms daily to improve your speed",
                    "Study past tournament problems",
                    "Join practice battles before tournaments",
                    "Master your preferred programming language",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{tip}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
