"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session, SupabaseClient } from "@supabase/supabase-js";
import { createClient, initClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  credits_remaining: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signup" | "signin";
  openAuthModal: (mode?: "signup" | "signin") => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error?: string; message?: string; requiresEmailConfirmation?: boolean }>;
  resendVerificationEmail: (email: string) => Promise<{ error?: string; message?: string }>;
  signInWithOAuth: (provider: "google") => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  deductCredit: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signup" | "signin">("signup");
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  const fetchProfile = useCallback(async (currentUser: User, clientInstance?: SupabaseClient) => {
    const client = clientInstance || createClient();
    try {
      // 1. Try fetching existing profile row from public.profiles
      const { data, error } = await client
        .from("profiles")
        .select("id, email, full_name, avatar_url, credits_remaining")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (data && !error) {
        setProfile({
          id: data.id,
          email: data.email || currentUser.email || null,
          full_name: data.full_name || currentUser.user_metadata?.full_name || null,
          avatar_url: data.avatar_url || currentUser.user_metadata?.avatar_url || null,
          credits_remaining: typeof data.credits_remaining === "number" ? data.credits_remaining : 5,
        });
        return;
      }

      // 2. If row not found (or table not yet created), attempt upsert
      const initialProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || null,
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        credits_remaining: 5, // 5 Free designs granted
      };

      await client
        .from("profiles")
        .upsert(initialProfile, { onConflict: "id" })
        .catch(() => {});

      setProfile(initialProfile);
    } catch {
      // Graceful fallback: local state with 5 free credits
      setProfile({
        id: currentUser.id,
        email: currentUser.email || null,
        full_name: currentUser.user_metadata?.full_name || null,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        credits_remaining: 5,
      });
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupAuth = async () => {
      let client = createClient();
      let configured = isSupabaseConfigured();

      // If client doesn't see NEXT_PUBLIC_* variables, check if server has SUPABASE_URL / SUPABASE_ANON_KEY
      if (!configured) {
        try {
          const res = await fetch("/api/auth/config");
          const data = await res.json();
          if (data.configured && data.url && data.anonKey) {
            client = initClient(data.url, data.anonKey);
            configured = true;
          }
        } catch {
          // Keep configured = false if config endpoint is unreachable
        }
      }

      setIsConfigured(configured);

      if (!configured) {
        // Fallback for demo environments when Supabase is not yet connected
        if (typeof window !== "undefined") {
          const localUser = localStorage.getItem("relive_demo_user");
          if (localUser) {
            try {
              const parsed = JSON.parse(localUser);
              setUser(parsed.user);
              setProfile(parsed.profile);
            } catch {}
          }
        }
        setIsLoading(false);
        return;
      }

      // Supabase is active: check current session
      try {
        const { data } = await client.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
          await fetchProfile(data.session.user, client);
        }
      } catch {
        // Session check fallback
      } finally {
        setIsLoading(false);
      }

      // Listen to Supabase auth state changes
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user, client);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      unsubscribe = () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();

    return () => {
      unsubscribe();
    };
  }, [fetchProfile]);

  const openAuthModal = (mode: "signup" | "signin" = "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const client = createClient();

    if (!isConfigured) {
      // Simulated instant sign-in for preview/local environments
      const fakeUser: any = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: email.split("@")[0] },
      };
      const fakeProfile: UserProfile = {
        id: fakeUser.id,
        email,
        full_name: email.split("@")[0],
        avatar_url: null,
        credits_remaining: 5,
      };
      setUser(fakeUser);
      setProfile(fakeProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem("relive_demo_user", JSON.stringify({ user: fakeUser, profile: fakeProfile }));
      }
      closeAuthModal();
      return {};
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session?.user) {
      setUser(data.session.user);
      await fetchProfile(data.session.user, client);
    }

    closeAuthModal();
    return {};
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const client = createClient();

    if (!isConfigured) {
      const fakeUser: any = {
        id: `demo-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName || email.split("@")[0] },
      };
      const fakeProfile: UserProfile = {
        id: fakeUser.id,
        email,
        full_name: fullName || email.split("@")[0],
        avatar_url: null,
        credits_remaining: 5,
      };
      setUser(fakeUser);
      setProfile(fakeProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem("relive_demo_user", JSON.stringify({ user: fakeUser, profile: fakeProfile }));
      }
      closeAuthModal();
      return { message: "Account created! 5 free room designs are active." };
    }

    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: error.message };
    }

    // If Supabase returned an active session (instant signup / email confirmation disabled)
    if (data.session?.user) {
      setUser(data.session.user);
      await fetchProfile(data.session.user, client);
      closeAuthModal();
      return { message: "Welcome to Relive! 5 free room designs are now active." };
    }

    // If user created but awaiting email confirmation link
    if (data.user) {
      return {
        requiresEmailConfirmation: true,
        message: `We've sent an activation link to ${email}. Please check your inbox (and spam) to confirm your account and claim your 5 free designs.`,
      };
    }

    return {
      requiresEmailConfirmation: true,
      message: "Please check your inbox to confirm your email, then sign in to access your 5 free designs.",
    };
  };

  const resendVerificationEmail = async (email: string) => {
    const client = createClient();
    if (!isConfigured) return {};

    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { message: "Verification email resent! Please check your inbox." };
  };

  const signInWithOAuth = async (provider: "google") => {
    const client = createClient();

    if (!isConfigured) {
      const fakeUser: any = {
        id: `google-${Date.now()}`,
        email: "designer@relive.home",
        user_metadata: { full_name: "Relive Designer" },
      };
      const fakeProfile: UserProfile = {
        id: fakeUser.id,
        email: "designer@relive.home",
        full_name: "Relive Designer",
        avatar_url: null,
        credits_remaining: 5,
      };
      setUser(fakeUser);
      setProfile(fakeProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem("relive_demo_user", JSON.stringify({ user: fakeUser, profile: fakeProfile }));
      }
      closeAuthModal();
      return {};
    }

    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: error.message };
    }
    return {};
  };

  const signOut = async () => {
    const client = createClient();
    if (isConfigured) {
      try {
        await client.auth.signOut();
      } catch {}
    }
    setUser(null);
    setProfile(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("relive_demo_user");
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const deductCredit = async (): Promise<boolean> => {
    // Uncapped generation: users can generate as many designs as they wish
    if (!profile) return true;

    const newCredits = Math.max(0, profile.credits_remaining - 1);
    setProfile((prev) => (prev ? { ...prev, credits_remaining: newCredits } : null));

    if (isConfigured && user) {
      try {
        const client = createClient();
        await client
          .from("profiles")
          .update({ credits_remaining: newCredits, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {}
    } else if (typeof window !== "undefined") {
      const local = localStorage.getItem("relive_demo_user");
      if (local) {
        try {
          const parsed = JSON.parse(local);
          parsed.profile.credits_remaining = newCredits;
          localStorage.setItem("relive_demo_user", JSON.stringify(parsed));
        } catch {}
      }
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isConfigured,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        resendVerificationEmail,
        signInWithOAuth,
        signOut,
        refreshProfile,
        deductCredit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
