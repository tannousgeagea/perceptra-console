export const useCoordinates = () => {
  const getScaledCoordinates = (clientX: number, clientY: number) => {
    const canvas = document.querySelector('.annotation-canvas') as HTMLDListElement;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();

    // Calculate the actual coordinates relative to the canvas
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    
    return { x, y};
  };

  return { getScaledCoordinates };
};