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

  const getPixelSize = (width: number, height: number) => {
    const rect = getCanvasRect();
    if (!rect) return { width: 0, height: 0 };

    return {
      width: Math.floor(width * rect.width),
      height: Math.floor(height * rect.height)
    };
  };

  return { getScaledCoordinates, getCanvasRect, getPixelSize };
};