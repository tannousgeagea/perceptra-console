import React from "react";
import { Annotation } from "@/types/image";

interface BoundingBoxProps {
  annotation: Annotation;
  highlightColor?: string;
  showLabel?: boolean;
  compact?: boolean; // For small grid thumbnails
}

const BoundingBox: React.FC<BoundingBoxProps> = ({
  annotation,
  highlightColor,
  showLabel = true,
  compact = false,
}) => {
  // Fallback to annotation color or default
  const color = highlightColor || annotation.color || "rgba(0, 255, 0, 0.9)";
  const [ x_min, y_min, x_max, y_max ] = annotation.data;

  // Normalized coordinates (0–1) → %
  const left = `${x_min * 100}%`;
  const top = `${y_min * 100}%`;
  const width = `${(x_max - x_min) * 100}%`;
  const height = `${(y_max - y_min) * 100}%`;

  // Label text
  const label = annotation.class_name || "Unknown";

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        width,
        height,
        border: `1.5px solid ${color}`,
        borderRadius: "3px",
        boxShadow: `0 0 4px ${color}`,
        transition: "all 0.2s ease",
      }}
    >
      {/* Light transparent overlay on hover */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: color,
          opacity: 0.15, // adjust for intensity (0.1–0.25 works best)
        }}
      />

      {/* Label */}
      {showLabel && (
        <div
          className={`absolute ${
            compact ? "text-[9px] px-0.5 py-[1px]" : "text-[11px] px-1 py-0.5"
          } rounded font-medium truncate max-w-[90%] top-[-1.2em] left-0`}
          style={{
            backgroundColor: color,
            color: "#000",
            whiteSpace: "nowrap",
          }}
          title={`${label}${
            annotation.confidence
              ? ` (${Math.round(annotation.confidence * 100)}%)`
              : ""
          }`}
        >
          {label}
          {annotation.confidence !== undefined && !compact && (
            <span className="ml-1 opacity-70">
              {Math.round(annotation.confidence * 100)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BoundingBox;
