"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Zap,
  Users,
  Calendar,
  Star,
  MessageCircle,
  Twitter,
  Code,
  Target,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/navbar";
import { InteractiveBackground } from "@/components/interactive-background";
import { Footer } from "@/components/footer";

export function DevBattleLanding() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveStats, setLiveStats] = useState({
    activeBattles: 42,
    onlineDevelopers: 1247,
    totalXP: "2847293",
  });

  // GSAP refs
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);

  const codeSnippets = [
    "const battle = new CodingBattle();",
    "battle.join('real-time');",
    "if (skills.level > 9000) {",
    "  return 'LEGENDARY_DEVELOPER';",
    "}",
  ];

  // Typing animation effect
  useEffect(() => {
    if (isLoaded) {
      // Sadece sayfa yüklendikten sonra başlat
      const text = "> Ready to dominate the leaderboard?";
      const timer = setTimeout(() => {
        if (currentIndex < text.length) {
          setTypedText(text.slice(0, currentIndex + 1));
          setCurrentIndex(currentIndex + 1);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isLoaded]);

  // GSAP Animations
  useEffect(() => {
    // Import GSAP dynamically to avoid SSR issues
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Sayfa yüklenene kadar içeriği gizle
      document.body.style.opacity = "0";

      // İçeriği yavaşça göster
      gsap.to(document.body, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => setIsLoaded(true),
      });

      // Hero animations
      if (titleRef.current && descriptionRef.current && typingRef.current) {
        const tl = gsap.timeline({ delay: 0.5 });

        // Başlık animasyonu
        tl.fromTo(
          titleRef.current,
          {
            opacity: 0,
            y: 100,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            ease: "power3.out",
          }
        )
          // Typing container animasyonu
          .to(typingRef.current, {
            opacity: 1,
            duration: 0.5,
            onComplete: () => setIsLoaded(true), // Typing animasyonunu başlat
          })
          // Açıklama metni animasyonu
          .to(descriptionRef.current, {
            opacity: 1,
            duration: 0.1,
          })
          .fromTo(
            ".description-part",
            {
              opacity: 0,
              y: 10,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.1,
              ease: "power2.out",
            },
            ">-0.1"
          );
      }

      if (ctaButtonRef.current) {
        gsap.fromTo(
          ctaButtonRef.current,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            delay: 2,
            ease: "back.out(1.7)",
          }
        );

        // Button hover animation
        const button = ctaButtonRef.current;
        button.addEventListener("mouseenter", () => {
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        button.addEventListener("mouseleave", () => {
          gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }

      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          {
            opacity: 0,
            y: 30,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: 2.5,
            stagger: 0.2,
            ease: "power2.out",
          }
        );
      }

      // Section animations with ScrollTrigger
      const sections = document.querySelectorAll(".animate-section");
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Card hover animations
      const cards = document.querySelectorAll(".interactive-card");
      cards.forEach((card) => {
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
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      });
    };

    loadGSAP();
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-x-hidden relative">
      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Dynamic Navbar */}
      <Navbar />

      {/* Enhanced Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <h1
              ref={titleRef}
              className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Code. Compete. Conquer.
            </h1>
            <div
              ref={typingRef}
              className="text-xl md:text-3xl text-gray-300 mb-4 h-12 opacity-0"
            >
              <span className="text-green-400">{typedText}</span>
              <span className="animate-pulse">|</span>
            </div>
            <p
              ref={descriptionRef}
              className="text-lg md:text-xl text-gray-400 mb-8 opacity-0"
            >
              <span className="description-part">Real-time coding battles</span>
              <span className="description-part"> • </span>
              <span className="description-part">Prove your skills</span>
              <span className="description-part"> • </span>
              <span className="description-part">Earn XP</span>
              <span className="description-part"> • </span>
              <span className="description-part">Dominate the leaderboard</span>
            </p>
          </div>

          {/* Live Stats Bar */}
          <div
            ref={statsRef}
            className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
          >
            {[
              {
                label: "Active Battles",
                value: liveStats.activeBattles,
                icon: "⚔️",
              },
              {
                label: "Online Devs",
                value: liveStats.onlineDevelopers,
                icon: "👨‍💻",
              },
              {
                label: "Total XP",
                value: liveStats.totalXP.toLocaleString(),
                icon: "⭐",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-gray-900/50 p-3 rounded-xl border border-green-400/30 backdrop-blur-sm"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-green-400 font-bold text-lg">
                  {stat.value}
                </div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>

          <Button
            ref={ctaButtonRef}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold text-xl px-12 py-6 rounded-2xl border-2 border-green-400 shadow-2xl shadow-green-400/50 transition-all duration-300"
          >
            <Zap className="mr-3 h-6 w-6" />
            JOIN THE BATTLE
          </Button>

          <div className="mt-8 text-sm text-gray-500">
            {"// "} <span>10,247</span> developers already battling
          </div>
        </div>
      </section>

      {/* Enhanced How It Works */}
      <section className="animate-section py-20 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 text-green-400">
            {"// "} HOW_IT_WORKS
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "SIGN_UP",
                desc: "Create your developer profile and choose your preferred programming languages",
                icon: Users,
                color: "from-green-400 to-blue-400",
              },
              {
                step: "02",
                title: "CODE",
                desc: "Join real-time battles, solve challenges, and compete against other developers",
                icon: Code,
                color: "from-blue-400 to-purple-400",
              },
              {
                step: "03",
                title: "WIN_XP",
                desc: "Earn experience points, climb ranks, and unlock exclusive tournaments",
                icon: Trophy,
                color: "from-purple-400 to-pink-400",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="interactive-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl"
              >
                <CardHeader className="text-center relative overflow-hidden">
                  <div className="text-8xl font-bold text-green-400/20 mb-4">
                    {item.step}
                  </div>
                  <div className="relative">
                    <item.icon className="h-16 w-16 mx-auto mb-4 text-green-400 transition-all duration-300" />
                  </div>
                  <CardTitle className="text-green-400 text-2xl transition-colors duration-300">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-center transition-colors duration-300">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Live Battle Preview */}
      <section id="battles" className="animate-section py-20 px-4 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 text-green-400">
            {"// "} LIVE_BATTLE_PREVIEW
          </h2>

          <Card className="interactive-card bg-gray-900/80 border-green-400/30 overflow-hidden backdrop-blur-sm rounded-2xl">
            <CardHeader className="bg-black/70 border-b border-green-400/30 relative">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                    <div
                      className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-4 h-4 rounded-full bg-green-500 animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-green-400">battle_arena.js</span>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-400/30 animate-pulse rounded-full">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    user: "@codeNinja_42",
                    xp: 2847,
                    code: codeSnippets.slice(0, 3),
                    progress: 75,
                    color: "blue",
                  },
                  {
                    user: "@pythonMaster",
                    xp: 3156,
                    code: [
                      "# Two Sum Problem",
                      "def two_sum(nums, target):",
                      "    hash_map = {}",
                    ],
                    progress: 60,
                    color: "purple",
                  },
                ].map((player, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-${player.color}-400 font-bold`}>
                        {player.user}
                      </span>
                      <span className="text-green-400">XP: {player.xp}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-${player.color}-400 to-${player.color}-600 rounded-full transition-all duration-1000`}
                        style={{ width: `${player.progress}%` }}
                      ></div>
                    </div>

                    <div className="bg-black p-4 rounded-xl border border-green-400/20 font-mono text-sm relative overflow-hidden">
                      {player.code.map((line, j) => (
                        <div
                          key={j}
                          className="text-gray-300 hover:text-green-400 transition-colors duration-300"
                        >
                          {line}
                        </div>
                      ))}
                      <div className="animate-pulse text-green-400 mt-2">|</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">
                  02:34
                </div>
                <div className="text-gray-400">Time Remaining</div>
                <div className="w-32 h-1 bg-gray-700 rounded-full mx-auto mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full countdown-bar"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced Leaderboard */}
      <section
        id="leaderboard"
        className="animate-section py-20 px-4 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 text-green-400">
            {"// "} LEADERBOARD
          </h2>

          <Card className="interactive-card bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl">
            <CardHeader className="relative overflow-hidden">
              <CardTitle className="text-green-400 text-center text-2xl relative z-10">
                TOP DEVELOPERS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    rank: 1,
                    name: "codeWizard_99",
                    xp: "15847",
                    badge: "LEGEND",
                    trend: "+127",
                  },
                  {
                    rank: 2,
                    name: "algorithmQueen",
                    xp: "14203",
                    badge: "MASTER",
                    trend: "+89",
                  },
                  {
                    rank: 3,
                    name: "debugHunter",
                    xp: "13956",
                    badge: "MASTER",
                    trend: "+156",
                  },
                  {
                    rank: 4,
                    name: "syntaxNinja",
                    xp: "12734",
                    badge: "EXPERT",
                    trend: "+43",
                  },
                  {
                    rank: 5,
                    name: "loopBreaker",
                    xp: "11892",
                    badge: "EXPERT",
                    trend: "+78",
                  },
                ].map((user, i) => (
                  <div
                    key={i}
                    className="interactive-card flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-green-400/20 hover:border-green-400 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                          i === 0
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"
                            : i === 1
                            ? "bg-gradient-to-r from-gray-300 to-gray-500 text-black"
                            : i === 2
                            ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                            : "bg-gradient-to-r from-green-400/20 to-blue-400/20 text-green-400 border border-green-400/30"
                        }`}
                      >
                        {user.rank}
                      </div>
                      <div>
                        <span className="text-blue-400 transition-colors duration-300">
                          @{user.name}
                        </span>
                        <div className="text-xs text-green-400">
                          +{user.trend} XP today
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        className={`transition-all duration-300 rounded-full ${
                          user.badge === "LEGEND"
                            ? "bg-yellow-500/20 text-yellow-400 border-yellow-400/30"
                            : user.badge === "MASTER"
                            ? "bg-purple-500/20 text-purple-400 border-purple-400/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-400/30"
                        }`}
                      >
                        {user.badge}
                      </Badge>
                      <span className="text-green-400 font-bold transition-colors duration-300">
                        {user.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Enhanced XP & Rank System */}
      <section className="animate-section py-20 px-4 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 text-green-400">
            {"// "} XP_AND_RANKS
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-8 flex items-center">
                <Award className="mr-3" />
                RANKING SYSTEM
              </h3>
              <div className="space-y-4">
                {[
                  {
                    rank: "NEWBIE",
                    xp: "0 - 999",
                    color: "text-gray-400",
                    bg: "from-gray-600 to-gray-800",
                  },
                  {
                    rank: "CODER",
                    xp: "1,000 - 2,999",
                    color: "text-green-400",
                    bg: "from-green-600 to-green-800",
                  },
                  {
                    rank: "EXPERT",
                    xp: "3,000 - 7,999",
                    color: "text-blue-400",
                    bg: "from-blue-600 to-blue-800",
                  },
                  {
                    rank: "MASTER",
                    xp: "8,000 - 14,999",
                    color: "text-purple-400",
                    bg: "from-purple-600 to-purple-800",
                  },
                  {
                    rank: "LEGEND",
                    xp: "15,000+",
                    color: "text-yellow-400",
                    bg: "from-yellow-600 to-yellow-800",
                  },
                ].map((rank, i) => (
                  <div
                    key={i}
                    className="interactive-card flex items-center justify-between p-4 bg-gray-900/30 rounded-xl border border-green-400/20 hover:border-green-400 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-4 h-4 rounded-full bg-gradient-to-r ${rank.bg}`}
                      ></div>
                      <span
                        className={`font-bold text-lg transition-colors duration-300 ${rank.color}`}
                      >
                        {rank.rank}
                      </span>
                    </div>
                    <span className="text-gray-300 transition-colors duration-300">
                      {rank.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-green-400 mb-8 flex items-center">
                <Star className="mr-3" />
                EARN XP BY
              </h3>
              <div className="space-y-4">
                {[
                  {
                    action: "Winning a battle",
                    xp: "+50-200 XP",
                    icon: Trophy,
                    color: "text-yellow-400",
                  },
                  {
                    action: "Solving daily challenges",
                    xp: "+25-100 XP",
                    icon: Target,
                    color: "text-blue-400",
                  },
                  {
                    action: "Tournament participation",
                    xp: "+100-500 XP",
                    icon: Award,
                    color: "text-purple-400",
                  },
                  {
                    action: "Code review contributions",
                    xp: "+10-50 XP",
                    icon: Star,
                    color: "text-green-400",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="interactive-card flex items-center space-x-4 p-4 bg-gray-900/30 rounded-xl border border-green-400/20 hover:border-green-400 transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative">
                      <item.icon
                        className={`h-8 w-8 ${item.color} transition-all duration-300`}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-300 transition-colors duration-300">
                        {item.action}
                      </span>
                    </div>
                    <span className="text-green-400 font-bold transition-colors duration-300">
                      {item.xp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Upcoming Tournaments */}
      <section
        id="tournaments"
        className="animate-section py-20 px-4 relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-5xl font-bold text-center mb-20 text-green-400">
            {"// "} UPCOMING_TOURNAMENTS
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Weekly JavaScript Showdown",
                date: "Jan 15, 2025",
                time: "19:00 UTC",
                prize: "1,000 XP",
                participants: 247,
                difficulty: "INTERMEDIATE",
                color: "yellow",
              },
              {
                name: "Python Masters Cup",
                date: "Jan 18, 2025",
                time: "20:00 UTC",
                prize: "2,500 XP",
                participants: 189,
                difficulty: "ADVANCED",
                color: "blue",
              },
              {
                name: "Algorithm Speed Run",
                date: "Jan 22, 2025",
                time: "18:30 UTC",
                prize: "5,000 XP",
                participants: 156,
                difficulty: "EXPERT",
                color: "purple",
              },
            ].map((tournament, i) => (
              <Card
                key={i}
                className="interactive-card bg-black/80 border-green-400/30 hover:border-green-400 transition-all duration-300 cursor-pointer backdrop-blur-sm rounded-2xl"
              >
                <CardHeader className="relative overflow-hidden">
                  <Badge
                    className={`mb-3 bg-${tournament.color}-500/20 text-${tournament.color}-400 border-${tournament.color}-400/30 rounded-full`}
                  >
                    {tournament.difficulty}
                  </Badge>
                  <CardTitle className="text-green-400 text-lg transition-colors duration-300">
                    {tournament.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-300 transition-colors duration-300">
                    <Calendar className="h-4 w-4" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300 transition-colors duration-300">
                    <span>⏰ {tournament.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <Trophy className="h-4 w-4" />
                    <span className="font-bold">{tournament.prize}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Users className="h-4 w-4" />
                    <span>{tournament.participants} registered</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(tournament.participants / 300) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <Button className="w-full bg-green-500/20 hover:bg-green-500/40 text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 rounded-xl">
                    REGISTER
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Join Community */}
      <section
        id="community"
        className="animate-section py-20 px-4 relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl font-bold mb-8 text-green-400">
            {"// "} JOIN_OUR_COMMUNITY
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Connect with fellow developers, share strategies, and stay updated
            on the latest battles.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
            {[
              {
                platform: "Discord",
                icon: MessageCircle,
                color: "indigo",
                members: "15.2K",
                gradient: "from-indigo-500 to-purple-600",
              },
              {
                platform: "Twitter",
                icon: Twitter,
                color: "blue",
                members: "8.7K",
                gradient: "from-blue-400 to-blue-600",
              },
            ].map((social, i) => (
              <Link
                key={i}
                href="#"
                className={`interactive-card flex items-center space-x-4 bg-gradient-to-r ${social.gradient} px-8 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden`}
              >
                <social.icon className="h-6 w-6" />
                <div>
                  <span className="font-bold text-lg">
                    Join {social.platform}
                  </span>
                  <div className="text-sm opacity-80">
                    {social.members} members
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-gray-500">
            {"// "} Join <span className="text-green-400">25,000+</span>{" "}
            developers in our community
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
