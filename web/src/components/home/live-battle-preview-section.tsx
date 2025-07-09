"use client";

import { useEffect } from "react";
import { Badge } from "../shared/ui/badge";
import { Card, CardContent, CardHeader } from "../shared/ui/card";

export default function LiveBattlePreview() {
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

  const codeSnippets = [
    "const battle = new CodingBattle();",
    "battle.join('real-time');",
    "if (skills.level > 9000) {",
    "  return 'LEGENDARY_DEVELOPER';",
    "}",
  ];

  return (
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
                  code: codeSnippets.slice(0, 3),
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
  );
}
