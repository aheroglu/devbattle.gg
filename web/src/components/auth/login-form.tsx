"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import {
  Code,
  Eye,
  EyeOff,
  Github,
  Mail,
  Lock,
  Zap,
  ArrowLeft,
} from "lucide-react";
import { InteractiveBackground } from "@/components/shared/interactive-background";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // GSAP refs
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // GSAP Animations
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");

      // Card entrance animation
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          {
            opacity: 0,
            y: 50,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "back.out(1.7)",
            delay: 0.3,
          }
        );
      }

      // Title animation
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.6,
            ease: "power2.out",
          }
        );
      }

      // Form elements stagger animation
      if (formRef.current) {
        const formElements = formRef.current.querySelectorAll(".form-element");
        gsap.fromTo(
          formElements,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.8,
            ease: "power2.out",
          }
        );
      }
    };

    loadGSAP();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Login attempt:", formData);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen text-green-400 font-mono relative overflow-hidden">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">

          {/* Login Card */}
          <Card
            ref={cardRef}
            className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-400/10"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 text-xl">Sign In</CardTitle>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  SECURE
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl">
                  <Github className="h-5 w-5 mr-2" />
                  Continue with GitHub
                </Button>
                <Button className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl">
                  <Mail className="h-5 w-5 mr-2" />
                  Continue with Google
                </Button>
              </div>

              {/* Divider */}
              <div className="form-element relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-green-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="form-element space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-300"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                      placeholder="developer@example.com"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-element space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="form-element flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-green-400 bg-gray-900 border-green-400/30 rounded focus:ring-green-400 focus:ring-2"
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-green-400 hover:text-green-300 transition-colors duration-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="form-element w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/25"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Register Link */}
              <div className="form-element text-center pt-4 border-t border-green-400/20">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-300"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>{"// "} Secure authentication powered by DevBattle.gg</p>
          </div>
        </div>
      </div>
    </div>
  );
}
