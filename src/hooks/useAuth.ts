import { useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Role state is intentionally separate to avoid race conditions where the UI
  // checks isAdmin before the role check finishes.
  const [isAdmin, setIsAdmin] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    // 1) Listen first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setAuthLoading(false);

      // Prevent a render where authLoading=false but the role check hasn't started yet.
      setRoleLoading(Boolean(nextSession?.user));
    });

    // 2) Then hydrate
    supabase.auth
      .getSession()
      .then(({ data: { session: existingSession } }) => {
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setAuthLoading(false);
        setRoleLoading(Boolean(existingSession?.user));
      })
      .catch(() => {
        setAuthLoading(false);
        setRoleLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = user?.id;

    if (!userId) {
      setIsAdmin(false);
      setRoleLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });

        if (cancelled) return;

        if (error) {
          setIsAdmin(false);
          return;
        }

        setIsAdmin(data === true);
      } finally {
        if (!cancelled) setRoleLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/admin/dashboard`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const loading = useMemo(() => authLoading || roleLoading, [authLoading, roleLoading]);

  return {
    user,
    session,
    loading,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
};

