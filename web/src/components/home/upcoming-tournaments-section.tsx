"use client";

import { useEffect } from "react";
import { Button } from "../shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Badge } from "../shared/ui/badge";
import { Calendar, Trophy, Users } from "lucide-react";

export default function UpcomingTournamentsSection() {
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
  );
}
