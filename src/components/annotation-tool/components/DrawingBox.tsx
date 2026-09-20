import React from 'react';
import { useCoordinates, ImageSize } from '@/hooks/annotation/useCoordinates';
import { INVERSE_ZOOM_SCALE, screenPx, BOX_STROKE_PX, SMALL_OBJECT_PX } from '../canvasScale';
import SizeBadge from './SizeBadge';

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DrawingBoxProps {
  currentBox: Box | null;
  /** Native image size, used to report the live size in image pixels. */
  imageSize?: ImageSize | null;
}

/** Boxes smaller than this (normalized) are discarded on mouse-up in useDraw. */
const MIN_DRAW_SIZE = 0.00625;

/** Screen-pixel gap between the cursor and the live size badge. */
const BADGE_OFFSET_PX = 14;

const DrawingBox: React.FC<DrawingBoxProps> = ({ currentBox, imageSize }) => {
  const { getPixelSize } = useCoordinates();

  if (!currentBox) return null;

  const absW = Math.abs(currentBox.width);
  const absH = Math.abs(currentBox.height);

  // The cursor is always at the "moving" corner of the box.
  const cursorX = currentBox.x + currentBox.width;
  const cursorY = currentBox.y + currentBox.height;

  // Keep the badge inside the image when the cursor nears the right/bottom edge.
  const flipX = cursorX > 0.78;
  const flipY = cursorY > 0.9;
  const tx = flipX ? `calc(-100% - ${BADGE_OFFSET_PX}px)` : `${BADGE_OFFSET_PX}px`;
  const ty = flipY ? `calc(-100% - ${BADGE_OFFSET_PX}px)` : `${BADGE_OFFSET_PX}px`;

  const { width: pxW, height: pxH } = getPixelSize(absW, absH, imageSize);
  const tooSmall = absW <= MIN_DRAW_SIZE || absH <= MIN_DRAW_SIZE;
  const isSmall = pxW <= SMALL_OBJECT_PX && pxH <= SMALL_OBJECT_PX;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${currentBox.width < 0 ? (currentBox.x + currentBox.width) *  100: currentBox.x * 100}%`,
          top: `${currentBox.height < 0 ? (currentBox.y + currentBox.height) *  100: currentBox.y * 100}%`,
          width: `${absW * 100}%`,
          height: `${absH * 100}%`,
          border: `${screenPx(BOX_STROKE_PX)} dashed #3B82F6`,
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointerEvents: 'none'
        }}
      />

      {/* Live size readout, anchored just off the cursor so it never covers the object. */}
      <div
        style={{
          position: 'absolute',
          left: `${cursorX * 100}%`,
          top: `${cursorY * 100}%`,
          // Scale first (cancels zoom), then translate in screen pixels.
          transform: `${INVERSE_ZOOM_SCALE} translate(${tx}, ${ty})`,
          transformOrigin: '0 0',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <SizeBadge
          width={pxW}
          height={pxH}
          isSmall={tooSmall || isSmall}
          message={tooSmall ? 'too small' : undefined}
        />
      </div>
    </>
  );
};

export default DrawingBox;
