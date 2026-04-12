import React from "react";
import { cn } from "@/lib/utils";

interface MTXLogoProps {
  className?: string;
  compact?: boolean;
  title?: string;
}

export const MTXLogo = ({
  className,
  compact = false,
  title = "Malumetrix Logo",
}: MTXLogoProps) => {
  const id = React.useId();

  const primaryGradientId = `mtx-primary-${id}`;
  const secondaryGradientId = `mtx-secondary-${id}`;

  return (
    <svg
      viewBox={compact ? "0 0 28 40" : "0 0 170 40"}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-auto shrink-0", className)}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMinYMid meet"
    >
      <title>{title}</title>

      <defs>
        <linearGradient id={primaryGradientId} x1="0" y1="0" x2="140" y2="15">
          <stop offset="0%" stopColor="var(--mtx-primary)" />
          <stop offset="50%" stopColor="var(--mtx-secondary)" />
          <stop offset="100%" stopColor="var(--mtx-accent)" />
        </linearGradient>

        <linearGradient id={secondaryGradientId} x1="0" y1="0" x2="120" y2="20">
          <stop offset="0%" stopColor="var(--mtx-primary)" />
          <stop offset="35%" stopColor="var(--mtx-secondary)" />
          <stop offset="70%" stopColor="var(--mtx-accent)" />
          <stop offset="100%" stopColor="var(--mtx-secondary)" />
        </linearGradient>
      </defs>

      {/* M */}
      <text
        x="0"
        y="27"
        fontFamily="Inter, sans-serif"
        fontSize="22"
        fontWeight="800"
        letterSpacing="-0.5"
        fill={`url(#${primaryGradientId})`}
      >
        M
      </text>

      {!compact && (
        <>
          {/* alume */}
          <text
            x="20"
            y="27"
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="500"
            fill="currentColor"
          >
            alume
          </text>

          {/* trix */}
          <text
            x="78"
            y="27"
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="600"
            fill={`url(#${secondaryGradientId})`}
          >
            trix
          </text>
        </>
      )}
    </svg>
  );
};