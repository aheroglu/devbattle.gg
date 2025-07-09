"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "../shared/ui/button";
import { Zap } from "lucide-react";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liveStats, setLiveStats] = useState({
    activeBattles: 42,
    onlineDevelopers: 1247,
    totalXP: "2847293",
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLButtonElement>(null);

  // Typing animation effect
  useEffect(() => {
    if (isLoaded) {
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
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

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
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }
        );

        // Typing container animasyonu
        tl.to(typingRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });

        // Description animasyonu
        tl.to(descriptionRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });

        // Stats animasyonu
        if (statsRef.current) {
          tl.fromTo(
            statsRef.current.children,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.3,
              stagger: 0.1,
              ease: "power2.out",
            }
          );
        }

        // CTA button animasyonu
        if (ctaButtonRef.current) {
          tl.fromTo(
            ctaButtonRef.current,
            {
              scale: 0.8,
              opacity: 0,
            },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out",
            }
          );
        }
      }
    };

    loadGSAP();
  }, []);

  return (
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
  );
}
