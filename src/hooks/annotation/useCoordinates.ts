export interface ImageSize {
  width: number;
  height: number;
}

export const useCoordinates = () => {
  const getCanvasRect = () => {
    const canvas = document.querySelector('.annotation-canvas') as HTMLElement;
    if (!canvas) return null;

    return canvas.getBoundingClientRect();
  };

  const getScaledCoordinates = (clientX: number, clientY: number) => {
    const canvas = document.querySelector('.annotation-canvas') as HTMLDListElement;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    // Calculate the actual coordinates relative to the canvas
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    return { x, y};
  };

  /** Native (decoded) size of the image currently shown on the canvas, if loaded. */
  const getImageNaturalSize = (): ImageSize | null => {
    const img = document.querySelector('.annotation-canvas img') as HTMLImageElement | null;
    if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
      return { width: img.naturalWidth, height: img.naturalHeight };
    }
    return null;
  };

  /**
   * Convert a normalized (0..1) box size into image pixels.
   *
   * Prefers the size known from the image record, then the decoded image's
   * natural size, and only falls back to the rendered rectangle when neither
   * is available. The rendered rectangle includes the zoom transform, so it
   * would otherwise report screen pixels that change as the user zooms.
   */
  const getPixelSize = (width: number, height: number, imageSize?: ImageSize | null) => {
    const native =
      imageSize && imageSize.width > 0 && imageSize.height > 0
        ? imageSize
        : getImageNaturalSize();

    if (native) {
      return {
        width: Math.round(width * native.width),
        height: Math.round(height * native.height),
      };
    }

    const rect = getCanvasRect();
    if (!rect) return { width: 0, height: 0 };

    return {
      width: Math.round(width * rect.width),
      height: Math.round(height * rect.height)
    };
  };

  return { getScaledCoordinates, getCanvasRect, getPixelSize, getImageNaturalSize };
};
