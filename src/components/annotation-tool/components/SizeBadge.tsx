import React from 'react';
import { formatSize } from '../canvasScale';

interface SizeBadgeProps {
  /** Object size in image pixels. */
  width: number;
  height: number;
  /** Optional class label shown before the size. */
  label?: string;
  /** Accent color (class color) for the leading swatch. */
  color?: string;
  /** Flag the object as small; renders the badge in a warning tone. */
  isSmall?: boolean;
  /** Overrides the size text (e.g. "too small"). */
  message?: string;
}

/**
 * Compact readout of a box's class and size in image pixels.
 *
 * The badge itself is unaware of zoom; the parent wraps it in a
 * zoom-cancelling transform so it always renders at the same screen size.
 */
export const SizeBadge: React.FC<SizeBadgeProps> = ({
  width,
  height,
  label,
  color,
  isSmall = false,
  message,
}) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded px-1.5 py-[2px] text-[11px] leading-none font-medium text-white shadow-md pointer-events-none select-none whitespace-nowrap"
      style={{
        backgroundColor: isSmall ? 'rgba(220,38,38,0.92)' : 'rgba(17,17,17,0.82)',
        backdropFilter: 'blur(2px)',
      }}
    >
      {label && (
        <>
          {color && (
            <span
              className="inline-block h-2 w-2 rounded-[2px] ring-1 ring-white/70"
              style={{ backgroundColor: color }}
            />
          )}
          <span className="max-w-[140px] truncate">{label}</span>
          <span className="opacity-50">·</span>
        </>
      )}
      <span className="tabular-nums">{message ?? formatSize(width, height)}</span>
    </div>
  );
};

export default SizeBadge;
