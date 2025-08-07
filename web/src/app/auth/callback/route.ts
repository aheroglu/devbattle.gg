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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists in database, if not create it
        let { data: profile, error: profileError } = await supabase
          .from("users")
          .select("title, preferred_languages")
          .eq("id", user.id)
          .single();

        // If user doesn't exist in users table, create it from user_metadata
        if (profileError && profileError.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from("users")
            .insert({
              id: user.id,
              username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
              xp: 0,
              level: user.user_metadata?.level || 1,
              battles_won: 0,
              battles_lost: 0,
              rank: null,
              title: user.user_metadata?.title || null,
              badge: null,
              win_rate: 0,
              preferred_languages: user.user_metadata?.preferred_languages || null,
              full_name: user.user_metadata?.full_name || null,
              website: null,
              github_url: null,
              twitter_url: null,
              bio: null,
              location: null,
              role: 'developer',
              createdAt: new Date(),
              updatedAt: new Date(),
              lastActive: new Date()
            })
            .select("title, preferred_languages")
            .single();

          if (!insertError) {
            profile = newProfile;
          }
        }

        // Check if profile is incomplete (no title or preferred_languages)
        const isProfileIncomplete =
          !profile ||
          !profile.title ||
          !profile.preferred_languages ||
          profile.preferred_languages.length === 0;

        // For signup confirmations or incomplete profiles, redirect to complete profile
        if (type === "signup" || isProfileIncomplete) {
          const response = NextResponse.redirect(
            new URL("/auth/complete-profile", requestUrl.origin)
          );
          response.headers.set("Cache-Control", "no-store, max-age=0");
          return response;
        }

        // For existing users with completed profiles, redirect to home
        const response = NextResponse.redirect(new URL("/", requestUrl.origin));
        response.headers.set("Cache-Control", "no-store, max-age=0");
        return response;
      }
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin));
}
