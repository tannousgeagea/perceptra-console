/**
 * Zoom-invariant sizing helpers for overlays rendered inside the zoomable
 * `.annotation-canvas` element.
 *
 * The canvas content is scaled with a CSS transform, so any overlay drawn in
 * CSS pixels (handles, labels, borders, guide lines) would otherwise grow with
 * the zoom level. `Canvas` publishes the current zoom factor as the `--zoom`
 * custom property on `.annotation-canvas`; overlays use these helpers to
 * divide it back out so they keep a constant size on screen.
 *
 * Doing this in CSS (instead of passing the scale through React props) means
 * zooming does not re-render every annotation.
 */

export const ZOOM_VAR = 'var(--zoom, 1)';

/** A length that measures `px` on screen regardless of the current zoom. */
export const screenPx = (px: number) => `calc(${px}px / ${ZOOM_VAR})`;

/** A transform that cancels the canvas zoom for the element it is applied to. */
export const INVERSE_ZOOM_SCALE = `scale(calc(1 / ${ZOOM_VAR}))`;

/** Visual size of a resize handle on screen (px). */
export const HANDLE_VISUAL_PX = 8;
/** Invisible hit area around a corner handle on screen (px). */
export const HANDLE_HIT_PX = 18;
/** Thickness of the invisible edge-resize strips on screen (px). */
export const EDGE_HIT_PX = 10;
/** Stroke width of a bounding box on screen (px). */
export const BOX_STROKE_PX = 2;

/** Objects at or below this size (in image pixels) are flagged as small. */
export const SMALL_OBJECT_PX = 20;

export const formatSize = (width: number, height: number) => `${width} × ${height} px`;
