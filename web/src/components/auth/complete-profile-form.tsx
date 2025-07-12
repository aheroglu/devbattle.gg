"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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

import { ArrowLeft, Trophy, ArrowRight, Check, User } from "lucide-react";
import { CheckCircle2, AlertCircle } from "lucide-react";

import {
  developerTitles,
  techStackOptions,
  experienceLevels,
} from "./register-options";

interface CompleteProfileFormProps {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      avatar_url?: string;
      name?: string;
      picture?: string;
    };
  };
}

export default function CompleteProfileForm({
  user,
}: CompleteProfileFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // Extract user info from OAuth providers (Google, GitHub)
  const fullName =
    user.user_metadata.full_name || 
    user.user_metadata.name || 
    user.user_metadata.user_name || 
    "";
  const avatarUrl =
    user.user_metadata.avatar_url || 
    user.user_metadata.picture || 
    "";

  const [formData, setFormData] = useState({
    // Step 1 - Username (full name is already from OAuth providers)
    username: "",

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
      // Generate avatar from username if no OAuth avatar
      const finalAvatarUrl =
        avatarUrl ||
        `data:image/svg+xml;base64,${btoa(multiavatar(formData.username))}`;

      // Calculate level number
      const levelNumber =
        formData.experienceLevel === "junior"
          ? 1
          : formData.experienceLevel === "mid"
          ? 2
          : 3;

      // Extract GitHub URL if user signed up with GitHub
      const githubUrl = user.user_metadata.user_name 
        ? `https://github.com/${user.user_metadata.user_name}`
        : null;

      // Update profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          full_name: fullName,
          avatar_url: finalAvatarUrl,
          title: formData.developerTitle,
          preferred_languages: formData.techStack,
          level: levelNumber,
          github_url: githubUrl,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update user metadata to mark profile as completed
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          profile_completed: true,
        },
      });

      if (authError) throw authError;

      // Refresh session to get updated metadata
      await supabase.auth.refreshSession();

      setAlert({
        type: "success",
        message: "Profile completed successfully!",
      });

      // Redirect to home page to ensure middleware picks up the updated profile_completed flag
      router.push("/");
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
        return formData.username;
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
          onClick={() => router.push("/auth/login")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Profile Completion Card */}
          <Card
            ref={cardRef}
            className="bg-black/80 border-green-400/30 backdrop-blur-sm rounded-2xl shadow-2xl shadow-green-400/10"
          >
            <CardHeader className="text-center">
              <CardTitle className="text-green-400 text-xl">
                {currentStep === 1 && "Choose Username"}
                {currentStep === 2 && "Choose Your Path"}
                {currentStep === 3 && "Select Technologies"}
                {currentStep === 4 && "Experience Level"}
              </CardTitle>
              <div className="flex justify-center items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-10 h-10 rounded-full border-2 border-green-400/30"
                  />
                  <div className="text-left">
                    <p className="text-sm text-gray-300">{fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 rounded-full">
                  Complete Profile
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
                {/* Step 1: Username */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-green-400 mb-2">
                        Choose your username
                      </h3>
                      <p className="text-gray-400 text-sm">
                        This will be your display name in battles
                      </p>
                    </div>

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
                    </div>
                  </div>
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
                        <span>Complete Profile</span>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
