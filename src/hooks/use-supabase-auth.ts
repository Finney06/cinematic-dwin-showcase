import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const useSupabaseAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      setSession(currentSession);
      setLoading(false);
    };

    loadSession();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
};
