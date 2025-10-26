import React, { useRef } from "react";
import Spinner from "../../ui/animation/spinner";

interface Box {
  id: string;
  x: number; // Normalized x-coordinate (0 to 1)
  y: number; // Normalized y-coordinate (0 to 1)
  width: number; // Normalized width (0 to 1)
  height: number; // Normalized height (0 to 1)
  class: string;
  confidence: number; // Confidence score
  color: string; // Color for the bounding box
}

interface ImageCanvasProps {
  imageUrl: string;
  boxes: Box[];
  loading: boolean;
}

const ImageCanvas: React.FC<ImageCanvasProps> = ({ imageUrl, boxes, loading }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const denormalizeBox = (box: Box, containerWidth: number, containerHeight: number) => ({
    x: box.x * containerWidth,
    y: box.y * containerHeight,
    width: box.width * containerWidth,
    height: box.height * containerHeight,
    class: box.class,
    confidence: box.confidence,
    color: box.color,
  });

  const drawBoxes = () => {
    if (!canvasRef.current) return;
    return boxes.map((box) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          const denormalized = denormalizeBox(box, rect.width, rect.height);

          return (
            <div
              key={box.id}
              className="bounding-box"
              style={{
                position: "absolute",
                left: `${denormalized.x}px`,
                top: `${denormalized.y}px`,
                width: `${denormalized.width}px`,
                height: `${denormalized.height}px`,
                border: `1px solid ${denormalized.color}`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: `${denormalized.y < 10 ? "1" : "-20"}px`,
                  left: `${denormalized.x < 10 ? "1" : "-1"}px`,
                  backgroundColor: denormalized.color,
                  color: "#fff",
                  padding: "2px 4px",
                  fontSize: "12px",
                  borderRadius: "3px",
                  width: "auto",
                  whiteSpace: "nowrap"
                }}
              >
                {denormalized.class} {(denormalized.confidence * 100).toFixed(0)}%
              </div>
            </div>
          );
        })
  }

  return (
    <div
      ref={canvasRef}
      className="image-canvas-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        marginBottom: "1rem",
        borderRadius: "0.25rem",
      }}
    >
      <img
        src={imageUrl}
        alt="Predicted Image"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
        draggable={false}
      />
        {loading ? (
            <div className="loading-overlay"
                style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#fff",
                    fontSize: "16px",
                    zIndex: 10,
                 }}>
                <Spinner />
            </div>
        ) : (
            <>
                {drawBoxes()}
            </>
        )
        }
    </div>
  );
};

export default ImageCanvas;
