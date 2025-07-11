"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/shared/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { Badge } from "@/components/shared/ui/badge";
import { Code, Eye, EyeOff, Github, Mail, Lock, ArrowLeft } from "lucide-react";
import { InteractiveBackground } from "@/components/shared/interactive-background";
import gsap from "gsap";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/shared/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

// Form şeması
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // GSAP refs
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card giriş animasyonu
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      // Başlık animasyonu
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: "power3.out" }
      );

      // Form elementleri animasyonu
      const formElements = formRef.current?.querySelectorAll(".form-element");
      formElements?.forEach((element, index) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.5 + index * 0.1,
            ease: "power3.out",
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const onSubmit = async (values: LoginValues) => {
    try {
      setIsLoading(true);
      setAlert(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      setTimeout(() => {
        setAlert({
          type: "success",
          message: "Successfully logged in!",
        });
      }, 1000);

      setTimeout(() => {
        router.refresh();
        setTimeout(() => {
          router.push("/profile");
        }, 500);
      }, 2000);
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
      setAlert(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  return (
    <div className="min-h-screen text-green-400 font-mono relative overflow-hidden">
      <InteractiveBackground />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-300 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
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
              <CardTitle ref={titleRef} className="text-green-400 text-xl">
                Welcome Back
              </CardTitle>
              <div className="flex justify-center space-x-2 mt-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-400/30 rounded-full">
                  <Code className="w-3 h-3 mr-1" />
                  SECURE
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                  FAST
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
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl">
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </Button>
                <Button
                  onClick={handleGoogleSignIn}
                  className="form-element w-full bg-gray-900/50 hover:bg-gray-800/70 text-gray-300 hover:text-white border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 rounded-xl"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-5 w-5 mr-2"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                  Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-green-400/20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-500">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <Form {...form}>
                <form
                  ref={formRef}
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                  autoComplete="off"
                >
                  {/* Email Field */}
                  <div className="form-element space-y-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <input
                                type="email"
                                className="w-full bg-gray-900/50 text-green-400 border border-green-400/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50"
                                placeholder="Email"
                                {...field}
                              />
                              <Mail className="absolute right-3 top-3 h-5 w-5 text-green-400/50" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="form-element space-y-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                className="w-full bg-gray-900/50 text-green-400 border border-green-400/30 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50"
                                placeholder="Password"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-green-400/50 hover:text-green-400 transition-colors"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-5 w-5" />
                                ) : (
                                  <Eye className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                      href="/auth/forgot-password"
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
                        <span>Logging in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Lock className="h-4 w-4 mr-2" />
                        <span>Login</span>
                      </div>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Register Link */}
              <div className="form-element text-center pt-4 border-t border-green-400/20">
                <p className="text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/register"
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
            <p>{"// "} Join 10,000+ developers already battling</p>
          </div>
        </div>
      </div>
    </div>
  );
}
