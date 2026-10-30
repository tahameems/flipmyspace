"use client";

import React from "react";

export function ReliveLogo({
  className = "h-10",
  showTagline = true,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* House outline with inner green corner wall */}
      <svg
        viewBox="0 0 120 105"
        className="w-10 h-10 flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Relive Logo"
      >
        {/* House outer outline in terracotta #c25e37 */}
        <path
          d="M14 92 L14 42 L60 14 L106 42 L106 92 Z"
          stroke="#c25e37"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Inner green architectural corner wall in sage green #7a8c6e */}
        <path
          d="M70 78 L92 78 L92 52"
          stroke="#7a8c6e"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className="flex flex-col justify-center">
        <span className="font-extrabold text-2xl tracking-tight text-[#1c1917] leading-none lowercase">
          relive
        </span>
        {showTagline && (
          <span className="text-[11px] text-[#78716c] font-medium tracking-tight mt-0.5">
            Imagine your home, anew.
          </span>
        )}
      </div>
    </div>
  );
}

export default ReliveLogo;

