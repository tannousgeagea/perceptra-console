import React from "react";
import { cn } from "@/lib/utils";

interface MTXLogoProps {
  className?: string;
  compact?: boolean;
  /** Override badge SVG size via Tailwind (e.g. "w-7 h-7"). Defaults to "w-8 h-8". */
  badgeClassName?: string;
  title?: string;
}

export const MTXLogo = ({
  className,
  compact = false,
  badgeClassName,
  title = "Malumetrix",
}: MTXLogoProps) => {
  const uid = React.useId();
  const gradId = `mtx-badge-grad-${uid}`;

  return (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Badge mark */}
      <svg
        className={cn("shrink-0", badgeClassName ?? "w-8 h-8")}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={title}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5A2DFF" />
            <stop offset="55%" stopColor="#7C3AFF" />
            <stop offset="100%" stopColor="#2970FF" />
          </linearGradient>
        </defs>

        {/* Badge background */}
        <rect width="36" height="36" rx="9" fill={`url(#${gradId})`} />

        {/* Geometric M mark — 5-point path */}
        <path
          d="M7.5 27 L7.5 9.5 L18 19.5 L28.5 9.5 L28.5 27"
          stroke="white"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Wordmark */}
      {!compact && (
        <span
          className="font-outfit leading-none tracking-[-0.015em] text-[var(--mtx-text)]"
          style={{ fontSize: "16px" }}
        >
          <span className="font-light opacity-80">Malu</span>
          <span className="font-semibold">metrix</span>
        </span>
      )}
    </div>
  );
};
