import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Profile } from "@/types";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // İlk yüklemede mevcut session'ı kontrol et
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (session?.user) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: newProfile } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                username: session.user.user_metadata?.name || session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                xp: 0,
                level: 1,
                battles_won: 0,
                battles_lost: 0,
                rank: 1000,
                title: '',
                badge: 'Coder',
                win_rate: 0.0,
                last_active: new Date().toISOString(),
                bio: null,
                location: null,
                preferred_languages: [],
                twitter_url: null,
                github_url: session.user.user_metadata?.user_name ? `https://github.com/${session.user.user_metadata.user_name}` : null,
                website: null
              })
              .select()
              .single();
            
            setProfile(newProfile);
          } else {
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Auth state değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);

      if (session?.user) {
        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { data: newProfile } = await supabase
              .from("profiles")
              .insert({
                id: session.user.id,
                username: session.user.user_metadata?.name || session.user.user_metadata?.user_name || session.user.email?.split('@')[0] || 'user',
                full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || '',
                avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || '',
                xp: 0,
                level: 1,
                battles_won: 0,
                battles_lost: 0,
                rank: 1000,
                title: '',
                badge: 'Coder',
                win_rate: 0.0,
                last_active: new Date().toISOString(),
                bio: null,
                location: null,
                preferred_languages: [],
                twitter_url: null,
                github_url: session.user.user_metadata?.user_name ? `https://github.com/${session.user.user_metadata.user_name}` : null,
                website: null
              })
              .select()
              .single();
            
            setProfile(newProfile);
          } else {
            setProfile(profile);
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, profile, loading };
}
