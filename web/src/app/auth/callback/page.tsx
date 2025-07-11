"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { searchParams, hash } = new URL(window.location.href);
      const accessToken = hash?.split("&")[0]?.split("=")[1];
      const refreshToken = hash?.split("&")[3]?.split("=")[1];
      const type = searchParams.get("type");

      if (accessToken && type === "signup") {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        router.push("/profile");
      } else if (accessToken && type === "recovery") {
        router.push("/auth/update-password");
      } else {
        router.push("/");
      }
    };

    handleAuthCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-green-400 border-green-400/30 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-mono text-green-400">Redirecting...</h2>
      </div>
    </div>
  );
}
