"use client";

import Link from "next/link";
import { Code } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="py-12 px-4 bg-black/80 border-t border-green-400/30 relative overflow-hidden backdrop-blur-sm">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-green-400 font-bold text-2xl mb-4 flex items-center">
              <Image
                src="/logo-without-text.png"
                alt="DevBattle.gg Logo"
                className="w-6 h-6 mr-2"
                width={24}
                height={24}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
              devbattle.gg
            </h3>
            <p className="text-gray-400 text-sm">
              The ultimate platform for competitive programming and skill
              development.
            </p>
          </div>

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
              <h4 className="text-green-400 font-bold mb-4">{section.title}</h4>
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

        <div className="mt-12 pt-8 border-t border-green-400/30 text-center text-gray-500 text-sm">
          <p className="flex items-center justify-center space-x-2">
            <span>{"// "} © 2025 DevBattle.gg. All rights reserved.</span>
            <span>Built for developers, by developers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
