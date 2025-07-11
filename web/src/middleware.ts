import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/profile", "/profile/[username]", "/settings", "/dashboard"];

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/callback",
  "/auth/forgot-password",
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const path = req.nextUrl.pathname;

  // If user is not logged in and trying to access protected routes, redirect to login
  if (protectedRoutes.some((route) => path.startsWith(route)) && !session) {
    const redirectUrl = new URL("/auth/login", req.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and trying to access public routes, redirect to profile
  if (session && publicRoutes.some((route) => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

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
