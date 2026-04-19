import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SAMSuggestion, Point } from '@/types/sam';

interface SAMSuggestionLayerProps {
  suggestions: SAMSuggestion[];
  points: Point[];
  onSelect?: (suggestionId: string) => void;
  onAccept?: (suggestionId: string) => void;
  onReject?: (suggestionId: string) => void;
  selectedSuggestionId?: string;
  hoveredSuggestionId?: string | null;
  onHoverSuggestion?: (id: string | null) => void;
}

// Per-type visual identity used for both SVG polygon and bbox fallback.
const TYPE_STYLE: Record<string, { fill: string; stroke: string; badgeBg: string }> = {
  point:      { fill: 'rgba(59,130,246,0.15)',  stroke: 'rgb(59,130,246)',  badgeBg: 'rgb(59,130,246)' },
  box:        { fill: 'rgba(245,158,11,0.15)',  stroke: 'rgb(245,158,11)', badgeBg: 'rgb(245,158,11)' },
  text:       { fill: 'rgba(139,92,246,0.15)',  stroke: 'rgb(139,92,246)', badgeBg: 'rgb(139,92,246)' },
  similar:    { fill: 'rgba(16,185,129,0.15)',  stroke: 'rgb(16,185,129)', badgeBg: 'rgb(16,185,129)' },
  propagated: { fill: 'rgba(244,63,94,0.15)',   stroke: 'rgb(244,63,94)',  badgeBg: 'rgb(244,63,94)' },
  auto:       { fill: 'rgba(6,182,212,0.15)',   stroke: 'rgb(6,182,212)',  badgeBg: 'rgb(6,182,212)' },
};

const DEFAULT_STYLE = TYPE_STYLE.point;

/** Convert a polygon contour [[x,y],...] to an SVG `points` string (normalized 0‑1 space). */
const toSVGPoints = (polygon: [number, number][]) =>
  polygon.map(([x, y]) => `${x},${y}`).join(' ');

const SAMSuggestionLayer: React.FC<SAMSuggestionLayerProps> = ({
  suggestions,
  points,
  onSelect,
  onAccept,
  onReject,
  selectedSuggestionId,
  hoveredSuggestionId,
  onHoverSuggestion,
}) => {
  const pending = suggestions.filter(s => s.status === 'pending');

  return (
    <div className="absolute inset-0 pointer-events-none">

      {/* ── SVG layer — smooth polygon fills (no pointer events) ──────────── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        style={{ pointerEvents: 'none' }}
      >
        {pending.map((s) => {
          if (!s.polygons?.length) return null;
          const style = TYPE_STYLE[s.type] ?? DEFAULT_STYLE;
          const isHighlighted = selectedSuggestionId === s.id || hoveredSuggestionId === s.id;

          return (
            <g key={s.id}>
              {s.polygons.map((poly, idx) => (
                <polygon
                  key={idx}
                  points={toSVGPoints(poly)}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={isHighlighted ? 0.004 : 0.0025}
                  strokeLinejoin="round"
                  opacity={isHighlighted ? 1 : 0.75}
                  style={{ transition: 'all 0.15s ease' }}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* ── Interactive div layer — badges, bbox fallback, click targets ──── */}
      {pending.map((s) => {
        const { bbox } = s;
        if (!bbox) return null;

        const style = TYPE_STYLE[s.type] ?? DEFAULT_STYLE;
        const isSelected = selectedSuggestionId === s.id;
        const isHovered = hoveredSuggestionId === s.id;
        const isHighlighted = isSelected || isHovered;

        // Badge position: prefer above the box; drop below when near the top edge.
        const badgeAbove = bbox.y > 0.06;

        return (
          <div
            key={s.id}
            onMouseEnter={() => onHoverSuggestion?.(s.id)}
            onMouseLeave={() => onHoverSuggestion?.(null)}
            onClick={() => onSelect?.(s.id)}
            style={{
              position: 'absolute',
              left: `${bbox.x * 100}%`,
              top: `${bbox.y * 100}%`,
              width: `${bbox.width * 100}%`,
              height: `${bbox.height * 100}%`,
              // Only show bbox outline when there are no polygons
              border: s.polygons?.length
                ? 'none'
                : `${isHighlighted ? '3px' : '2px'} dashed ${style.stroke}`,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            className="group"
          >
            {/* Confidence badge + accept/reject buttons */}
            <div
              style={{
                position: 'absolute',
                [badgeAbove ? 'bottom' : 'top']: '100%',
                [badgeAbove ? 'marginBottom' : 'marginTop']: '4px',
                left: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                whiteSpace: 'nowrap',
                zIndex: 10,
              }}
            >
              {s.confidence != null && (
                <div
                  style={{
                    backgroundColor: style.badgeBg,
                    color: 'white',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                    letterSpacing: '0.3px',
                  }}
                >
                  {Math.round(s.confidence * 100)}%
                  {s.suggested_label && ` · ${s.suggested_label}`}
                </div>
              )}

              {/* Accept / Reject — visible on hover or highlight */}
              <div
                className={cn(
                  'flex gap-0.5 transition-opacity duration-150',
                  isHighlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                )}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onAccept?.(s.id); }}
                  className="flex items-center justify-center w-5 h-5 rounded bg-green-600 hover:bg-green-500 text-white shadow-md transition-colors"
                  title="Accept"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onReject?.(s.id); }}
                  className="flex items-center justify-center w-5 h-5 rounded bg-red-600 hover:bg-red-500 text-white shadow-md transition-colors"
                  title="Reject"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Selected indicator dot */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: style.stroke,
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
                }}
              />
            )}
          </div>
        );
      })}

      {/* ── Point markers ────────────────────────────────────────────────── */}
      {points.map((point, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${point.x * 100}%`,
            top: `${point.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer ring */}
          <div
            className="absolute rounded-full border-2 border-white"
            style={{
              width: 18,
              height: 18,
              top: -9,
              left: -9,
              backgroundColor: point.label === 1 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
            }}
          />
          {/* Inner dot */}
          <div
            className="absolute rounded-full border-2 border-white shadow-md"
            style={{
              width: 12,
              height: 12,
              top: -6,
              left: -6,
              backgroundColor: point.label === 1 ? '#22c55e' : '#ef4444',
            }}
          />
          {/* Point number */}
          <div
            className="absolute text-white font-bold"
            style={{
              fontSize: 8,
              top: -4,
              left: -3,
              userSelect: 'none',
            }}
          >
            {i + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SAMSuggestionLayer;
