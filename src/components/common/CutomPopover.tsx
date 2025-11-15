import { useState, useRef, useEffect, ReactNode } from "react";

interface CustomPopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "bottom" | "left" | "right";
}

export const CustomPopover = ({ 
  trigger, 
  children, 
  align = "start",
  side = "bottom" 
}: CustomPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const getAlignmentClass = () => {
    if (side === "bottom" || side === "top") {
      switch (align) {
        case "start": return "left-0";
        case "end": return "right-0";
        case "center": return "left-1/2 -translate-x-1/2";
        default: return "left-0";
      }
    }
    return "";
  };

  const getSideClass = () => {
    switch (side) {
      case "bottom": return "top-full mt-2";
      case "top": return "bottom-full mb-2";
      case "left": return "right-full mr-2";
      case "right": return "left-full ml-2";
      default: return "top-full mt-2";
    }
  };

  return (
    <div className="relative inline-block">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute ${getSideClass()} ${getAlignmentClass()} z-[9999] bg-white border border-gray-200 rounded-md shadow-lg animate-in fade-in-0 zoom-in-95 duration-200`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Hook version for more control
export const usePopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return { isOpen, open, close, toggle };
};