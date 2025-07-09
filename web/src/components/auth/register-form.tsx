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
  User,
  Zap,
  ArrowLeft,
  Trophy,
} from "lucide-react";
import { InteractiveBackground } from "@/components/shared/interactive-background";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  // GSAP refs
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

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

      // Stats animation
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.children,
          {
            opacity: 0,
            y: 20,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            delay: 0.8,
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
            delay: 1,
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

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Register attempt:", formData);
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
          {/* Register Card */}
          <Card
            ref={cardRef}
            className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-400/10"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 text-xl">
                Create Account
              </CardTitle>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30 rounded-full">
                  <Trophy className="w-3 h-3 mr-1" />
                  FREE
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  INSTANT
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Social Register Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl">
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
                <Button className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl">
                  <Mail className="h-5 w-5 mr-2" />
                  Google
                </Button>
              </div>

              {/* Divider */}
              <div className="form-element relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-green-400/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-500">
                    Or create with email
                  </span>
                </div>
              </div>

              {/* Register Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Username Field */}
                <div className="form-element space-y-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-300"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                      placeholder="codeNinja_42"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    This will be your display name in battles
                  </p>
                </div>

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
                      placeholder="Create a strong password"
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

                {/* Confirm Password Field */}
                <div className="form-element space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-300"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="form-element">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      required
                      className="w-4 h-4 mt-1 text-green-400 bg-gray-900 border-green-400/30 rounded focus:ring-green-400 focus:ring-2"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-green-400 hover:text-green-300 transition-colors duration-300"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-green-400 hover:text-green-300 transition-colors duration-300"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !formData.agreeToTerms}
                  className="form-element w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Create Account</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Login Link */}
              <div className="form-element text-center pt-4 border-t border-green-400/20">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-300"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p>{"// "} Join 10,000+ developers already battling</p>
          </div>
        </div>
      </div>
    </div>
  );
}
