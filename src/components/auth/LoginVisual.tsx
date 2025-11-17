
import { useState, useEffect } from "react";

interface LoginVisualProps {
  welcomeMessages?: string[];
  rotationInterval?: number;
}

export const LoginVisual = ({
    welcomeMessages=[
        "Structure your vision. Empower your data.",
        "One platform to view it all.",
        "Transform visual data into insights.",
        "Visualize better. Decide smarter."
    ],
    rotationInterval = 7000,
}: LoginVisualProps) => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % welcomeMessages.length);
        }, rotationInterval);
        
        return () => clearInterval(interval);
    }, [welcomeMessages.length, rotationInterval]);
    
    return (
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        {/* Decorative eye pattern elements */}
        <div className="absolute top-1/4 left-1/4 w-28 h-28 rounded-full border-4 border-white/20 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-16 h-16 rounded-full border-2 border-white/10"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full border-2 border-white/15"></div>
        
        <div className="h-full w-full bg-vision-gradient animate-gradient-flow bg-[length:400%_400%] flex flex-col items-center justify-center">
          <div className="max-w-lg p-8 text-white text-center z-10">
            <h2 className="text-4xl font-bold mb-4">Visualize Better</h2>
            <p className="text-xl opacity-90 mb-6">
              {welcomeMessages[messageIndex]}
            </p>
            <div className="mt-8 relative">
              <div className="h-12 w-12 rounded-full border-2 border-white/50 mx-auto"></div>
              <div className="h-8 w-8 rounded-full border-2 border-white/80 absolute top-2 left-1/2 transform -translate-x-1/2"></div>
              <div className="h-4 w-4 rounded-full bg-white/90 absolute top-4 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
}