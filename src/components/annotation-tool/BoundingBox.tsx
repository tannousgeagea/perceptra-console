import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCoordinates, ImageSize } from '@/hooks/annotation/useCoordinates';
import {
  INVERSE_ZOOM_SCALE,
  screenPx,
  HANDLE_VISUAL_PX,
  HANDLE_HIT_PX,
  EDGE_HIT_PX,
  BOX_STROKE_PX,
  SMALL_OBJECT_PX,
} from './canvasScale';
import SizeBadge from './components/SizeBadge';

interface Box {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

interface Props {
  box: Box;
  isSelected: boolean;
  isHighlighted?: boolean;
  tool: 'draw' | 'move' | 'polygon';
  /** Native image size, used to report box dimensions in image pixels. */
  imageSize?: ImageSize | null;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Box>) => void;
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const CORNERS: ResizeDir[] = ['nw', 'ne', 'sw', 'se'];
const EDGES: ResizeDir[] = ['n', 's', 'w', 'e'];

const CURSORS: Record<ResizeDir, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
};

const MIN_SIZE = 0.01;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// Clamp box to stay within image bounds [0, 1]
const clampBox = (x: number, y: number, width: number, height: number) => {
  const clampedX = Math.max(0, Math.min(1 - width, x));
  const clampedY = Math.max(0, Math.min(1 - height, y));
  const clampedWidth = Math.max(MIN_SIZE, Math.min(1 - clampedX, width));
  const clampedHeight = Math.max(MIN_SIZE, Math.min(1 - clampedY, height));

  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight
  };
};

/**
 * Resize `start` by moving the edge(s) named in `dir` to the cursor.
 *
 * Edges not named in `dir` are anchored to their position at drag start, so a
 * corner drag keeps the opposite corner fixed and an edge drag keeps the other
 * three edges fixed, even if the cursor crosses over to the other side.
 */
const resizeFromAnchor = (start: Box, dir: ResizeDir, cursorX: number, cursorY: number) => {
  const cx = clamp01(cursorX);
  const cy = clamp01(cursorY);

  let left = start.x;
  let right = start.x + start.width;
  let top = start.y;
  let bottom = start.y + start.height;

  if (dir.includes('w')) left = cx;
  if (dir.includes('e')) right = cx;
  if (dir.includes('n')) top = cy;
  if (dir.includes('s')) bottom = cy;

  const x = Math.min(left, right);
  const y = Math.min(top, bottom);
  const width = Math.max(MIN_SIZE, Math.abs(right - left));
  const height = Math.max(MIN_SIZE, Math.abs(bottom - top));

  return clampBox(x, y, width, height);
};

const cornerPosition = (dir: ResizeDir): React.CSSProperties => ({
  left: dir.includes('e') ? '100%' : 0,
  top: dir.includes('s') ? '100%' : 0,
});

const edgePosition = (dir: ResizeDir): React.CSSProperties => {
  switch (dir) {
    case 'n': return { left: 0, right: 0, top: 0, height: screenPx(EDGE_HIT_PX), transform: 'translateY(-50%)' };
    case 's': return { left: 0, right: 0, top: '100%', height: screenPx(EDGE_HIT_PX), transform: 'translateY(-50%)' };
    case 'w': return { top: 0, bottom: 0, left: 0, width: screenPx(EDGE_HIT_PX), transform: 'translateX(-50%)' };
    case 'e': return { top: 0, bottom: 0, left: '100%', width: screenPx(EDGE_HIT_PX), transform: 'translateX(-50%)' };
    default: return {};
  }
};

