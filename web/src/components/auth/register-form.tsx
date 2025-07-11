"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import multiavatar from "@multiavatar/multiavatar";

import { Button } from "../shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../shared/ui/card";
import { Badge } from "../shared/ui/badge";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/shared/ui/alert";

import {
  Eye,
  EyeOff,
  Github,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Trophy,
  ArrowRight,
  Check,
} from "lucide-react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import {
  developerTitles,
  techStackOptions,
  experienceLevels,
} from "./register-options";

export default function RegisterForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    // Step 1 - Basic Info
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,

    // Step 2 - Developer Profile
    developerTitle: "",

    // Step 3 - Tech Stack
    techStack: [] as string[],

    // Step 4 - Experience Level
    experienceLevel: "",
  });

  // GSAP refs
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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

      // Progress bar animation
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          {
            opacity: 0,
            y: -20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.4,
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
  }, [currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep < 4) {
      // Move to next step
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsLoading(true);
    setAlert(null);

    try {
      // Basic validation
      if (formData.password !== formData.confirmPassword) {
        setAlert({
          type: "error",
          message: "Passwords do not match!",
        });
        return;
      }

      // Generate avatar from username
      const svgCode = multiavatar(formData.username);
      const avatarUrl = `data:image/svg+xml;base64,${btoa(svgCode)}`;

      // Create user account
      const { error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            full_name: formData.fullName,
            avatar_url: avatarUrl,
            title: formData.developerTitle,
            preferred_languages: formData.techStack,
            level:
              formData.experienceLevel === "junior"
                ? 1
                : formData.experienceLevel === "mid"
                ? 2
                : 3,
            picture: avatarUrl,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      });

      if (authError) throw authError;

      setAlert({
        type: "success",
        message: "Please check your email for a verification link.",
      });
      router.push("/auth/login");
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=signup`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?type=signup`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleTitleSelect = (titleId: string) => {
    setFormData({
      ...formData,
      developerTitle: titleId,
      techStack: [], // Reset tech stack when title changes
    });
  };

  const handleTechStackToggle = (tech: string) => {
    const updatedStack = formData.techStack.includes(tech)
      ? formData.techStack.filter((t) => t !== tech)
      : [...formData.techStack, tech];

    setFormData({
      ...formData,
      techStack: updatedStack,
    });
  };

  const handleExperienceSelect = (level: string) => {
    setFormData({
      ...formData,
      experienceLevel: level,
    });
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.username &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.agreeToTerms
        );
      case 2:
        return formData.developerTitle;
      case 3:
        return formData.techStack.length > 0;
      case 4:
        return formData.experienceLevel;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen text-green-400 font-mono relative overflow-hidden">
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Registration Card */}
          <Card
            ref={cardRef}
            className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-400/10"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 text-xl">
                {currentStep === 1 && "Create Account"}
                {currentStep === 2 && "Choose Your Path"}
                {currentStep === 3 && "Select Technologies"}
                {currentStep === 4 && "Experience Level"}
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
              {alert && (
                <Alert
                  variant={alert.type === "success" ? "default" : "destructive"}
                  className="mb-4"
                >
                  {alert.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {alert.type === "success" ? "Success" : "Error"}
                  </AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              )}
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="space-y-6"
                autoComplete="off"
              >
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <>
                    {/* Social Register Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        className="form-element flex-1 bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl"
                        onClick={() => handleGithubSignIn()}
                      >
                        <Github className="h-5 w-5 mr-2" />
                        Continue with GitHub
                      </Button>
                      <Button
                        className="form-element flex-1 bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl"
                        onClick={() => handleGoogleSignIn()}
                      >
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
                          Or create with email
                        </span>
                      </div>
                    </div>

                    {/* Full Name Field */}
                    <div className="form-element space-y-2">
                      <label
                        htmlFor="fullName"
                        className="text-sm font-medium text-gray-300"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-green-400/20 rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all duration-300"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>

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
                  </>
                )}

                {/* Step 2: Developer Profile */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        What type of developer are you?
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Choose the role that best describes your focus
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {developerTitles.map((title) => {
                        const IconComponent = title.icon;
                        const isSelected = formData.developerTitle === title.id;

                        return (
                          <div
                            key={title.id}
                            onClick={() => handleTitleSelect(title.id)}
                            className={`form-element relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected
                                ? "border-green-400 bg-green-400/10 shadow-lg shadow-green-400/25"
                                : "border-gray-600/30 bg-gray-900/30 hover:border-green-400/50"
                            }`}
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              <div
                                className={`p-3 rounded-full bg-gradient-to-r ${
                                  title.color
                                } ${isSelected ? "animate-pulse" : ""}`}
                              >
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h4
                                  className={`font-semibold ${
                                    isSelected
                                      ? "text-green-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {title.title}
                                </h4>
                                <p className="text-gray-400 text-xs mt-1">
                                  {title.description}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-black" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 3: Tech Stack */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        Select your tech stack
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Choose the technologies you work with
                      </p>
                    </div>

                    {formData.developerTitle && (
                      <div className="space-y-4">
                        {Object.entries(
                          techStackOptions[
                            formData.developerTitle as keyof typeof techStackOptions
                          ]?.reduce((acc, tech) => {
                            if (!acc[tech.category]) acc[tech.category] = [];
                            acc[tech.category] = [
                              ...(acc[tech.category] || []),
                              tech,
                            ];
                            return acc;
                          }, {} as Record<string, Array<{ name: string; icon: string; category: string }>>) ||
                            {}
                        ).map(([category, techs]) => (
                          <div key={category} className="form-element">
                            <h4 className="text-green-400 font-semibold mb-3 text-sm">
                              {category}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {techs.map((tech) => {
                                const isSelected = formData.techStack.includes(
                                  tech.name
                                );

                                return (
                                  <div
                                    key={tech.name}
                                    onClick={() =>
                                      handleTechStackToggle(tech.name)
                                    }
                                    className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                                      isSelected
                                        ? "border-green-400 bg-green-400/10 shadow-lg shadow-green-400/25"
                                        : "border-gray-600/30 bg-gray-900/30 hover:border-green-400/50"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <span className="text-lg">
                                        {tech.icon}
                                      </span>
                                      <span
                                        className={`text-sm font-medium ${
                                          isSelected
                                            ? "text-green-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {tech.name}
                                      </span>
                                      {isSelected && (
                                        <Check className="h-4 w-4 text-green-400 ml-auto" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.techStack.length > 0 && (
                      <div className="mt-6 p-4 bg-green-400/10 border border-green-400/30 rounded-xl">
                        <h4 className="text-green-400 font-semibold mb-2 text-sm">
                          Selected Technologies:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.techStack.map((tech) => (
                            <Badge
                              key={tech}
                              className="bg-green-500/20 text-green-400 border-green-400/30 rounded-full"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Experience Level */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        What's your experience level?
                      </h3>
                      <p className="text-gray-400 text-sm">
                        This helps us match you with appropriate challenges
                      </p>
                    </div>

                    <div className="space-y-4">
                      {experienceLevels.map((level) => {
                        const IconComponent = level.icon;
                        const isSelected =
                          formData.experienceLevel === level.id;

                        return (
                          <div
                            key={level.id}
                            onClick={() => handleExperienceSelect(level.id)}
                            className={`form-element p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              isSelected
                                ? "border-green-400 bg-green-400/10 shadow-lg shadow-green-400/25"
                                : "border-gray-600/30 bg-gray-900/30 hover:border-green-400/50"
                            }`}
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`p-3 rounded-full bg-gradient-to-r ${
                                  level.color
                                } ${isSelected ? "animate-pulse" : ""}`}
                              >
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4
                                  className={`font-semibold ${
                                    isSelected
                                      ? "text-green-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {level.title}
                                </h4>
                                <p className="text-gray-400 text-sm">
                                  {level.subtitle}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                  {level.description}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                  <Check className="h-4 w-4 text-black" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      onClick={goToPreviousStep}
                      variant="ghost"
                      className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  )}

                  <div className="flex-1" />

                  <Button
                    type="submit"
                    disabled={!canProceed() || isLoading}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-400/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : currentStep === 4 ? (
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4" />
                        <span>Kaydı Tamamla</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              {/* Login Link */}
              <div className="form-element text-center pt-4 border-t border-green-400/20">
                <p className="text-gray-400">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-green-400 hover:text-green-300 font-semibold transition-colors duration-300"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
