import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useGlobalStore } from '@/store/globalStore';

const toAuthError = (error: unknown) => {
  if (error instanceof Error) return error;
  return new Error('Authentication request failed. Please try again.');
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const setGlobalUser = useGlobalStore((state) => state.setUser);

  const checkAdminRole = async (userId: string) => {
    try {
      // Use the SECURITY DEFINER has_role() function so the client never
      // reads user_roles directly and cannot bypass RLS.
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (error) throw error;
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setGlobalUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          setTimeout(() => checkAdminRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setGlobalUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkAdminRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setGlobalUser]);

  const signUp = async (email: string, password: string, fullName?: string, redirectTo?: string) => {
    try {
      const redirectUrl = `${window.location.origin}${redirectTo ?? '/'}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName },
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: toAuthError(error) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { data, error };
    } catch (error) {
      return { data: null, error: toAuthError(error) };
    }
  };

  const signInWithMagicLink = async (email: string, redirectTo?: string) => {
    try {
      const redirectUrl = `${window.location.origin}${redirectTo ?? '/'}`;
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: toAuthError(error) };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setGlobalUser(null);
    setIsAdmin(false);
    return { error };
  };

  return { user, session, loading, isAdmin, signUp, signIn, signInWithMagicLink, signOut };
}