const BoundingBox: React.FC<Props> = ({ box, isSelected, isHighlighted, tool, imageSize, onSelect, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<ResizeDir | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  // Geometry at the moment a resize began; anchors are derived from it.
  const resizeStartRef = useRef<Box | null>(null);
  const { getScaledCoordinates, getPixelSize } = useCoordinates();

  const handleMouseDown = useCallback((e: React.MouseEvent, dir: ResizeDir | null = null) => {
    if (tool !== 'move') return;
    // Only the primary button moves/resizes; middle button is reserved for panning.
    if (e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();
    onSelect();

    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    if (dir) {
      resizeStartRef.current = { ...box };
      setResizing(dir);
    } else {
      setIsDragging(true);
    }

    setDragStart({
      x: x - box.x,
      y: y - box.y
    });
  }, [tool, onSelect, getScaledCoordinates, box]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging && !resizing) return;

    const { x, y } = getScaledCoordinates(e.clientX, e.clientY);

    if (isDragging) {
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;

      // Clamp position to keep box in bounds
      const clamped = clampBox(newX, newY, box.width, box.height);

      onUpdate(box.id, {
        x: clamped.x,
        y: clamped.y
      });
    } else if (resizing) {
      const start = resizeStartRef.current ?? box;
      onUpdate(box.id, resizeFromAnchor(start, resizing, x, y));
    }
  }, [isDragging, resizing, getScaledCoordinates, box, dragStart.x, dragStart.y, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setResizing(null);
    resizeStartRef.current = null;
  }, []);

  useEffect(() => {
    if (isDragging || resizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, resizing, handleMouseMove, handleMouseUp]);

  const { width: pixelWidth, height: pixelHeight } =
    getPixelSize(box.width, box.height, imageSize);

  const isSmall = pixelWidth <= SMALL_OBJECT_PX && pixelHeight <= SMALL_OBJECT_PX;
  const showBadge = isSelected || isHovered;
  const showHandles = isSelected && tool === 'move';

  // Place the badge outside the box: below its bottom-left corner by default,
  // above the top-left corner when there is no room underneath.
  const badgeBelow = box.y + box.height < 0.93;

  const strokeColor = box.color || 'hsl(var(--primary))';
  const handleFill = box.color || 'hsl(var(--primary))';

  const boxShadow = [
    // Zoom-invariant stroke drawn as an inset shadow; unlike `border`, fractional
    // widths are rasterized precisely instead of being snapped to 1px.
    `inset 0 0 0 ${screenPx(isSelected || isHighlighted ? BOX_STROKE_PX + 0.5 : BOX_STROKE_PX)} ${strokeColor}`,
    isHighlighted && !isSelected ? `0 0 ${screenPx(12)} rgba(128,0,255,0.45)` : null,
  ].filter(Boolean).join(', ');

  const boxClasses = [
    'absolute',
    tool === 'move' ? 'cursor-move' : '',
    isSelected ? 'bg-[rgba(128,0,255,0.18)]' : '',
    isHighlighted && !isSelected ? 'bg-[rgba(128,0,255,0.35)]' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={boxClasses}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        boxShadow,
        zIndex: isSelected ? 2 : 1,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showHandles && (
        <>
          {/* Edge strips: invisible, single-axis resize. Rendered first so corners win overlaps. */}
          {EDGES.map((dir) => (
            <div
              key={dir}
              className="absolute"
              style={{ ...edgePosition(dir), cursor: CURSORS[dir] }}
              onMouseDown={(e) => handleMouseDown(e, dir)}
            />
          ))}

          {/* Corner handles: small visual, generous invisible hit area, constant screen size. */}
          {CORNERS.map((dir) => (
            <div
              key={dir}
              className="absolute flex items-center justify-center"
              style={{
                ...cornerPosition(dir),
                width: HANDLE_HIT_PX,
                height: HANDLE_HIT_PX,
                transform: `translate(-50%, -50%) ${INVERSE_ZOOM_SCALE}`,
                cursor: CURSORS[dir],
              }}
              onMouseDown={(e) => handleMouseDown(e, dir)}
            >
              <div
                className="rounded-[1.5px]"
                style={{
                  width: HANDLE_VISUAL_PX,
                  height: HANDLE_VISUAL_PX,
                  backgroundColor: handleFill,
                  boxShadow: '0 0 0 1.5px #fff, 0 1px 3px rgba(0,0,0,0.45)',
                }}
              />
            </div>
          ))}
        </>
      )}

      {/* Class + size readout, kept outside the box so it never covers the object. */}
      {showBadge && (
        <div
          className="absolute left-0 pointer-events-none"
          style={{
            ...(badgeBelow ? { top: '100%' } : { bottom: '100%' }),
            transform: INVERSE_ZOOM_SCALE,
            transformOrigin: badgeBelow ? 'top left' : 'bottom left',
            // Leave room for the corner handle sitting on the edge.
            paddingTop: badgeBelow ? HANDLE_VISUAL_PX - 2 : 0,
            paddingBottom: badgeBelow ? 0 : HANDLE_VISUAL_PX - 2,
            zIndex: 3,
          }}
        >
          <SizeBadge
            width={pixelWidth}
            height={pixelHeight}
            label={box.label || undefined}
            color={box.color || undefined}
            isSmall={isSmall}
          />
        </div>
      )}
    </div>
  );
};

// CRITICAL: Memoization with proper comparison
export default React.memo(BoundingBox, (prev, next) => {
  return (
    prev.box.id === next.box.id &&
    prev.box.x === next.box.x &&
    prev.box.y === next.box.y &&
    prev.box.width === next.box.width &&
    prev.box.height === next.box.height &&
    prev.box.color === next.box.color &&
    prev.box.label === next.box.label &&
    prev.isSelected === next.isSelected &&
    prev.isHighlighted === next.isHighlighted &&
    prev.tool === next.tool &&
    prev.imageSize?.width === next.imageSize?.width &&
    prev.imageSize?.height === next.imageSize?.height &&
    prev.onUpdate === next.onUpdate
  );
});
