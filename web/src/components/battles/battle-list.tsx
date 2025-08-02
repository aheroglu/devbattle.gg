"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import { Zap, Search, ArrowLeft } from "lucide-react";
import { BattleCard } from "@/components/battles/battle-card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { BattleSession, DifficultyLevel, SessionType } from "@/types";
import { useRouter } from "next/navigation";

export default function BattleList() {
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();
  const [difficultyFilter, setDifficultyFilter] = useState<
    "all" | DifficultyLevel
  >("all");
  const [typeFilter, setTypeFilter] = useState<"all" | SessionType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [battles, setBattles] = useState<BattleSession[]>([]);
  const [filteredBattles, setFilteredBattles] = useState<BattleSession[]>([]);

  const router = useRouter();

  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Fetch battles with realtime subscription
  useEffect(() => {
    const fetchBattles = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("battle_sessions")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        setBattles(data || []);
      } catch (error) {
        console.error("Error while fetching battles:", error);
      } finally {
        setLoading(false);
      }
    };

    // İlk veri yüklemesi
    fetchBattles();

    // Realtime subscription kurulumu
    const channel = supabase
      .channel("battle_sessions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "battle_sessions",
        },
        (payload) => {
          console.log("Realtime change detected:", payload);

          if (payload.eventType === "INSERT") {
            setBattles((prev) => [payload.new as BattleSession, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBattles((prev) =>
              prev.map((battle) =>
                battle.id === payload.new.id
                  ? (payload.new as BattleSession)
                  : battle
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBattles((prev) =>
              prev.filter((battle) => battle.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Filter battles based on search term, difficulty, and session type
  useEffect(() => {
    let filtered = battles;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (battle) =>
          battle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (battle.description &&
            battle.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          battle.technologies.some((tech) =>
            tech.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(
        (battle) => battle.difficulty === difficultyFilter
      );
    }

    // Session type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (battle) => battle.session_type === typeFilter
      );
    }

    setFilteredBattles(filtered);
  }, [battles, searchTerm, difficultyFilter, typeFilter]);

  // GSAP animations
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
              {"// "} ACTIVE_BATTLES
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join live coding battles and compete with developers worldwide
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                {
                  label: "Total Battles",
                  value: battles.length.toString(),
                  icon: "🎯",
                },
                {
                  label: "Easy",
                  value: battles
                    .filter((b) => b.difficulty === "EASY")
                    .length.toString(),
                  icon: "🟢",
                },
                {
                  label: "Medium",
                  value: battles
                    .filter((b) => b.difficulty === "MEDIUM")
                    .length.toString(),
                  icon: "🟡",
                },
                {
                  label: "Hard",
                  value: battles
                    .filter((b) => b.difficulty === "HARD")
                    .length.toString(),
                  icon: "🔴",
                },
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
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Difficulty Filter */}
                <div className="flex gap-1">
                  <span className="text-sm text-gray-400 flex items-center border-b-2 mr-2">
                    Difficulty:
                  </span>
                  {["all", "EASY", "MEDIUM", "HARD"].map((difficulty) => (
                    <Button
                      key={difficulty}
                      variant={
                        difficultyFilter === difficulty ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() =>
                        setDifficultyFilter(
                          difficulty as "all" | DifficultyLevel
                        )
                      }
                      className={`rounded-xl transition-all duration-300 ${
                        difficultyFilter === difficulty
                          ? "bg-green-500/20 text-green-400 border border-green-400/30"
                          : "text-gray-300 hover:text-green-400 hover:bg-green-400/10"
                      }`}
                    >
                      {difficulty === "all"
                        ? "All"
                        : difficulty.charAt(0) +
                          difficulty.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>

                {/* Session Type Filter */}
                <div className="flex gap-1">
                  <span className="text-sm text-gray-400 flex items-center border-b-2 mr-2">
                    Type:
                  </span>
                  {["all", "SOLO", "DUO"].map((type) => (
                    <Button
                      key={type}
                      variant={typeFilter === type ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTypeFilter(type as "all" | SessionType)}
                      className={`rounded-xl transition-all duration-300 ${
                        typeFilter === type
                          ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                          : "text-gray-300 hover:text-blue-400 hover:bg-blue-400/10"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : type.charAt(0) + type.slice(1).toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Battle Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="text-green-400">Loading battles...</div>
              </div>
            ) : filteredBattles.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400">
                  No battles found matching your criteria.
                </div>
              </div>
            ) : (
              filteredBattles.map((battle) => (
                <BattleCard key={battle.id} battle={battle} />
              ))
            )}
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
