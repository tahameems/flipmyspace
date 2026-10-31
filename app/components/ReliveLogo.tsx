"use client";

import React from "react";

export function ReliveLogo({
  className = "",
  showTagline = true,
  size = "md",
}: {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizeConfig = {
    sm: {
      svg: "w-9 h-9",
      text: "text-2xl",
      tagline: "text-[11px]",
      gap: "gap-2.5",
    },
    md: {
      svg: "w-12 h-12",
      text: "text-[28px] sm:text-3xl",
      tagline: "text-xs",
      gap: "gap-3.5",
    },
    lg: {
      svg: "w-14 h-14",
      text: "text-4xl",
      tagline: "text-sm",
      gap: "gap-4",
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* House outline with inner green corner wall */}
      <svg
        viewBox="0 0 120 105"
        className={`${currentSize.svg} flex-shrink-0`}
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
        <span className={`font-extrabold ${currentSize.text} tracking-tight text-[#1c1917] leading-none lowercase`}>
          relive
        </span>
        {showTagline && (
          <span className={`${currentSize.tagline} text-[#78716c] font-medium tracking-tight mt-1`}>
            Imagine your home, anew.
          </span>
        )}
      </div>
    </div>
  );
}

export default ReliveLogo;
