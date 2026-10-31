"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ReliveLogo from "./ReliveLogo";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signInWithEmail,
    signUpWithEmail,
    signInWithOAuth,
    isConfigured,
  } = useAuth();

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!email.trim() || !password.trim()) {
          setErrorMsg("Please provide both an email and password.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMsg("Password must be at least 6 characters.");
          setIsLoading(false);
          return;
        }

        const res = await signUpWithEmail(email, password, fullName);
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.message) {
          setSuccessMsg(res.message);
        }
      } else {
        if (!email.trim() || !password.trim()) {
          setErrorMsg("Please enter your email and password.");
          setIsLoading(false);
          return;
        }
        const res = await signInWithEmail(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await signInWithOAuth("google");
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-[#1c1917]/60 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-[#ffffff] rounded-3xl border-2 border-[#e8e2d5] shadow-2xl overflow-hidden z-10 animate-fade-in my-8">
        {/* Top Header Banner with 5 Designs Free offer */}
        <div className="bg-[#faf7f2] border-b border-[#e8e2d5] p-6 pb-5 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-1.5 rounded-full text-[#78716c] hover:text-[#1c1917] hover:bg-[#f4efe6] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <ReliveLogo showTagline={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4efe6] text-[#8c3817] text-xs font-bold border border-[#e8e2d5] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
            <span>5 Free Room Designs Included</span>
          </div>

          <h2 className="text-xl font-extrabold text-[#1c1917]">
            {mode === "signup" ? "Create Your Relive Account" : "Welcome Back to Relive"}
          </h2>
          <p className="text-xs text-[#57534e] mt-1 leading-relaxed">
            {mode === "signup"
              ? "Sign up to start transforming your spaces with 5 free high-definition room makeovers."
              : "Sign in to access your saved spaces, credits, and continuing design projects."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-b border-[#e8e2d5] bg-[#fcfaf7] text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition border-b-2 ${
              mode === "signup"
                ? "border-[#c25e37] text-[#c25e37] bg-white font-extrabold"
                : "border-transparent text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition border-b-2 ${
              mode === "signin"
                ? "border-[#c25e37] text-[#c25e37] bg-white font-extrabold"
                : "border-transparent text-[#78716c] hover:text-[#1c1917]"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#e8e2d5] bg-white hover:bg-[#fcfaf7] text-xs font-bold text-[#1c1917] flex items-center justify-center gap-2.5 shadow-xs transition hover:border-[#c25e37]/40 active:scale-[0.99]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e8e2d5] w-full" />
            <span className="bg-white px-3 text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider absolute">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-bold text-[#1c1917] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#a8a29e] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required={mode === "signup"}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Maya Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#1c1917] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#a8a29e] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1c1917] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#a8a29e] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e8e2d5] text-xs bg-[#faf7f2] focus:outline-none focus:border-[#c25e37] text-[#1c1917] transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#a8a29e] hover:text-[#1c1917]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#c25e37] hover:bg-[#a84e2b] text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === "signup" ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Create Account &bull; 5 Designs Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              ) : (
                <>
                  <span>Sign In to Relive</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>
          </form>

          {/* Benefits strip */}
          <div className="pt-2 border-t border-[#e8e2d5] space-y-1.5 text-[11px] text-[#57534e]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c25e37] flex-shrink-0" />
              <span>5 Complimentary photorealistic room transformations</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c25e37] flex-shrink-0" />
              <span>AI Chat Assistant (Eera) to refine and tweak your makeover</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#c25e37] flex-shrink-0" />
              <span>Instant UHD downloads & 14 interior design aesthetics</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#faf7f2] border-t border-[#e8e2d5] px-6 py-3 text-center text-xs text-[#78716c]">
          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg(null);
                }}
                className="font-bold text-[#c25e37] hover:underline"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                }}
                className="font-bold text-[#c25e37] hover:underline"
              >
                Create Account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
