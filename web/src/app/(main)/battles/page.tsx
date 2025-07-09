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
  Code,
  Users,
  Clock,
  Trophy,
  Zap,
  Search,
  Play,
  Eye,
  ArrowLeft,
} from "lucide-react";

export default function BattlesPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState([
    {
      id: "1",
      title: "JavaScript Array Masters",
      description: "Solve complex array manipulation problems",
      difficulty: "INTERMEDIATE",
      language: "JavaScript",
      participants: 24,
      maxParticipants: 50,
      timeLeft: "5m 23s",
      prize: "500 XP",
      status: "waiting",
      creator: "@arrayNinja",
      tags: ["Arrays", "Algorithms", "ES6"],
    },
    {
      id: "2",
      title: "Python Data Structures Showdown",
      description: "Master Python's built-in data structures",
      difficulty: "ADVANCED",
      language: "Python",
      participants: 18,
      maxParticipants: 30,
      timeLeft: "2m 45s",
      prize: "750 XP",
      status: "starting",
      creator: "@pythonMaster",
      tags: ["Data Structures", "Python", "OOP"],
    },
    {
      id: "3",
      title: "React Component Challenge",
      description: "Build responsive React components",
      difficulty: "EXPERT",
      language: "React",
      participants: 12,
      maxParticipants: 20,
      timeLeft: "Live",
      prize: "1000 XP",
      status: "live",
      creator: "@reactGuru",
      tags: ["React", "Components", "Hooks"],
    },
    {
      id: "4",
      title: "Algorithm Speed Run",
      description: "Solve algorithms as fast as possible",
      difficulty: "INTERMEDIATE",
      language: "Any",
      participants: 35,
      maxParticipants: 100,
      timeLeft: "12m 18s",
      prize: "600 XP",
      status: "waiting",
      creator: "@speedCoder",
      tags: ["Algorithms", "Speed", "Logic"],
    },
  ]);

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Header animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
        );
      }

      // Filters animation
      if (filtersRef.current) {
        gsap.fromTo(
          filtersRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            delay: 0.8,
            ease: "power2.out",
          }
        );
      }

      // Battle cards animation
      const battleCards = document.querySelectorAll(".battle-card");
      gsap.fromTo(
        battleCards,
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
      battleCards.forEach((card) => {
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

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      <div ref={pageRef} className="relative z-10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div ref={headerRef} className="text-center mb-12">
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </Link>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {"// "} ACTIVE_BATTLES
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join live coding battles and compete with developers worldwide
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { label: "Live Battles", value: "3", icon: "🔥" },
                { label: "Waiting", value: "8", icon: "⏳" },
                { label: "Online", value: "247", icon: "👨‍💻" },
                { label: "Total XP", value: "15.2K", icon: "⭐" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 p-3 rounded-xl border border-green-400/30 backdrop-blur-sm"
                >
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-green-400 font-bold">{stat.value}</div>
                  <div className="text-gray-400 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters and Search */}
          <div ref={filtersRef} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search battles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                {["all", "live", "starting", "waiting"].map((filterType) => (
                  <Button
                    key={filterType}
                    variant={filter === filterType ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(filterType)}
                    className={`rounded-xl transition-all duration-300 ${
                      filter === filterType
                        ? "bg-green-500/20 text-green-400 border border-green-400/30"
                        : "text-gray-300 hover:text-green-400 hover:bg-green-400/10"
                    }`}
                  >
                    {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Battle Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {battles.map((battle, i) => (
              <Card
                key={battle.id}
                className="battle-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      className={`${getStatusColor(
                        battle.status
                      )} rounded-full`}
                    >
                      {battle.status === "live" && (
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                      )}
                      {battle.status.toUpperCase()}
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
                    {battle.description}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <Code className="h-4 w-4 mr-1" />
                      {battle.language}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {battle.participants}/{battle.maxParticipants}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          (battle.participants / battle.maxParticipants) * 100
                        }%`,
                      }}
                    ></div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {battle.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-lg border border-gray-600/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Battle Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center text-green-400">
                        <Trophy className="h-4 w-4 mr-1" />
                        {battle.prize}
                      </span>
                      <span className="flex items-center text-yellow-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {battle.timeLeft}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      by {battle.creator}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {battle.status === "live" ? (
                      <Link href={`/battle/${battle.id}`} className="flex-1">
                        <Button className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/30 hover:border-red-400 transition-all duration-300 rounded-xl">
                          <Eye className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/battle/${battle.id}`} className="flex-1">
                        <Button className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl">
                          <Play className="h-4 w-4 mr-2" />
                          Join Battle
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Battle Button */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/25"
            >
              <Zap className="mr-2 h-5 w-5" />
              Create New Battle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
