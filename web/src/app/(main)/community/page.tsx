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
  MessageCircle,
  Calendar,
  TrendingUp,
  Search,
  Plus,
  ArrowLeft,
  Heart,
  MessageSquare,
  Eye,
  Pin,
  Flame,
  Award,
  Code,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Github,
  Twitter,
  DiscIcon as Discord,
  Youtube,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState("discussions");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const [discussions] = useState([
    {
      id: 1,
      title: "Best practices for optimizing JavaScript algorithms",
      author: "@algorithmMaster",
      avatar: "🧠",
      category: "algorithms",
      replies: 23,
      views: 156,
      likes: 45,
      isPinned: true,
      isHot: true,
      timeAgo: "2 hours ago",
      lastReply: "30 minutes ago",
      tags: ["JavaScript", "Optimization", "Algorithms"],
      preview:
        "I've been working on optimizing some common algorithms and wanted to share some insights...",
    },
    {
      id: 2,
      title: "How to approach dynamic programming problems?",
      author: "@dpExpert",
      avatar: "🎯",
      category: "help",
      replies: 18,
      views: 89,
      likes: 32,
      isPinned: false,
      isHot: true,
      timeAgo: "4 hours ago",
      lastReply: "1 hour ago",
      tags: ["Dynamic Programming", "Problem Solving"],
      preview:
        "I'm struggling with DP problems in battles. Any tips for beginners?",
    },
    {
      id: 3,
      title: "Weekly Challenge: Implement a LRU Cache",
      author: "@challengeMaster",
      avatar: "🏆",
      category: "challenges",
      replies: 67,
      views: 234,
      likes: 89,
      isPinned: true,
      isHot: false,
      timeAgo: "1 day ago",
      lastReply: "15 minutes ago",
      tags: ["Challenge", "Data Structures", "Cache"],
      preview:
        "This week's community challenge focuses on implementing an efficient LRU Cache...",
    },
    {
      id: 4,
      title: "Share your battle setup and coding environment",
      author: "@setupGuru",
      avatar: "⚙️",
      category: "general",
      replies: 41,
      views: 178,
      likes: 56,
      isPinned: false,
      isHot: false,
      timeAgo: "2 days ago",
      lastReply: "3 hours ago",
      tags: ["Setup", "Environment", "Tools"],
      preview:
        "Let's share our coding setups and favorite tools for competitive programming...",
    },
  ]);

  const [events] = useState([
    {
      id: 1,
      title: "Monthly Algorithm Tournament",
      date: "2025-01-20",
      time: "19:00 UTC",
      participants: 247,
      maxParticipants: 500,
      type: "tournament",
      prize: "5,000 XP",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Community Code Review Session",
      date: "2025-01-15",
      time: "18:00 UTC",
      participants: 89,
      maxParticipants: 100,
      type: "workshop",
      prize: "Learning",
      status: "upcoming",
    },
    {
      id: 3,
      title: "JavaScript Masterclass",
      date: "2025-01-25",
      time: "20:00 UTC",
      participants: 156,
      maxParticipants: 200,
      type: "workshop",
      prize: "Certificate",
      status: "upcoming",
    },
  ]);

  const [leaderboard] = useState([
    {
      rank: 1,
      name: "@communityHero",
      avatar: "🌟",
      points: 2847,
      badge: "LEGEND",
    },
    {
      rank: 2,
      name: "@helpfulCoder",
      avatar: "🤝",
      points: 2156,
      badge: "MASTER",
    },
    {
      rank: 3,
      name: "@knowledgeSharer",
      avatar: "📚",
      points: 1923,
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

      // Content animation
      const contentElements = document.querySelectorAll(".community-content");
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "algorithms":
        return Code;
      case "help":
        return HelpCircle;
      case "challenges":
        return Trophy;
      case "general":
        return MessageCircle;
      default:
        return MessageCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "algorithms":
        return "text-blue-400";
      case "help":
        return "text-green-400";
      case "challenges":
        return "text-yellow-400";
      case "general":
        return "text-purple-400";
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
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              {"// "} COMMUNITY
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect, learn, and grow with fellow developers
            </p>

            {/* Community Stats */}
            <div
              ref={statsRef}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
            >
              {[
                {
                  label: "Members",
                  value: "10.2K",
                  icon: "👥",
                  color: "text-blue-400",
                },
                {
                  label: "Discussions",
                  value: "2.8K",
                  icon: "💬",
                  color: "text-green-400",
                },
                {
                  label: "Events",
                  value: "156",
                  icon: "📅",
                  color: "text-yellow-400",
                },
                {
                  label: "Online Now",
                  value: "247",
                  icon: "🟢",
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
              { id: "discussions", label: "Discussions", icon: MessageCircle },
              { id: "events", label: "Events", icon: Calendar },
              { id: "leaderboard", label: "Top Contributors", icon: Award },
              { id: "resources", label: "Resources", icon: BookOpen },
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
            <div className="lg:col-span-3 space-y-6">
              {activeTab === "discussions" && (
                <>
                  {/* Search and Filters */}
                  <Card className="community-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search discussions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                          />
                        </div>

                        {/* Category Filter */}
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="bg-gray-900/50 border border-green-400/20 rounded-xl px-4 py-3 text-green-400 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                        >
                          <option value="all">All Categories</option>
                          <option value="algorithms">Algorithms</option>
                          <option value="help">Help & Support</option>
                          <option value="challenges">Challenges</option>
                          <option value="general">General</option>
                        </select>

                        {/* New Discussion Button */}
                        <Button className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          New Discussion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discussions List */}
                  <div className="space-y-4">
                    {discussions.map((discussion) => {
                      const CategoryIcon = getCategoryIcon(discussion.category);
                      return (
                        <Card
                          key={discussion.id}
                          className="community-content bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl overflow-hidden"
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {/* Author Avatar */}
                              <div className="text-2xl">
                                {discussion.avatar}
                              </div>

                              {/* Discussion Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                  {discussion.isPinned && (
                                    <Pin className="h-4 w-4 text-yellow-400" />
                                  )}
                                  {discussion.isHot && (
                                    <Flame className="h-4 w-4 text-red-400" />
                                  )}
                                  <CategoryIcon
                                    className={`h-4 w-4 ${getCategoryColor(
                                      discussion.category
                                    )}`}
                                  />
                                  <span
                                    className={`text-xs uppercase font-semibold ${getCategoryColor(
                                      discussion.category
                                    )}`}
                                  >
                                    {discussion.category}
                                  </span>
                                </div>

                                <h3 className="text-lg font-semibold text-green-400 mb-2 hover:text-green-300 transition-colors duration-300">
                                  {discussion.title}
                                </h3>

                                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                                  {discussion.preview}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {discussion.tags.map((tag, i) => (
                                    <Badge
                                      key={i}
                                      className="bg-gray-800/50 text-gray-300 border-gray-600/30 rounded-full text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                {/* Meta Info */}
                                <div className="flex items-center justify-between text-sm text-gray-400">
                                  <div className="flex items-center space-x-4">
                                    <span className="text-blue-400">
                                      {discussion.author}
                                    </span>
                                    <span>{discussion.timeAgo}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="flex items-center">
                                      <Heart className="h-4 w-4 mr-1" />
                                      {discussion.likes}
                                    </span>
                                    <span className="flex items-center">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      {discussion.replies}
                                    </span>
                                    <span className="flex items-center">
                                      <Eye className="h-4 w-4 mr-1" />
                                      {discussion.views}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}

              {activeTab === "events" && (
                <div className="space-y-6">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="community-content bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {event.type === "tournament" ? "🏆" : "📚"}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-green-400">
                                {event.title}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span>{event.time}</span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            className={`${
                              event.type === "tournament"
                                ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                : "bg-blue-500/20 text-blue-400 border-blue-400/30"
                            } rounded-full`}
                          >
                            {event.type.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-green-400 font-bold">
                                {event.participants}
                              </div>
                              <div className="text-gray-400 text-xs">
                                Registered
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-blue-400 font-bold">
                                {event.prize}
                              </div>
                              <div className="text-gray-400 text-xs">Prize</div>
                            </div>
                          </div>
                          <Button className="bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl">
                            Join Event
                          </Button>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                              style={{
                                width: `${
                                  (event.participants / event.maxParticipants) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {event.participants} / {event.maxParticipants}{" "}
                            participants
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === "leaderboard" && (
                <Card className="community-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-green-400 text-2xl flex items-center">
                      <Award className="h-6 w-6 mr-2" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {leaderboard.map((user) => (
                        <div
                          key={user.rank}
                          className="flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-green-400/20"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="text-2xl">
                              {user.rank === 1
                                ? "🥇"
                                : user.rank === 2
                                ? "🥈"
                                : "🥉"}
                            </div>
                            <div className="text-2xl">{user.avatar}</div>
                            <div>
                              <div className="text-blue-400 font-semibold">
                                {user.name}
                              </div>
                              <Badge
                                className={`${
                                  user.badge === "LEGEND"
                                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                                    : user.badge === "MASTER"
                                    ? "bg-purple-500/20 text-purple-400 border-purple-400/30"
                                    : "bg-blue-500/20 text-blue-400 border-blue-400/30"
                                } rounded-full text-xs`}
                              >
                                {user.badge}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-green-400 font-bold">
                            {user.points} pts
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "resources" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "Algorithm Study Guide",
                      description: "Comprehensive guide to common algorithms",
                      icon: "📚",
                      category: "Learning",
                    },
                    {
                      title: "Code Templates",
                      description: "Ready-to-use code templates for battles",
                      icon: "📝",
                      category: "Tools",
                    },
                    {
                      title: "Practice Problems",
                      description: "Curated list of practice problems",
                      icon: "🎯",
                      category: "Practice",
                    },
                    {
                      title: "Video Tutorials",
                      description: "Step-by-step video explanations",
                      icon: "🎥",
                      category: "Learning",
                    },
                  ].map((resource, i) => (
                    <Card
                      key={i}
                      className="community-content bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{resource.icon}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-400 mb-1">
                              {resource.title}
                            </h3>
                            <p className="text-gray-300 text-sm mb-2">
                              {resource.description}
                            </p>
                            <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 rounded-full text-xs">
                              {resource.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="community-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                  <Button className="w-full bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 rounded-xl justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Create Event
                  </Button>
                  <Button className="w-full bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 rounded-xl justify-start">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Share Tip
                  </Button>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="community-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg">
                    Connect With Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      name: "Discord",
                      icon: Discord,
                      color: "text-indigo-400",
                      members: "15.2K",
                    },
                    {
                      name: "Twitter",
                      icon: Twitter,
                      color: "text-blue-400",
                      members: "8.7K",
                    },
                    {
                      name: "GitHub",
                      icon: Github,
                      color: "text-gray-300",
                      members: "5.1K",
                    },
                    {
                      name: "YouTube",
                      icon: Youtube,
                      color: "text-red-400",
                      members: "12.3K",
                    },
                  ].map((social) => (
                    <Link
                      key={social.name}
                      href="#"
                      className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-600/30 hover:border-green-400/50 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <social.icon className={`h-5 w-5 ${social.color}`} />
                        <span className="text-gray-300">{social.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {social.members}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="community-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-green-400 text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      user: "@newbie123",
                      action: "joined the community",
                      time: "5m ago",
                    },
                    {
                      user: "@codemaster",
                      action: "started a new discussion",
                      time: "12m ago",
                    },
                    {
                      user: "@helpfuldev",
                      action: "answered a question",
                      time: "23m ago",
                    },
                    {
                      user: "@eventhost",
                      action: "created an event",
                      time: "1h ago",
                    },
                  ].map((activity, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-blue-400">{activity.user}</span>
                      <span className="text-gray-300"> {activity.action}</span>
                      <div className="text-gray-500 text-xs">
                        {activity.time}
                      </div>
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
