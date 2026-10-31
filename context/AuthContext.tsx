"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error?: string; message?: string }>;
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

  const supabase = createClient();

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      // 1. Try fetching existing profile row from public.profiles
      const { data, error } = await supabase
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

      // 2. If row not found (or table not yet migrated), attempt upsert
      const initialProfile: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || null,
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
        avatar_url: currentUser.user_metadata?.avatar_url || null,
        credits_remaining: 5, // 5 Free designs granted
      };

      await supabase.from("profiles").upsert(initialProfile).catch(() => {});
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
  }, [supabase]);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      // Check if temporary simulated demo session exists in localStorage
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

    // Get current auth session from Supabase
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data?.session;
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      }
      setIsLoading(false);
    });

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const openAuthModal = (mode: "signup" | "signin" = "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    closeAuthModal();
    return {};
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
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
      return { message: "Account created! 5 free room designs have been credited to your profile." };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data.session?.user) {
      await fetchProfile(data.session.user);
      closeAuthModal();
      return { message: "Welcome to Relive! 5 free room designs are now active." };
    }

    return {
      message: "Please check your inbox to confirm your email, then sign in to access your 5 free designs.",
    };
  };

  const signInWithOAuth = async (provider: "google") => {
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
    const { error } = await supabase.auth.signInWithOAuth({
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
    if (isConfigured) {
      await supabase.auth.signOut();
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
    if (!profile) return true; // allow preview if not logged in or unlimited
    if (profile.credits_remaining <= 0) {
      return false; // No credits left
    }

    const newCredits = Math.max(0, profile.credits_remaining - 1);
    setProfile((prev) => (prev ? { ...prev, credits_remaining: newCredits } : null));

    if (isConfigured && user) {
      try {
        await supabase
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
