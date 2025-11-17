import { useState, useEffect } from 'react';
import { ScanEye } from 'lucide-react';

interface LoginHeaderProps {
  welcomeMessages?: string[];
  rotationInterval?: number;
}

export const LoginHeader = ({ 
  welcomeMessages = [
    "Welcome back, let's get to work.",
    "Ready to visualize smarter?",
    "Let's transform some data.",
    "Your insights await you.",
    "Structure your vision. Empower your data."
  ],
  rotationInterval = 7000 
}: LoginHeaderProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % welcomeMessages.length);
    }, rotationInterval);
    
    return () => clearInterval(interval);
  }, [welcomeMessages.length, rotationInterval]);

  return (
    <div className="text-center space-y-4 animate-fade-in">
      {/* Logo */}
      <div className="flex justify-center items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <ScanEye className="w-8 h-8 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" />
            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">VisionNest</h1>
        </div>
      </div>

      {/* Welcome Message with fade transition */}
      <div className="min-h-[4rem] flex items-center justify-center">
        <h2 
          key={messageIndex}
          className="text-xl font-semibold text-foreground animate-fade-in"
        >
          {welcomeMessages[messageIndex]}
        </h2>
      </div>

      {/* Subtitle */}
      <p className="text-muted-foreground">
        Sign in to continue to VisionNest
      </p>
    </div>
  );
};
