import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the current user to check if profile needs completion
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if this is a new user (first time signing in with OAuth)
        const isNewUser = !user.user_metadata?.profile_completed;
        
        // For both signup and new OAuth users, redirect to complete profile
        if ((type === "signup" || isNewUser) && !user.user_metadata?.profile_completed) {
          const response = NextResponse.redirect(
            new URL("/auth/complete-profile", requestUrl.origin)
          );
          response.headers.set("Cache-Control", "no-store, max-age=0");
          return response;
        }
        
        // For existing users with completed profiles, redirect to home
        const response = NextResponse.redirect(
          new URL("/", requestUrl.origin)
        );
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
