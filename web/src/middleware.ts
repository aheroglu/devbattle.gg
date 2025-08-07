import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/profile", // Personal profile page
  "/settings", // Settings page
  "/dashboard", // Dashboard
];

// Auth-related routes (redirected when logged in)
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/complete-profile",
  "/auth/forgot-password",
];

// Public routes accessible to everyone (logged in or not)
const publicRoutes = [
  "/", // Home page
  "/battles", // Battle listing
  "/tournaments", // Tournament listing
  "/leaderboard", // Leaderboard
  "/community", // Community
  "/profile/", // Public profile pages /profile/[username]
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // Skip middleware for static files, API routes, and auth callback
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/auth/callback") ||
    path.includes(".")
  ) {
    return res;
  }

  // Helper function to check if route is public
  const isPublicRoute = () => {
    // Check exact public routes
    if (publicRoutes.includes(path)) return true;

    // Check if it's a public profile page /profile/[username]
    if (path.startsWith("/profile/") && path !== "/profile") return true;

    return false;
  };

  // Helper function to check if route is protected
  const isProtectedRoute = () => {
    return protectedRoutes.some((route) => {
      // Exact match for /profile (personal profile)
      if (route === "/profile" && path === "/profile") return true;

      // Prefix match for other routes like /battle/[id], /settings/*
      if (route !== "/profile" && path.startsWith(route)) return true;

      return false;
    });
  };

  // Helper function to check if route is auth-related
  const isAuthRoute = () => {
    return authRoutes.some((route) => path.startsWith(route));
  };

  // Public routes are ALWAYS accessible - highest priority
  if (isPublicRoute()) {
    return res;
  }

  // No session (user not logged in)
  if (!session) {
    // Redirect protected routes to login
    if (isProtectedRoute()) {
      const redirectUrl = new URL("/auth/login", req.url);
      redirectUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(redirectUrl);
    }

    // Allow auth routes for non-logged-in users
    if (isAuthRoute()) {
      return res;
    }

    // Allow access to undefined routes (will be handled by 404)
    return res;
  }

  // Check if profile exists in database
  const { data: profile } = await supabase
    .from("users")
    .select("title, preferred_languages")
    .eq("id", session.user.id)
    .single();

  // Check if profile is incomplete (no title or preferred_languages)
  const isProfileIncomplete =
    !profile ||
    !profile.title ||
    !profile.preferred_languages ||
    profile.preferred_languages.length === 0;

  // If profile not completed
  if (isProfileIncomplete) {
    // Only allow access to complete-profile page
    if (path.startsWith("/auth/complete-profile")) {
      return res;
    }

    // Redirect all other pages to complete-profile
    return NextResponse.redirect(new URL("/auth/complete-profile", req.url));
  }

  // Profile is completed - redirect away from auth pages
  if (isAuthRoute()) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow access to all other routes
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
