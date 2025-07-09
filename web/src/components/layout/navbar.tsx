"use client";

import { Button } from "@/components/shared/ui/button";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Navbar entrance animation
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");

      // Initial navbar entrance animation
      if (navContentRef.current) {
        gsap.fromTo(
          navContentRef.current,
          {
            y: -50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
          }
        );
      }

      setIsLoaded(true);
    };

    loadGSAP();
  }, []);

  // GSAP animation for navbar transformation
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");

      // GSAP yüklenene kadar içeriği gizle
      if (navContainerRef.current) {
        navContainerRef.current.style.opacity = "0";
      }

      if (navContainerRef.current && navContentRef.current) {
        // Set initial state
        gsap.set(navContainerRef.current, {
          opacity: 0,
          top: "1.5rem",
          left: "50%",
          right: "auto",
          width: "calc(100% - 2rem)",
          maxWidth: "72rem",
          transform: "translateX(-50%)",
        });

        gsap.set(navContentRef.current, {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(24px)",
          borderRadius: "1rem",
          padding: "0 1.5rem",
          borderWidth: "0",
          borderColor: "rgba(34, 197, 94, 0)",
          boxShadow: "none",
        });

        // Border container oluştur
        const borderContainer = document.createElement("div");
        borderContainer.style.cssText = `
          position: absolute;
          inset: 0;
          border-radius: 1rem;
          border: 1px solid rgba(34, 197, 94, 0.3);
          pointer-events: none;
          opacity: 0;
          box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.1);
        `;

        navContentRef.current.style.position = "relative";
        navContentRef.current.appendChild(borderContainer);

        // Ana navbar animasyonu
        const tl = gsap.timeline();

        tl.to(navContainerRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        })
          .fromTo(
            navContentRef.current,
            {
              y: -20,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.out",
            }
          )
          .to(
            borderContainer,
            {
              opacity: 1,
              duration: 0.4,
              ease: "power2.inOut",
              onComplete: () => {
                setIsLoaded(true);
                // Border belirdikten sonra sürekli bir pulse efekti ekle
                gsap.to(borderContainer, {
                  boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.2)",
                  duration: 1.5,
                  repeat: -1,
                  yoyo: true,
                  ease: "power2.inOut",
                });
              },
            },
            ">+=0.1"
          ); // Border içerik göründükten biraz sonra belirsin
      }
    };

    loadGSAP();
  }, []);

  const navItems = [
    { name: "Battles", href: "/battles" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Community", href: "/community" },
  ];

  return (
    <div
      ref={navContainerRef}
      className={`fixed top-0 left-0 right-0 z-50 w-full opacity-0`}
      style={{ willChange: "transform, top, left, right, width, opacity" }}
    >
      <div
        ref={navContentRef}
        className="mx-auto"
        style={{
          willChange:
            "background-color, backdrop-filter, border-radius, border, box-shadow, padding",
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 nav-item">
                <div className="relative h-8 w-8">
                  <Image
                    src="/logo-without-text.png"
                    alt="DevBattle.gg Logo"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain"
                    priority
                  />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <span className="text-lg font-bold text-green-400 hidden sm:block">
                  devbattle.gg
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`nav-item text-gray-300 hover:text-green-400 px-3 py-2 text-sm font-medium transition-all duration-300 relative group ${
                      pathname.startsWith(item.href)
                        ? "text-green-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-green-400"
                        : ""
                    }`}
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="nav-item text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="nav-item bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/25"
              >
                Join Battle
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-green-400 rounded-xl transition-all duration-300"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-green-400/20 mt-2 bg-black/90 backdrop-blur-md rounded-lg">
              <div className="px-2 pt-4 pb-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:text-green-400 block px-3 py-2 text-sm font-medium transition-colors duration-300 hover:bg-green-400/10 rounded-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-3 space-y-2">
                  <Link
                    href="/login"
                    className="block w-full text-center text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded-xl py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-semibold rounded-xl py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Battle
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
