"use client";

import { useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Twitter } from "lucide-react";

export default function CommunitySection() {
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
      id="community"
      className="animate-section py-20 px-4 relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-5xl font-bold mb-8 text-green-400">
          {"// "} JOIN_OUR_COMMUNITY
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Connect with fellow developers, share strategies, and stay updated on
          the latest battles.
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
  );
}
