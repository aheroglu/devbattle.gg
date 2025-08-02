"use client";

import Link from "next/link";
import { Code } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-black/80 border-t border-green-400/30 relative overflow-hidden backdrop-blur-sm">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          {/* Logo Section - Left Side */}
          <div className="flex flex-col items-start text-left">
            <div className="mb-4">
              <Image
                src="/logo-without-text.png"
                alt="DevBattle.gg Logo"
                className="w-36 h-36"
                width={64}
                height={64}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>

          {/* Links Section - Right Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-32 gap-y-4">
            {[
              {
                title: "Platform",
                links: ["Battles", "Tournaments", "Leaderboard", "Challenges"],
              },
              {
                title: "Community",
                links: ["Discord", "Twitter", "GitHub", "Blog"],
              },
              {
                title: "Support",
                links: ["Help Center", "API Docs", "Contact", "Privacy"],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="text-green-400 font-bold mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <Link
                        href="#"
                        className="hover:text-green-400 transition-colors duration-300 hover:translate-x-1 transform inline-block"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-green-400/30 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center space-x-2">
            <span>{"// "} 2025 DevBattle.gg. All rights reserved.</span>
            <span>Built for developers, by developers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
