"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Skeleton } from "@/components/shared/ui/skeleton";
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
  Twitter,
  Globe,
  Github,
} from "lucide-react";
import { Profile } from "@/types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/shared/ui/use-toast";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shared/ui/avatar";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { toast } = useToast();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/auth/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Profile fetching error:", error);
        toast({
          title: "Hata",
          description: "Profile information could not be retrieved.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [supabase]);

  // Refs for animations
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Load GSAP animations
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

  // Badge helper function
  const getBadgeByXP = (xp: number): string => {
    if (xp >= 10000) return "Legend";
    if (xp >= 5000) return "Master";
    if (xp >= 1000) return "Expert";
    return "Coder";
  };

  const getBadgeColor = (badge: string): string => {
    switch (badge) {
      case "Legend":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30";
      case "Master":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "Expert":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-400/30";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen text-green-400 font-mono relative">
        <div className="relative z-10 py-28">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-10 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-24" />
                </div>
              </div>

              <Card className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar & Basic Info */}
                    <div className="text-center md:text-left">
                      <Skeleton className="h-32 w-32 rounded-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-24" />
                        </div>
                        <Skeleton className="h-16 w-64" />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-gray-900/50 p-4 rounded-xl border border-green-400/30"
                        >
                          <Skeleton className="h-6 w-6 mx-auto mb-2" />
                          <Skeleton className="h-8 w-16 mx-auto mb-1" />
                          <Skeleton className="h-4 w-20 mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mt-6 pt-6 border-t border-green-400/20">
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-6 w-20" />
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-6 w-16" />
                      ))}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="mt-6 pt-6 border-t border-green-400/20">
                    <div className="flex flex-wrap gap-3">
                      <Skeleton className="h-6 w-20" />
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-6 w-24" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>

            {/* Overview Content */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Details Card */}
              <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions Card */}
              <Card className="profile-content bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-green-400 font-mono relative">
      <div ref={pageRef} className="relative z-10 py-28">
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
                    <div className="text-8xl mb-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage
                          src={profile?.avatar_url ?? ""}
                          alt={profile?.username ?? "User"}
                        />
                        <AvatarFallback>
                          {profile?.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-green-400">
                        @{profile?.username ?? "Anonymous"}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <Badge
                          className={`${getBadgeColor(
                            getBadgeByXP(profile?.xp || 0)
                          )} rounded-full`}
                        >
                          {getBadgeByXP(profile?.xp || 0)}
                        </Badge>
                        <span className="text-gray-400">
                          Rank #{profile?.rank}
                        </span>
                      </div>
                      <p className="text-gray-300 max-w-md">
                        {profile?.bio ?? "No bio available"}
                      </p>
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
                        value: (profile?.xp ?? 0).toLocaleString(),
                        icon: Star,
                        color: "text-yellow-400",
                      },
                      {
                        label: "Battles Won",
                        value: profile?.battles_won ?? 0,
                        icon: Trophy,
                        color: "text-green-400",
                      },
                      {
                        label: "Win Rate",
                        value: `${profile?.win_rate ?? 0}%`,
                        icon: Target,
                        color: "text-blue-400",
                      },
                      {
                        label: "Current Streak",
                        value: "6",
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
                {profile?.preferred_languages && profile?.preferred_languages.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-green-400/20">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-gray-400 text-sm mr-2">
                        Languages:
                      </span>
                      {profile?.preferred_languages.map((lang, i) => (
                        <Badge
                          key={i}
                          className="bg-gray-800/50 text-gray-300 border-gray-600/30 rounded-full text-xs"
                        >
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {profile?.website ||
                  profile?.twitter_url ||
                  (profile?.github_url && (
                    <div className="mt-6 pt-6 border-t border-green-400/20">
                      <div className="flex flex-wrap gap-3">
                        <span className="text-gray-400 text-sm mr-2">
                          Connect:
                        </span>
                        {profile?.website && (
                          <Link
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors duration-300 text-sm"
                          >
                            <Globe className="h-4 w-4" />
                            <span>Website</span>
                          </Link>
                        )}
                        {profile?.twitter_url && (
                          <Link
                            href={profile.twitter_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm"
                          >
                            <Twitter className="h-4 w-4" />
                            <span>Twitter</span>
                          </Link>
                        )}
                        {profile?.github_url && (
                          <Link
                            href={profile.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                          >
                            <Github className="h-4 w-4" />
                            <span>GitHub</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
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
                        {new Date(
                          profile?.created_at || ""
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    {profile?.website && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </span>
                        <Link
                          href={profile?.website!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors duration-300 text-sm hover:underline"
                        >
                          {profile?.website!.replace("https://", "")}
                        </Link>
                      </div>
                    )}

                    {profile?.twitter_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </span>
                        <Link
                          href={profile?.twitter_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-300 text-sm hover:underline"
                        >
                          @{profile?.twitter_url!.split("/").pop()}
                        </Link>
                      </div>
                    )}

                    {profile?.github_url && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </span>
                        <Link
                          href={profile?.github_url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-300 hover:text-white transition-colors duration-300 text-sm hover:underline"
                        >
                          @{profile?.github_url!.split("/").pop()}
                        </Link>
                      </div>
                    )}

                    {profile?.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          Location
                        </span>
                        <span className="text-gray-300">
                          {profile?.location}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <Code className="h-4 w-4 mr-2" />
                        Favorite Language
                      </span>
                      <span className="text-green-400">
                        {profile?.preferred_languages[0]}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Average Rank
                      </span>
                      <span className="text-blue-400">#{profile?.rank}</span>
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
                      <Button className="w-full mt-3 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 rounded-xl justify-start">
                        <Trophy className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* {activeTab === "battles" && (
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
                    {profile?.achievements.map((achievement, i) => (
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
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
}
