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
  const [isConfigured, setIsConfigured] = useState<boolean>(true);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile({
            id: data.profile.id,
            email: data.profile.email || currentUser.email || null,
            full_name: data.profile.full_name || currentUser.user_metadata?.full_name || null,
            avatar_url: data.profile.avatar_url || currentUser.user_metadata?.avatar_url || null,
            credits_remaining: typeof data.profile.credits_remaining === "number" ? data.profile.credits_remaining : 5,
          });
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default profile state
    setProfile({
      id: currentUser.id,
      email: currentUser.email || null,
      full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null,
      avatar_url: currentUser.user_metadata?.avatar_url || null,
      credits_remaining: 5,
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Check if user is already authenticated via server session
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            const activeUser: any = {
              id: profileData.profile.id,
              email: profileData.profile.email,
              user_metadata: { full_name: profileData.profile.full_name },
            };
            setUser(activeUser);
            setProfile(profileData.profile);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback check
      }

      // Check client-side session if available
      try {
        const client = createClient();
        const { data } = await client.auth.getSession();
        if (data?.session?.user) {
          setUser(data.session.user);
          await fetchProfile(data.session.user);
          setIsLoading(false);
          return;
        }
      } catch {
        // Fallback
      }

      // Check local storage demo user
      if (typeof window !== "undefined") {
        const local = localStorage.getItem("relive_demo_user");
        if (local) {
          try {
            const parsed = JSON.parse(local);
            setUser(parsed.user);
            setProfile(parsed.profile);
          } catch {}
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [fetchProfile]);

  const openAuthModal = (mode: "signup" | "signin" = "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || "Failed to sign in. Please check your credentials." };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
        closeAuthModal();
        return {};
      }

      return { error: "Could not establish session." };
    } catch (err: any) {
      return { error: err.message || "Network error. Please try again." };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName?.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || "Failed to create account. Please try again." };
      }

      if (data.session?.user) {
        setUser(data.session.user);
        await fetchProfile(data.session.user);
        closeAuthModal();
        return { message: "Welcome to Relive! 5 free room designs are now active." };
      }

      if (data.requiresEmailConfirmation) {
        return {
          requiresEmailConfirmation: true,
          message: data.message || `We sent an activation link to ${email}.`,
        };
      }

      return {
        message: data.message || "Account created! You can now sign in.",
      };
    } catch (err: any) {
      return { error: err.message || "Network error. Please try again." };
    }
  };

  const resendVerificationEmail = async (email: string) => {
    try {
      const res = await fetch("/api/auth/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        return { error: data.error || "Could not resend email." };
      }

      return { message: data.message || "Verification email resent! Please check your inbox." };
    } catch (err: any) {
      return { error: err.message || "Failed to resend." };
    }
  };

  const signInWithOAuth = async (provider: "google") => {
    try {
      const client = createClient();
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
    } catch (err: any) {
      return { error: err.message || "OAuth sign-in failed." };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {}

    try {
      const client = createClient();
      await client.auth.signOut();
    } catch {}

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
    // Uncapped generation
    if (!profile) return true;

    const newCredits = Math.max(0, profile.credits_remaining - 1);
    setProfile((prev) => (prev ? { ...prev, credits_remaining: newCredits } : null));

    if (user) {
      try {
        const client = createClient();
        await client
          .from("profiles")
          .update({ credits_remaining: newCredits, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      } catch {}
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
