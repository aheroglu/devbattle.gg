"use client";

import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui/card";
import { Users, Code, Trophy } from "lucide-react";

export default function HowItWorks() {
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
  );
}
