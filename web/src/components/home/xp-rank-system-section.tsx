"use client";

import { useEffect } from "react";
import { Award, Star, Target, Trophy } from "lucide-react";

export default function XPRankSystemSection() {
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
  );
}
