"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Badge } from "../shared/ui/badge";

export default function Leaderboard() {
  // GSAP Animations
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      // Section fade-in animation
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
  );
}
