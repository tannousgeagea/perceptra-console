import React, { useState } from "react";
import { Button } from "@/components/ui/ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  label: string;
  onAction: () => Promise<void>;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost";
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onAction,
  icon,
  className,
  variant = "default",
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) return;
    setIsLoading(true);
    try {
      await onAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading || disabled}
      variant={variant}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        icon && <span className="mr-2">{icon}</span>
      )}
      {isLoading ? "Processing..." : label}
    </Button>
  );
};
