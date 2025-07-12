"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import CompleteProfileForm from "@/components/auth/complete-profile-form";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if profile is already completed
      if (user.user_metadata?.profile_completed) {
        router.push("/");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    checkUser();
  }, [router, supabase.auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-green-400 border-green-400/30 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-mono text-green-400">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <CompleteProfileForm user={user} />;
}