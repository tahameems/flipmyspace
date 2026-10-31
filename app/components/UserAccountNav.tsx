"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, User as UserIcon, LogOut, ChevronDown, Check, Home } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserAccountNav({ onScrollToStudio }: { onScrollToStudio?: () => void }) {
  const { user, profile, isLoading, openAuthModal, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If user is not logged in, display the "Get 5 designs free" CTA and "Sign In"
  if (!user) {
    return (
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => openAuthModal("signin")}
          className="text-xs font-semibold text-[#57534e] hover:text-[#1c1917] px-3 py-2 rounded-xl hover:bg-[#f4efe6] transition"
        >
          Sign In
        </button>

        <button
          type="button"
          onClick={() => openAuthModal("signup")}
          className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#c25e37] hover:bg-[#a84e2b] rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Get 5 designs free</span>
        </button>
      </div>
    );
  }

  // If user is logged in
  const displayName = profile?.full_name || user.email?.split("@")[0] || "Designer";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const creditsRemaining = profile?.credits_remaining ?? 5;

  return (
    <div className="relative flex items-center gap-3" ref={dropdownRef}>
      {/* Credits Badge */}
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4efe6] border border-[#e8e2d5] text-xs font-bold text-[#8c3817]">
        <Sparkles className="w-3.5 h-3.5 text-[#c25e37]" />
        <span>{creditsRemaining} Free {creditsRemaining === 1 ? "Design" : "Designs"} Left</span>
      </div>

      {/* User Avatar & Dropdown Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-2 rounded-2xl border border-[#e8e2d5] bg-white hover:bg-[#faf7f2] transition shadow-xs text-xs font-bold text-[#1c1917]"
      >
        <div className="w-7 h-7 rounded-full bg-[#c25e37] text-white flex items-center justify-center text-[11px] font-extrabold shadow-xs">
          {initials}
        </div>
        <span className="hidden md:inline max-w-[110px] truncate">{displayName}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#78716c] mr-1" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-12 w-64 rounded-2xl bg-white border border-[#e8e2d5] shadow-xl p-3 z-50 text-xs animate-fade-in space-y-2">
          {/* User Details */}
          <div className="p-2 border-b border-[#e8e2d5] pb-3">
            <div className="font-extrabold text-[#1c1917] truncate">{displayName}</div>
            <div className="text-[11px] text-[#78716c] truncate">{user.email}</div>
          </div>

          {/* Credits Summary */}
          <div className="p-2.5 rounded-xl bg-[#faf7f2] border border-[#e8e2d5] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#1c1917]">Free Design Balance</span>
              <span className="font-extrabold text-[#c25e37]">{creditsRemaining} / 5</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#e8e2d5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#c25e37] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (creditsRemaining / 5) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-[#78716c]">
              Each staging or refinement uses 1 credit.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-1 space-y-1">
            {onScrollToStudio && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onScrollToStudio();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#f4efe6] text-[#1c1917] font-semibold flex items-center gap-2 transition"
              >
                <Home className="w-3.5 h-3.5 text-[#c25e37]" />
                <span>New Room Staging</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                setDropdownOpen(false);
                await signOut();
              }}
              className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-red-50 text-red-700 font-semibold flex items-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
